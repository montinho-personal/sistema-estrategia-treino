import type { StrategyState } from "./schema";
import { has } from "./util";

/** O que define o conteúdo de uma estratégia salva (sem metadados de navegação). */
export interface StrategyContent {
  anamnese?: StrategyState["anamnese"];
  answers?: StrategyState["answers"];
  overrides?: StrategyState["overrides"];
  volume?: StrategyState["volume"];
}

/** Remove valores vazios e ordena as chaves (comparação estável). */
function clean(obj: Record<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj ?? {}).sort()) {
    const v = obj?.[k];
    if (has(v)) out[k] = Array.isArray(v) ? v.map((x) => String(x).trim()) : String(v).trim();
  }
  return out;
}

/** Chave canônica do conteúdo — campos tocados e apagados não contam como mudança. */
export function strategyKey(c: StrategyContent): string {
  return JSON.stringify({
    anamnese: clean(c.anamnese as Record<string, unknown>),
    answers: clean(c.answers as Record<string, unknown>),
    overrides: clean(c.overrides),
    volume: (c.volume ?? [])
      .map((r) => ({ grupo: String(r.grupo ?? "").trim(), series: String(r.series ?? "").trim() }))
      .filter((r) => r.grupo || r.series),
  });
}

/** As duas estratégias têm o mesmo conteúdo? */
export function sameStrategy(a: StrategyContent, b: StrategyContent): boolean {
  return strategyKey(a) === strategyKey(b);
}

/** Há algo que valha guardar (nome do aluno ou ao menos uma resposta)? */
export function hasContent(c: StrategyContent): boolean {
  return has(c.anamnese?.nome) || Object.values(c.answers ?? {}).some(has);
}
