"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { useStrategyStore } from "@/lib/store";

export function WorkspaceNav() {
  const router = useRouter();
  const reset = useStrategyStore((s) => s.reset);

  function novaEstrategia() {
    if (confirm("Começar uma nova estratégia? Os dados atuais deste navegador serão apagados.")) {
      reset();
      router.push("/alunos/anamnese");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" aria-label="Início">
          <BrandLockup />
        </Link>
        <Button variant="outline" size="sm" onClick={novaEstrategia}>
          <RefreshCw className="size-4" />
          Nova estratégia
        </Button>
      </div>
    </header>
  );
}
