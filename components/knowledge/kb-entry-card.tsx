"use client";

import { useState } from "react";

import {
  explainKnowledge,
  confidenceNote,
  confidenceClass,
  type KbEntry,
} from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { cn } from "@/lib/utils";

const CONF_STYLE: Record<"good" | "warn" | "low", string> = {
  good: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  low: "bg-secondary text-muted-foreground",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-0.5 text-[13.5px] leading-relaxed sm:grid-cols-[130px_1fr] sm:gap-x-3.5">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function KbEntryCard({
  entry,
  state,
  isPreference = false,
}: {
  entry: KbEntry;
  state: StrategyState;
  isPreference?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const exp = explainKnowledge(entry, state);

  return (
    <div className="rounded-[14px] border border-border bg-bg p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="mr-auto text-[15px] font-semibold tracking-[-0.01em]">{entry.title}</span>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", CONF_STYLE[confidenceClass(entry)])}>
          Confiança: {entry.conf}
        </span>
        {exp.profile && (
          <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-medium text-gold">
            adaptado · {exp.profile}
          </span>
        )}
      </div>
      <p className="text-[14.5px] leading-relaxed text-foreground/80">{exp.text}</p>
      {isPreference && (
        <div className="mt-2 text-[12.5px] font-medium text-gold">
          ✓ Faz parte do seu DNA — você costuma usar isto.
        </div>
      )}

      {open && (
        <div className="mt-3 grid gap-2 border-t border-border pt-3">
          <Row label="O que é" value={entry.what} />
          <Row label="Por que usar" value={entry.why} />
          <Row label="Benefícios" value={entry.benefits.join(" · ")} />
          <Row label="Riscos / atenção" value={entry.risks.join(" · ")} />
          <Row label="Quando usar" value={entry.whenUse} />
          <Row label="Quando evitar" value={entry.whenAvoid} />
          <Row label="Evidência" value={confidenceNote(entry)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2.5 text-[12.5px] font-medium text-gold hover:underline"
      >
        {open ? "Ocultar fundamentação" : "Ver fundamentação técnica"}
      </button>
    </div>
  );
}
