import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { StrategyState } from "@/lib/domain/schema";
import { firstName } from "@/lib/domain/util";
import { jsonStorage } from "./storage";
import type { StrategySnapshotData } from "./strategy-store";

/** Quantas estratégias o histórico guarda (base do painel e da memória da IA). */
export const HISTORY_LIMIT = 200;

export interface StrategySnapshot extends StrategySnapshotData {
  id: string;
  nome: string;
  /** Data da estratégia (base da ordem dos ciclos) — não muda ao atualizar. */
  savedAt: string;
  /** Última atualização, quando houve. */
  updatedAt?: string;
  /** "importado": reconstruída pela IA a partir de um relatório antigo. */
  origem?: "importado";
}

/** Estratégia montada fora do editor (ex.: importada de um relatório antigo). */
export interface NewSnapshotData extends StrategySnapshotData {
  nome?: string;
  savedAt?: string;
  origem?: "importado";
}

const nomeDe = (anamnese: StrategySnapshotData["anamnese"]) =>
  firstName(anamnese?.nome) === "aluno" ? "Aluno sem nome" : String(anamnese?.nome).trim();

interface HistoryStore {
  snapshots: StrategySnapshot[];
  /** Salva a estratégia atual no histórico (base para comparar ciclos). */
  saveSnapshot: (state: StrategyState) => StrategySnapshot;
  /** Atualiza um snapshot existente com o estado atual (mantém id e nome). */
  updateSnapshot: (id: string, state: StrategyState) => StrategySnapshot | undefined;
  /** Adiciona uma estratégia pronta ao histórico (ex.: relatório importado). */
  addSnapshot: (data: NewSnapshotData) => StrategySnapshot;
  getSnapshot: (id: string) => StrategySnapshot | undefined;
  deleteSnapshot: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      snapshots: [],
      saveSnapshot: (state) => get().addSnapshot(state),
      addSnapshot: (data) => {
        const snap: StrategySnapshot = {
          id: `s_${Date.now()}_${get().snapshots.length}`,
          nome: data.nome?.trim() || nomeDe(data.anamnese),
          savedAt: data.savedAt ?? new Date().toISOString(),
          ...(data.origem ? { origem: data.origem } : {}),
          anamnese: structuredClone(data.anamnese ?? {}),
          answers: structuredClone(data.answers ?? {}),
          overrides: structuredClone(data.overrides ?? {}),
          volume: structuredClone(data.volume ?? []),
        };
        set((s) => ({ snapshots: [snap, ...s.snapshots].slice(0, HISTORY_LIMIT) }));
        return snap;
      },
      updateSnapshot: (id, state) => {
        const current = get().snapshots.find((s) => s.id === id);
        if (!current) return undefined;
        const updated: StrategySnapshot = {
          ...current,
          nome: nomeDe(state.anamnese) === "Aluno sem nome" ? current.nome : nomeDe(state.anamnese),
          updatedAt: new Date().toISOString(),
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
