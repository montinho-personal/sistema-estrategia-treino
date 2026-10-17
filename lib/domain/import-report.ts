import { ADAPTIVE, ANAMNESE_SECTIONS, TOPICS } from "./config";
import { decisionQuestions } from "./insights";
import type { VolumeRow } from "./schema";
import type { Anamnese, AnamneseField } from "./schema/anamnese";
import type { AnswerValue } from "./schema/answers";
import type { Question, QuestionType } from "./types";
import { has, val } from "./util";

/**
 * Importação de relatórios antigos: a IA lê o relatório já entregue ao aluno
 * (PDF Premium ou texto do WhatsApp) e devolve um JSON; aqui ele é conferido
 * contra as perguntas e opções atuais antes de entrar no histórico.
 */
export interface ImportedStrategy {
  /** Data do relatório (ISO), quando aparece no documento. */
  data: string | null;
  anamnese: Anamnese;
  answers: Record<string, AnswerValue>;
  volume: VolumeRow[];
}

const QUESTIONS: Question[] = [...TOPICS.flatMap((t) => t.questions), ...ADAPTIVE];
const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
const FIELDS = ANAMNESE_SECTIONS.flatMap((s) => s.fields);
const FIELD_BY_ID = new Map(FIELDS.map((f) => [f.id as string, f]));

const TIPO: Record<QuestionType, string> = {
  choice: "escolha única",
  multi: "múltipla escolha",
  text: "texto",
  textarea: "texto",
};

/** Lista as perguntas da estratégia (com as opções válidas) para guiar a IA. */
export function importQuestionGuide(): string {
  const lines: string[] = [];
  for (const t of TOPICS) {
    lines.push(`\n## ${t.n}. ${t.name}`);
    for (const q of [...t.questions, ...ADAPTIVE.filter((a) => a.topic === t.id)]) {
      let line = `- "${q.id}" [${TIPO[q.type]}] ${q.label ?? q.prompt}`;
      if (q.label) line += ` — ${q.prompt}`;
      if (q.options?.length) {
        line += `\n    opções: ${q.options.join(" | ")}${q.allowOther ? " | (outra: texto curto do relatório)" : ""}`;
      }
      lines.push(line);
    }
  }
  return lines.join("\n");
}

/** Normaliza para comparar opções: sem acento, caixa, pontuação ou espaços extras. */
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function matchOption(text: string, options: string[]): string | undefined {
  const n = norm(text);
  if (!n) return undefined;
  const exact = options.find((o) => norm(o) === n);
  if (exact) return exact;
  // opções longas citadas pelo começo ("Dupla progressão" → "Dupla progressão (repetições → carga)")
  if (n.length < 10) return undefined;
  return options.find((o) => norm(o).startsWith(n));
}

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const asStrings = (v: unknown): string[] =>
  (Array.isArray(v) ? v : [v]).map((x) => (x == null || typeof x === "object" ? "" : val(x))).filter(Boolean);

function answerFor(q: Question, v: unknown): AnswerValue | undefined {
  const items = asStrings(v);
  if (!items.length) return undefined;
  if (q.type === "text" || q.type === "textarea") return items.join("\n\n");

  const opts = q.options ?? [];
  const chosen: string[] = [];
  const outros: string[] = [];
  const add = (o: string) => !chosen.includes(o) && chosen.push(o);
  for (const it of items) {
    const o = matchOption(it, opts);
    if (o) {
      add(o);
      continue;
    }
    // "Bi-set, Rest-pause e Drop-set" num texto só: tenta separar em opções
    const parts = q.type === "multi" ? it.split(/\s*(?:[,;]|\s+e\s+)\s*/).filter(Boolean) : [];
    const found = parts.map((p) => matchOption(p, opts));
    if (parts.length > 1 && found.some(Boolean)) {
      parts.forEach((p, i) => {
        const o = found[i];
        if (o) add(o);
        else outros.push(p);
      });
    } else {
      outros.push(it);
    }
  }
  const outra = q.allowOther ? [...new Set(outros)].join(", ") : "";
  if (q.type === "choice") return chosen[0] ?? (outra || undefined);
  const all = outra ? [...chosen, outra] : chosen;
  return all.length ? all : undefined;
}

