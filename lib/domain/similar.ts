import type { Anamnese } from "./schema/anamnese";
import type { Answers } from "./schema/answers";
import type { VolumeRow } from "./schema";
import { TOPICS } from "./config";
import { objetivoDe, type StrategyRecord } from "./insights";
import { prioridadeFromText } from "./prefill";
import { has, val } from "./util";

/**
 * "Começar a partir de uma estratégia parecida": encontra no histórico os
 * alunos com perfil mais próximo do atual e permite reaproveitar as DECISÕES
 * daquela estratégia como ponto de partida. Textos pessoais (porquês,
 * mensagem final) nunca são copiados — eles falam de outro aluno.
 */

function norm(s: unknown): string {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function itemsOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  const s = typeof v === "string" ? v.trim() : "";
  return s ? [s] : [];
}

const num = (v: unknown) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
};

export interface SimilarMatch<T extends StrategyRecord = StrategyRecord> {
  record: T;
  /** 0–100: o quanto o perfil se parece com o do aluno atual. */
  score: number;
  /** Por que é parecida (ex.: "mesmo objetivo", "4 dias/semana"). */
  reasons: string[];
  /** Quantas decisões dá para reaproveitar. */
  decisoes: number;
}

/** Perguntas de decisão (opções clicáveis) — as únicas copiadas da base. */
export function decisionIds(): string[] {
  return TOPICS.flatMap((t) => t.questions.filter((q) => q.type === "choice" || q.type === "multi").map((q) => q.id));
}

const PESO = { mesmoAluno: 30, objetivo: 40, experiencia: 20, dias: 15, diasPerto: 8, tempo: 5, idade: 5, sexo: 5, saude: 5, prioridade: 5 };
const MAX = PESO.objetivo + PESO.experiencia + PESO.dias + PESO.tempo + PESO.idade + PESO.sexo + PESO.saude + PESO.prioridade * 3;

/** Pontua o quanto uma estratégia salva se parece com o aluno atual. */
export function similarity(rec: StrategyRecord, a: Anamnese): { score: number; reasons: string[] } {
  const b = rec.anamnese ?? {};
  let pts = 0;
  const reasons: string[] = [];

  const nomeA = norm(a.nome), nomeB = norm(b.nome || rec.nome);
  if (nomeA && nomeA === nomeB) {
    pts += PESO.mesmoAluno;
    reasons.push("mesmo aluno (ciclo anterior)");
  }
  const objA = norm(a.objetivo);
  if (objA && objA === norm(objetivoDe(rec))) {
    pts += PESO.objetivo;
    reasons.push(val(a.objetivo));
  }
  if (norm(a.experiencia) && norm(a.experiencia) === norm(b.experiencia)) {
    pts += PESO.experiencia;
    reasons.push(val(a.experiencia));
  }
  const dA = num(a.diasSemana), dB = num(b.diasSemana);
  if (dA !== null && dB !== null) {
    if (dA === dB) {
      pts += PESO.dias;
      reasons.push(`${dA} dias/semana`);
    } else if (Math.abs(dA - dB) === 1) {
      pts += PESO.diasPerto;
    }
  }
  const tA = num(a.tempoSessao), tB = num(b.tempoSessao);
  if (tA !== null && tB !== null && Math.abs(tA - tB) <= 15) pts += PESO.tempo;
  const iA = num(a.idade), iB = num(b.idade);
  if (iA !== null && iB !== null && Math.abs(iA - iB) <= 10) pts += PESO.idade;
  if (norm(a.sexo) && norm(a.sexo) === norm(b.sexo)) pts += PESO.sexo;
  const dorA = has(a.dores) || has(a.lesoes), dorB = has(b.dores) || has(b.lesoes);
  if (dorA === dorB) pts += PESO.saude;
  if (dorA && dorB) reasons.push("também com dor/lesão");

  const priA = prioridadeFromText(String(a.prioridadeMuscular ?? "")).map(norm);
  const priB = itemsOf(rec.answers?.objetivo_prioridade).map(norm);
  const comuns = priA.filter((g) => priB.includes(g));
  if (comuns.length) {
    pts += Math.min(comuns.length, 3) * PESO.prioridade;
    const nomes = itemsOf(rec.answers?.objetivo_prioridade).filter((g) => comuns.includes(norm(g)));
    reasons.push(`prioridade: ${nomes.join(", ")}`);
  }

  return { score: Math.min(100, Math.round((pts / MAX) * 100)), reasons };
}

/** As estratégias salvas mais parecidas com o aluno atual (com algo a reaproveitar). */
export function similarStrategies<T extends StrategyRecord>(records: T[], a: Anamnese, limit = 3): SimilarMatch<T>[] {
  const ids = decisionIds();
  return records
    .map((record) => {
      const decisoes = ids.filter((id) => has(record.answers?.[id])).length;
      return { record, decisoes, ...similarity(record, a) };
    })
    .filter((m) => m.decisoes >= 3 && m.score >= 35)
    .sort((x, y) => y.score - x.score || String(y.record.savedAt ?? "").localeCompare(String(x.record.savedAt ?? "")))
    .slice(0, limit);
}

/**
 * Junta as decisões da estratégia-base com as respostas atuais: o que já foi
 * respondido (ex.: vindo da anamnese do aluno atual) é mantido; textos
 * pessoais não são copiados; a tabela de volume só vem se a atual estiver vazia.
 */
export function answersFromBase(
  base: StrategyRecord,
  current: { answers: Answers; volume?: VolumeRow[] },
): { answers: Answers; volume: VolumeRow[]; copiadas: number } {
  const answers: Answers = { ...current.answers };
  let copiadas = 0;
  for (const id of decisionIds()) {
    const v = base.answers?.[id];
    if (!has(v) || has(answers[id])) continue;
    answers[id] = Array.isArray(v) ? [...v] : v;
    copiadas++;
  }
  const atual = current.volume ?? [];
  const volume = atual.length ? atual : (base.volume ?? []).map((r) => ({ ...r }));
  return { answers, volume, copiadas };
}
