import { hasContent, sameStrategy } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useHistoryStore, type StrategySnapshot } from "./history-store";
import { useStrategyStore } from "./strategy-store";

export type AutoSaveResult =
  /** Nada a guardar (sem nome nem respostas). */
  | { kind: "skip" }
  /** Já está no histórico exatamente assim. */
  | { kind: "unchanged"; snap: StrategySnapshot }
  /** Entrou no histórico agora. */
  | { kind: "created"; snap: StrategySnapshot }
  /** A entrada desta estratégia foi atualizada. */
  | { kind: "updated"; snap: StrategySnapshot }
  /** Veio do histórico e mudou: virou nova versão; a anterior foi mantida. */
  | { kind: "version"; snap: StrategySnapshot; previous: StrategySnapshot };

/** A entrada do histórico ligada à estratégia em edição (se ainda existir). */
function linkedSnapshot(): StrategySnapshot | undefined {
  const { sourceId } = useStrategyStore.getState();
  return sourceId ? useHistoryStore.getState().getSnapshot(sourceId) : undefined;
}

/**
 * Guarda a estratégia no histórico ao gerar o relatório (WhatsApp ou PDF), sem
 * duplicar: a mesma estratégia é atualizada; uma estratégia aberta do histórico
 * nunca é sobrescrita sozinha — se mudou, vira nova versão (novo ciclo).
 */
export function autoSaveStrategy(state: StrategyState): AutoSaveResult {
  if (!hasContent(state)) return { kind: "skip" };
  const history = useHistoryStore.getState();
  const { sourceOwned, setSource } = useStrategyStore.getState();
  const current = linkedSnapshot();

  if (current && sameStrategy(current, state)) return { kind: "unchanged", snap: current };
  if (current && sourceOwned) {
    const snap = history.updateSnapshot(current.id, state);
    if (snap) return { kind: "updated", snap };
  }
  const snap = history.saveSnapshot(state);
  setSource(snap.id, true);
  return current ? { kind: "version", snap, previous: current } : { kind: "created", snap };
}

/** Desfaz a "nova versão": aplica as mudanças na entrada anterior e remove a cópia. */
export function replacePreviousVersion(state: StrategyState, result: Extract<AutoSaveResult, { kind: "version" }>) {
  const history = useHistoryStore.getState();
  const updated = history.updateSnapshot(result.previous.id, state);
  if (!updated) return undefined;
  history.deleteSnapshot(result.snap.id);
  useStrategyStore.getState().setSource(updated.id, true);
  return updated;
}

/** A estratégia em edição tem algo que ainda não está no histórico? */
export function hasUnsavedWork(): boolean {
  const state = useStrategyStore.getState();
  if (!hasContent(state)) return false;
  const current = linkedSnapshot();
  return !current || !sameStrategy(current, state);
}

/** Aviso para confirmar antes de descartar a estratégia em edição. */
export function unsavedWarning(): string {
  const nome = String(useStrategyStore.getState().anamnese.nome ?? "").trim();
  return (
    `A estratégia atual${nome ? ` (${nome})` : ""} ainda não está salva no histórico e será perdida. ` +
    "Para guardá-la, cancele e gere o relatório (WhatsApp ou PDF) ou toque em “Salvar no histórico”."
  );
}
