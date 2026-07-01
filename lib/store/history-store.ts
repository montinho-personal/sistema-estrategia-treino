import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { StrategyState } from "@/lib/domain/schema";
import { firstName } from "@/lib/domain/util";
import { jsonStorage } from "./storage";
import type { StrategySnapshotData } from "./strategy-store";

export interface StrategySnapshot extends StrategySnapshotData {
  id: string;
  nome: string;
  savedAt: string;
}

interface HistoryStore {
  snapshots: StrategySnapshot[];
  /** Salva a estratégia atual no histórico (base para comparar ciclos). */
  saveSnapshot: (state: StrategyState) => StrategySnapshot;
  /** Atualiza um snapshot existente com o estado atual (mantém id e nome). */
  updateSnapshot: (id: string, state: StrategyState) => StrategySnapshot | undefined;
  getSnapshot: (id: string) => StrategySnapshot | undefined;
  deleteSnapshot: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      snapshots: [],
      saveSnapshot: (state) => {
        const nome = firstName(state.anamnese.nome) === "aluno" ? "Aluno sem nome" : String(state.anamnese.nome).trim();
        const snap: StrategySnapshot = {
          id: `s_${Date.now()}_${get().snapshots.length}`,
          nome,
          savedAt: new Date().toISOString(),
          anamnese: structuredClone(state.anamnese),
          answers: structuredClone(state.answers),
          overrides: structuredClone(state.overrides),
          volume: structuredClone(state.volume),
        };
        set((s) => ({ snapshots: [snap, ...s.snapshots].slice(0, 50) }));
        return snap;
      },
      updateSnapshot: (id, state) => {
        const current = get().snapshots.find((s) => s.id === id);
        if (!current) return undefined;
        const updated: StrategySnapshot = {
          ...current,
          savedAt: new Date().toISOString(),
          anamnese: structuredClone(state.anamnese),
          answers: structuredClone(state.answers),
          overrides: structuredClone(state.overrides),
          volume: structuredClone(state.volume),
        };
        set((s) => ({ snapshots: s.snapshots.map((x) => (x.id === id ? updated : x)) }));
        return updated;
      },
      getSnapshot: (id) => get().snapshots.find((s) => s.id === id),
      deleteSnapshot: (id) => set((s) => ({ snapshots: s.snapshots.filter((x) => x.id !== id) })),
    }),
    { name: "mts.history.v2", storage: jsonStorage },
  ),
);
