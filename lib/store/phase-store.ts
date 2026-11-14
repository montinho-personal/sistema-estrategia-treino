import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PhaseChange } from "@/lib/domain";
import { jsonStorage } from "./storage";

/** Chave do aluno: o documento de troca de fase fica guardado por aluno. */
export const phaseKey = (nome: unknown) =>
  String(nome ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim() || "_";

interface PhaseStore {
  drafts: Record<string, PhaseChange>;
  setDraft: (key: string, pc: PhaseChange) => void;
  removeDraft: (key: string) => void;
}

export const usePhaseStore = create<PhaseStore>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (key, pc) => set((s) => ({ drafts: { ...s.drafts, [key]: pc } })),
      removeDraft: (key) =>
        set((s) => {
          const drafts = { ...s.drafts };
          delete drafts[key];
          return { drafts };
        }),
    }),
    { name: "mts.fase.v1", storage: jsonStorage },
  ),
);