/** Data do relatório: aceita AAAA-MM-DD ou DD/MM/AAAA; ignora datas inválidas ou futuras. */
export function parseReportDate(v: unknown): string | null {
  const s = val(v);
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const [y, m, d] = iso ? [+iso[1], +iso[2], +iso[3]] : br ? [+br[3], +br[2], +br[1]] : [0, 0, 0];
  if (y < 2000 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d, 12);
  if (date.getMonth() !== m - 1 || date.getTime() > Date.now() + 86_400_000) return null;
  return date.toISOString();
}

function volumeRows(v: unknown): VolumeRow[] {
  const out: VolumeRow[] = [];
  for (const item of Array.isArray(v) ? v : []) {
    const o = obj(item);
    const grupo = val(o.grupo ?? o.grupoMuscular ?? o.musculo).trim();
    const m = val(o.series ?? o["séries"] ?? o.sets).match(/\d+/);
    if (grupo && m && !out.some((r) => norm(r.grupo) === norm(grupo))) out.push({ grupo, series: m[0] });
  }
  return out;
}

/** Confere o JSON devolvido pela IA: só campos, perguntas e opções que existem hoje. */
export function sanitizeImportedStrategy(raw: Record<string, unknown>): ImportedStrategy {
  const anamnese: Anamnese = {};
  for (const [k, v] of Object.entries(obj(raw.anamnese))) {
    const f = FIELD_BY_ID.get(k);
    const s = asStrings(v).join(", ");
    if (!f || !s) continue;
    const value = f.type === "select" && f.options?.length ? matchOption(s, f.options) : s;
    if (value) anamnese[f.id as AnamneseField] = value;
  }

  const answers: Record<string, AnswerValue> = {};
  for (const [k, v] of Object.entries(obj(raw.respostas ?? raw.answers))) {
    const q = QUESTION_BY_ID.get(k);
    const value = q && answerFor(q, v);
    if (q && value !== undefined) answers[q.id] = value;
  }

  return { data: parseReportDate(raw.data), anamnese, answers, volume: volumeRows(raw.volume) };
}

export interface ImportSummary {
  perfil: { label: string; value: string }[];
  decisoes: { id: string; label: string; value: string[] }[];
  /** Respostas em texto recuperadas (porquês, vantagens, mensagem…). */
  textos: number;
  /** Tópicos cuja decisão principal não apareceu no relatório. */
  faltando: string[];
}

/** Resumo para o treinador conferir antes de salvar. */
export function importSummary(imp: ImportedStrategy): ImportSummary {
  const perfil = FIELDS.filter((f) => f.id !== "nome" && f.id !== "tituloPlano" && has(imp.anamnese[f.id])).map(
    (f) => ({ label: f.label, value: val(imp.anamnese[f.id]) }),
  );
  const decisoes = decisionQuestions()
    .filter((d) => has(imp.answers[d.id]))
    .map((d) => {
      const v = imp.answers[d.id];
      return { id: d.id, label: d.label, value: Array.isArray(v) ? v : [v] };
    });
  const textos = Object.entries(imp.answers).filter(([id, v]) => {
    const t = QUESTION_BY_ID.get(id)?.type;
    return (t === "text" || t === "textarea") && has(v);
  }).length;
  const faltando = TOPICS.filter((t) => !has(imp.answers[t.mainQ])).map((t) => t.name);
  return { perfil, decisoes, textos, faltando };
}

/** Quantas informações da estratégia foram recuperadas (respostas + linhas de volume). */
export function importedCount(imp: ImportedStrategy): number {
  return Object.keys(imp.answers).length + imp.volume.length;
}
