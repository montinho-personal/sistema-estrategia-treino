import type { StrategyState } from "./schema";
import type { Answers, AnswerValue } from "./schema/answers";
import { TOPICS, SEM_PRIORIDADE } from "./config";

/**
 * Pré-preenchimento da entrevista a partir da anamnese: o que já foi
 * respondido na ficha chega marcado na entrevista — o treinador só confirma
 * ou altera. Nunca sobrescreve uma resposta já dada.
 */

/** Minúsculas e sem acentos, para comparar texto livre. */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Objetivo da anamnese → opção equivalente da entrevista. */
const OBJETIVO_MAP: Record<string, string> = {
  performance: "Força e performance",
  competicao: "Preparação para competição",
};

/** Palavras que identificam cada grupo muscular num texto livre. */
const GRUPOS: [string, RegExp][] = [
  ["Costas", /costa|dorsa|latissim|trapezio/],
  ["Peito", /peit/],
  ["Ombros", /ombro|deltoide/],
  ["Braços", /braco|biceps|triceps/],
  ["Quadríceps", /quadriceps|frente da coxa|anterior da coxa/],
  ["Posterior de coxa", /posterior|isquio/],
  ["Glúteos", /glute|bumbum|bunda/],
  ["Panturrilha", /panturrilha/],
  ["Abdômen / Core", /abdom|\bcore\b|barriga/],
];

/** Termos amplos que equivalem a vários grupos. */
const AMPLOS: [RegExp, string[]][] = [
  [/membros inferiores|\binferiores\b/, ["Quadríceps", "Posterior de coxa", "Glúteos"]],
  [/\bpernas?\b/, ["Quadríceps", "Posterior de coxa"]],
  [/membros superiores|\bsuperiores\b/, ["Costas", "Peito", "Ombros", "Braços"]],
];

/** Lê a prioridade escrita na anamnese e devolve as opções da entrevista. */
export function prioridadeFromText(text: string): string[] {
  const t = norm(text ?? "").trim();
  if (!t) return [];
  if (/nenhum|sem prioridade|equilibr|corpo todo|\bgeral\b/.test(t)) return [SEM_PRIORIDADE];
  const out: string[] = [];
  const add = (g: string) => {
    if (!out.includes(g)) out.push(g);
  };
  for (const [g, re] of GRUPOS) if (re.test(t)) add(g);
  for (const [re, gs] of AMPLOS) if (re.test(t)) gs.forEach(add);
  // nada reconhecido: o texto entra como "Outra", para o treinador revisar
  return out.length ? out : [String(text).trim()];
}

function optionsOf(id: string): string[] {
  for (const t of TOPICS) {
    const q = t.questions.find((x) => x.id === id);
    if (q) return q.options ?? [];
  }
  return [];
}

/** Respostas da entrevista que a anamnese já permite deduzir. */
export function anamnesePrefill(state: StrategyState): Answers {
  const a = state.anamnese;
  const out: Answers = {};
  const obj = String(a.objetivo ?? "").trim();
  if (obj) {
    const opt = OBJETIVO_MAP[norm(obj)] ?? obj;
    if (optionsOf("objetivo_principal").includes(opt)) out.objetivo_principal = opt;
  }
  const prioridade = prioridadeFromText(String(a.prioridadeMuscular ?? ""));
  if (prioridade.length) out.objetivo_prioridade = prioridade;
  return out;
}

/** Só o que ainda não foi respondido (nunca sobrescreve o treinador). */
export function missingPrefill(state: StrategyState): Answers {
  const out: Answers = {};
  for (const [id, v] of Object.entries(anamnesePrefill(state))) {
    if (state.answers[id] === undefined && v !== undefined) out[id] = v;
  }
  return out;
}

function sameAnswer(a: AnswerValue | undefined, b: AnswerValue | undefined): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => x === b[i]);
  return a === b;
}

/** A resposta atual ainda é a que veio da anamnese? */
export function isFromAnamnese(state: StrategyState, id: string): boolean {
  const pre = anamnesePrefill(state)[id];
  return pre !== undefined && sameAnswer(pre, state.answers[id]);
}
