import { create } from "zustand";
import { persist } from "zustand/middleware";

import { jsonStorage } from "./storage";

export const DEFAULT_AI_MODEL = "claude-sonnet-5";

export interface AiConfig {
  key: string;
  model: string;
}

interface AiStore {
  config: AiConfig;
  configured: () => boolean;
  setConfig: (config: Partial<AiConfig>) => void;
  clearConfig: () => void;
}

/**
 * Configuração da IA opcional (bring-your-own-key). A chave fica apenas neste
 * navegador — a camada de IA usada em fases posteriores a lê daqui.
 */
export const useAiStore = create<AiStore>()(
  persist(
    (set, get) => ({
      config: { key: "", model: "" },
      configured: () => Boolean(get().config.key),
      setConfig: (config) => set((s) => ({ config: { ...s.config, ...config } })),
      clearConfig: () => set({ config: { key: "", model: "" } }),
    }),
    {
      name: "mts.ai.v2",
      storage: jsonStorage,
      partialize: (s) => ({ config: s.config }),
    },
  ),
);
