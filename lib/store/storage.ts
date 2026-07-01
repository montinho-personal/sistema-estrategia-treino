import { createJSONStorage, type StateStorage } from "zustand/middleware";

/**
 * Storage seguro para SSR e testes: usa localStorage no navegador e um mapa em
 * memória fora dele (Node/servidor). Evita ReferenceError e mismatch de hidratação.
 *
 * Esta é a única fronteira de persistência — trocar por um banco de dados no
 * futuro significa reimplementar apenas este arquivo.
 */
const memory = new Map<string, string>();

const backend: StateStorage = {
  getItem: (key) =>
    typeof window !== "undefined"
      ? window.localStorage.getItem(key)
      : (memory.get(key) ?? null),
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    else memory.set(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    else memory.delete(key);
  },
};

export const jsonStorage = createJSONStorage(() => backend);
