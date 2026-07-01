import { create } from "zustand";
import { persist } from "zustand/middleware";

import { jsonStorage } from "./storage";

export interface StyleSample {
  t: string;
  at: string;
}

interface DnaStore {
  samples: StyleSample[];
  /** Aprende com uma edição de texto feita pelo treinador. */
  learnStyle: (sample: string) => void;
  clearStyle: () => void;
}

export const useDnaStore = create<DnaStore>()(
  persist(
    (set) => ({
      samples: [],
      learnStyle: (sample) =>
        set((s) => {
          const text = String(sample ?? "").trim();
          if (!text) return s;
          return { samples: [{ t: text.slice(0, 500), at: new Date().toISOString() }, ...s.samples].slice(0, 20) };
        }),
      clearStyle: () => set({ samples: [] }),
    }),
    { name: "mts.dna.v2", storage: jsonStorage },
  ),
);
