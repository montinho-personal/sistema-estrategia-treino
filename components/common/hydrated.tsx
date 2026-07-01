"use client";

import type { ReactNode } from "react";

import { useHydrated } from "@/lib/store";

/**
 * Renderiza os filhos apenas após a hidratação (quando o estado persistido já
 * está disponível). Antes disso, mostra o fallback — evita mismatch de SSR.
 */
export function Hydrated({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useHydrated() ? <>{children}</> : <>{fallback}</>;
}
