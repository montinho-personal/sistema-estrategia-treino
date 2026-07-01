"use client";

import { toast } from "sonner";

import { reportSections, reportIntro, reportClosing } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useStrategyStore, useDnaStore } from "@/lib/store";
import { BrandLockup } from "@/components/brand-mark";
import { ReportSection } from "./report-section";

export function ReportDocument({ state }: { state: StrategyState }) {
  const setOverride = useStrategyStore((s) => s.setOverride);
  const learnStyle = useDnaStore((s) => s.learnStyle);

  const sections = reportSections(state);
  const nome = (state.anamnese.nome ?? "").trim();

  if (sections.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-16 text-center text-muted-foreground">
        Ainda não há decisões registradas. Volte à entrevista para construir o relatório.
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="p-6 sm:p-10">
        <div className="mb-6 border-b border-border pb-4">
          <BrandLockup />
        </div>

        <h2 className="text-[clamp(24px,3.4vw,34px)] font-[680] leading-tight tracking-[-0.035em]">
          Estratégia de treino{nome ? ` · ${nome}` : ""}
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-[16.5px] leading-[1.65] text-foreground/80">
          {reportIntro(state)}
        </p>

        {sections.map((s) => (
          <ReportSection
            key={s.id}
            title={s.title}
            body={s.body}
            hasOverride={state.overrides[s.id] != null}
            onSave={(text) => {
              setOverride(s.id, text);
              learnStyle(text);
              toast.success("Seção atualizada.");
            }}
            onRevert={() => {
              setOverride(s.id, "");
              toast.success("Seção revertida ao texto automático.");
            }}
          />
        ))}

        <p className="mt-8 border-t border-border pt-6 text-[16px] italic leading-[1.65] text-foreground/80">
          {reportClosing(state)}
        </p>
      </div>
    </article>
  );
}
