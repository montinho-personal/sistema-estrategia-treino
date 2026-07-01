import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createStrategyState } from "@/lib/domain/schema";
import type { StrategyState, Step } from "@/lib/domain/schema";
import type { AnamneseField } from "@/lib/domain/schema/anamnese";
import type { AnswerValue } from "@/lib/domain/schema/answers";
import { jsonStorage } from "./storage";

export interface StrategySnapshotData {
  anamnese: StrategyState["anamnese"];
  answers: StrategyState["answers"];
  overrides: StrategyState["overrides"];
}

interface StrategyActions {
  setAnamnese: (field: AnamneseField, value: string) => void;
  setAnswer: (id: string, value: AnswerValue) => void;
  acknowledge: (id: string) => void;
  setOverride: (sectionId: string, text: string) => void;
  setStep: (step: Step) => void;
  setCurrentQ: (id: string | null) => void;
  patch: (partial: Partial<StrategyState>) => void;
  loadSnapshot: (data: StrategySnapshotData) => void;
  reset: () => void;
}

export type StrategyStore = StrategyState & StrategyActions;

const stamp = () => new Date().toISOString();

export const useStrategyStore = create<StrategyStore>()(
  persist(
    (set) => ({
      ...createStrategyState(),

      setAnamnese: (field, value) =>
        set((s) => ({ anamnese: { ...s.anamnese, [field]: value }, updatedAt: stamp() })),

      setAnswer: (id, value) =>
        set((s) => ({ answers: { ...s.answers, [id]: value }, updatedAt: stamp() })),

      acknowledge: (id) =>
        set((s) => ({ acknowledged: { ...s.acknowledged, [id]: true }, updatedAt: stamp() })),

      setOverride: (sectionId, text) =>
        set((s) => {
          const overrides = { ...s.overrides };
          if (text === "") delete overrides[sectionId];
          else overrides[sectionId] = text;
          return { overrides, updatedAt: stamp() };
        }),

      setStep: (step) => set({ step }),
      setCurrentQ: (currentQ) => set({ currentQ }),

      patch: (partial) => set({ ...partial, updatedAt: stamp() }),

      loadSnapshot: (data) =>
        set({
          ...createStrategyState(),
          anamnese: data.anamnese ?? {},
          answers: data.answers ?? {},
          overrides: data.overrides ?? {},
          step: "relatorio",
          updatedAt: stamp(),
        }),

      reset: () => set({ ...createStrategyState(), updatedAt: stamp() }),
    }),
    {
      name: "mts.strategy.v3",
      storage: jsonStorage,
      version: 1,
      partialize: (s) => ({
        anamnese: s.anamnese,
        answers: s.answers,
        acknowledged: s.acknowledged,
        overrides: s.overrides,
        diagnosisNote: s.diagnosisNote,
        step: s.step,
        currentQ: s.currentQ,
        updatedAt: s.updatedAt,
      }),
    },
  ),
);
