"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { StrategyState } from "@/lib/domain/schema";
import { useBrandStore } from "@/lib/store";
import { firstName } from "@/lib/domain/util";
import { PREMIUM_CSS } from "@/lib/premium/premium-css";
import { Button } from "@/components/ui/button";
import { PremiumDocument } from "./premium-document";

export function PremiumPreview({ state, onClose }: { state: StrategyState; onClose: () => void }) {
  const brand = useBrandStore((s) => s.brand);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function exportHtml() {
    const el = ref.current;
    if (!el) return;
    const nome = firstName(state.anamnese.nome) === "aluno" ? "aluno" : String(state.anamnese.nome).trim();
    const html =
      `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<title>Estratégia de Treino — ${nome}</title>` +
      `<link rel="preconnect" href="https://fonts.googleapis.com">` +
      `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">` +
      `<style>${PREMIUM_CSS}\nbody{background:#eef0f3;margin:0}.premium{margin:24px auto}</style></head>` +
      `<body>${el.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Estrategia - ${nome}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return createPortal(
    <div className="premium-portal">
      <div className="premium-overlay">
        <div className="premium-toolbar">
          <span className="premium-toolbar__t">PDF Premium · pré-visualização</span>
          <Button variant="outline" size="sm" onClick={exportHtml}>Exportar HTML</Button>
          <Button size="sm" onClick={() => window.print()}>Imprimir / Salvar PDF</Button>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
        <PremiumDocument state={state} brand={brand} containerRef={ref} />
      </div>
    </div>,
    document.body,
  );
}
