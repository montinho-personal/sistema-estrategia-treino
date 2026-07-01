"use client";

import { toast } from "sonner";

import {
  checkVoice,
  simplify,
  QUALITY_QUESTION,
  reportSections,
  reportIntro,
  reportClosing,
} from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useStrategyStore } from "@/lib/store";
import { NoteList } from "@/components/common/notes";
import { Button } from "@/components/ui/button";

export function VoiceReview({ state }: { state: StrategyState }) {
  const setOverride = useStrategyStore((s) => s.setOverride);
  const sections = reportSections(state);
  if (sections.length === 0) return null;

  const fullText = [reportIntro(state), ...sections.map((s) => s.body), reportClosing(state)].join("\n\n");
  const issues = checkVoice(fullText);

  function applySimpleLanguage() {
    let n = 0;
    for (const s of reportSections(state)) {
      const simplified = simplify(s.body);
      if (simplified !== s.body) {
        setOverride(s.id, simplified);
        n++;
      }
    }
    toast.success(n ? `Linguagem simplificada em ${n} seção(ões).` : "Nada a simplificar — texto já está simples.");
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Revisão de voz
      </h3>
      <div className="mt-3 rounded-[12px] border border-gold/25 bg-gold-soft px-4 py-3 text-[14px] text-foreground/80">
        {QUALITY_QUESTION}
      </div>
      <div className="mt-3">
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            ✓ O texto está no tom do Montinho: pessoal, simples e organizado.
          </p>
        ) : (
          <>
            <NoteList items={issues.map((i) => i.text)} variant="warn" />
            <Button variant="outline" className="mt-3 w-full" onClick={applySimpleLanguage}>
              Aplicar linguagem simples
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
