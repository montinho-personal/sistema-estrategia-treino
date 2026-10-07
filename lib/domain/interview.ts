import { TOPICS, ADAPTIVE, CONSISTENCY_RULES } from "./config";
import type { Question, Topic, ConsistencyNote } from "./types";
import type { StrategyState } from "./schema";
import { has } from "./util";

export interface PlanItem {
  q: Question;
  topic: Topic;
}

export interface MissingItem {
  topic: Topic;
  q: Question | undefined;
  id: string;
}

export interface Progress {
  answered: number;
  total: number;
  pct: number;
}

/** Perguntas aplicáveis de um tópico (fixas por condição + adaptativas). */
export function questionsForTopic(topic: Topic, state: StrategyState): Question[] {
  const a = state.anamnese;
  const ans = state.answers;
  const list: Question[] = [];
  for (const q of topic.questions) {
    if (q.condition && !q.condition(a, ans)) continue;
    list.push(q);
  }
  for (const aq of ADAPTIVE) {
    if (aq.topic === topic.id && aq.when(a)) list.push(aq);
  }
  return list;
}

/** Plano completo da entrevista na ordem dos tópicos (todas as perguntas). */
export function plan(state: StrategyState): PlanItem[] {
  const out: PlanItem[] = [];
  for (const topic of TOPICS) {
    for (const q of questionsForTopic(topic, state)) out.push({ q, topic });
  }
  return out;
}

/**
 * Entrevista mínima: apenas a pergunta ESSENCIAL (principal) de cada tópico.
 * É sobre esta lista que a navegação e o progresso da entrevista acontecem —
 * os "porquês" e detalhes viram complementos opcionais (a IA + Biblioteca
 * preenchem o que o treinador deixar em branco).
 */
export function essentialItems(state: StrategyState): PlanItem[] {
  const out: PlanItem[] = [];
  for (const topic of TOPICS) {
    const qs = questionsForTopic(topic, state);
    const main = qs.find((q) => q.id === topic.mainQ) ?? qs[0];
    if (main) out.push({ q: main, topic });
  }
  return out;
}

/** Perguntas complementares de um tópico (porquê, opcionais e adaptativas). */
export function extraQuestionsForTopic(topic: Topic, state: StrategyState): Question[] {
  return questionsForTopic(topic, state).filter((q) => q.id !== topic.mainQ);
}

export function isAnswered(q: Question, state: StrategyState): boolean {
  return has(state.answers[q.id]);
}

export function progress(state: StrategyState): Progress {
  const p = essentialItems(state);
  const answered = p.filter((it) => isAnswered(it.q, state)).length;
  return { answered, total: p.length, pct: p.length ? Math.round((answered / p.length) * 100) : 0 };
}

/**
 * Perguntas obrigatórias faltando: apenas a principal de cada tópico. Os
 * "porquês" deixaram de ser obrigatórios — a IA + Biblioteca os geram quando o
 * treinador não escreve. Assim a entrevista fica mínima sem perder o relatório.
 */
export function requiredMissing(state: StrategyState): MissingItem[] {
  const missing: MissingItem[] = [];
  for (const topic of TOPICS) {
    if (!topic.mainQ) continue;
    if (!has(state.answers[topic.mainQ])) {
      const q = topic.questions.find((x) => x.id === topic.mainQ);
      missing.push({ topic, q, id: topic.mainQ });
    }
  }
  return missing;
}

export function isComplete(state: StrategyState): boolean {
  return requiredMissing(state).length === 0;
}

function ids(state: StrategyState): string[] {
  return essentialItems(state).map((it) => it.q.id);
}

export function firstUnanswered(state: StrategyState): string | null {
  const p = essentialItems(state);
  for (const it of p) if (!isAnswered(it.q, state)) return it.q.id;
  return p.length ? p[0].q.id : null;
}

export function currentId(state: StrategyState): string | null {
  const list = ids(state);
  if (state.currentQ && list.includes(state.currentQ)) return state.currentQ;
  return firstUnanswered(state);
}

export function neighbor(state: StrategyState, id: string, dir: 1 | -1): string | null {
  const list = ids(state);
  const i = list.indexOf(id);
  if (i === -1) return null;
  const j = i + dir;
  return j >= 0 && j < list.length ? list[j] : null;
}

export function firstIdOfTopic(state: StrategyState, topicId: string): string | null {
  const item = plan(state).find((it) => it.topic.id === topicId);
  return item ? item.q.id : null;
}

export function itemById(state: StrategyState, id: string): PlanItem | null {
  return plan(state).find((it) => it.q.id === id) ?? null;
}

/** Inconsistências pendentes (exclui as já reconhecidas pelo treinador). */
export function consistency(state: StrategyState): ConsistencyNote[] {
  const out: ConsistencyNote[] = [];
  for (const rule of CONSISTENCY_RULES) {
    const note = rule(state.anamnese, state.answers);
    if (note && !state.acknowledged[note.id]) out.push(note);
  }
  return out;
}
