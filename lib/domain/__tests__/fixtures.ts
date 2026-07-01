import { createStrategyState } from "../schema";
import type { StrategyState } from "../schema";
import type { Anamnese } from "../schema/anamnese";
import type { Answers } from "../schema/answers";
import { plan } from "../interview";

/** Constrói um estado de estratégia para os testes. */
export function makeState(anamnese: Anamnese = {}, answers: Answers = {}): StrategyState {
  const s = createStrategyState();
  s.anamnese = anamnese;
  s.answers = answers;
  return s;
}

/** Preenche todas as respostas obrigatórias (main + why) do plano atual. */
export function fillAllRequired(state: StrategyState): StrategyState {
  for (const { q } of plan(state)) {
    if (state.answers[q.id] !== undefined) continue;
    if (q.type === "multi") state.answers[q.id] = [q.options?.[0] ?? "x"];
    else if (q.type === "choice") state.answers[q.id] = q.options?.[0] ?? "x";
    else state.answers[q.id] = `resposta ${q.id}`;
  }
  return state;
}
