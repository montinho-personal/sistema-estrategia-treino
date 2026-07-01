"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Retorna false no servidor e true no cliente após a montagem.
 * Usado para adiar a renderização que depende do estado persistido, evitando
 * mismatch de hidratação entre servidor (defaults) e cliente (localStorage).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
