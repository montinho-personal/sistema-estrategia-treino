import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Preference } from "@/lib/domain/voice";
import { jsonStorage } from "./storage";

interface PreferencesStore {
  prefs: Record<string, Preference>;
  /** Aprende uma preferência do treinador (método usado + contexto). */
  learnPreference: (id: string, title: string, context?: string) => void;
  clearPreferences: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      prefs: {},
      learnPreference: (id, title, context) =>
        set((s) => {
          const prev = s.prefs[id] ?? { id, title, count: 0, contexts: [] };
          const contexts = prev.contexts ? [...prev.contexts] : [];
          if (context && !contexts.includes(context)) contexts.push(context);
          return {
            prefs: {
              ...s.prefs,
              [id]: { id, title: title || prev.title, count: (prev.count ?? 0) + 1, contexts, lastAt: new Date().toISOString() },
            },
          };
        }),
      clearPreferences: () => set({ prefs: {} }),
    }),
    { name: "mts.prefs.v2", storage: jsonStorage },
  ),
);

/** Lista de preferências ordenada por frequência (mais usadas primeiro). */
export function toPrefList(prefs: Record<string, Preference>): Preference[] {
  return Object.values(prefs).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
}
