"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStrategyStore, useHydrated } from "@/lib/store";

/** Retoma o fluxo no passo atual (ou inicia na anamnese). */
export default function AlunosIndex() {
  const router = useRouter();
  const hydrated = useHydrated();
  const step = useStrategyStore((s) => s.step);

  useEffect(() => {
    if (hydrated) router.replace(`/alunos/${step}`);
  }, [hydrated, step, router]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  );
}
