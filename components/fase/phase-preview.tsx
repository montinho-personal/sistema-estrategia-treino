"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

import type { PhaseChange } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useBrandStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PhaseDocument } from "./phase-document";

export function PhasePreview({ state, pc, onClose }: { state: StrategyState; pc: PhaseChange; onClose: () => void }) {
  const brand = useBrandStore((s) => s.brand);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="premium-portal">
      <div className="premium-overlay">
        <div className="premium-toolbar">
          <span className="premium-toolbar__t">Troca de fase · pré-visualização</span>
          <Button size="sm" onClick={() => window.print()}>Imprimir / Salvar PDF</Button>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
        <PhaseDocument state={state} pc={pc} brand={brand} />
      </div>
    </div>,
    document.body,
  );
}
