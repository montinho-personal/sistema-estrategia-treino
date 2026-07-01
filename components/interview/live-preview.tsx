"use client";

import { reportIntro, reportSections } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { has } from "@/lib/domain/util";

export function LivePreview({ state }: { state: StrategyState }) {
  const sections = reportSections(state);
  const hasContent = sections.length > 0 || has(state.answers.filosofia_frase);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <span className="inline-flex rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-gold">
        Relatório em tempo real
      </span>
      {!hasContent ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          À medida que você registra decisões, o relatório do aluno aparece aqui.
        </p>
      ) : (
        <div className="mt-4">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/80">
            {reportIntro(state)}
          </p>
          {sections.map((s) => (
            <div key={s.id} className="mt-5">
              <h3 className="inline-block border-b-2 border-gold-soft pb-1 text-[17px] font-semibold tracking-[-0.02em]">
                {s.title}
              </h3>
              <p className="mt-2.5 whitespace-pre-wrap text-[15px] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
