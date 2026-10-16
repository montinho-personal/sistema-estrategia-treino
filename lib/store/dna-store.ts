import { create } from "zustand";
import { persist } from "zustand/middleware";

import { jsonStorage } from "./storage";

export interface StyleSample {
  t: string;
  at: string;
}

/** Última análise da metodologia feita pela IA (guardada para reler depois). */
export interface MethodologyAnalysis {
  text: string;
  at: string;
  /** Quantas estratégias havia no histórico quando a análise foi feita. */
  count: number;
}

interface DnaStore {
  samples: StyleSample[];
  /** Princípios que o treinador escreve livremente — a IA sempre os segue. */
  principles: string;
  analysis: MethodologyAnalysis | null;
  /** Aprende com uma edição de texto feita pelo treinador. */
  learnStyle: (sample: string) => void;
  clearStyle: () => void;
  setPrinciples: (text: string) => void;
  setAnalysis: (analysis: MethodologyAnalysis | null) => void;
}

export const useDnaStore = create<DnaStore>()(
  persist(
    (set) => ({
      samples: [],
      principles: "",
      analysis: null,
      learnStyle: (sample) =>
        set((s) => {
          const text = String(sample ?? "").trim();
          if (!text) return s;
          return { samples: [{ t: text.slice(0, 500), at: new Date().toISOString() }, ...s.samples].slice(0, 20) };
        }),
      clearStyle: () => set({ samples: [] }),
      setPrinciples: (principles) => set({ principles }),
      setAnalysis: (analysis) => set({ analysis }),
    }),
    { name: "mts.dna.v2", storage: jsonStorage },
  ),
);
