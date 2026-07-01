import { Sparkles } from "lucide-react";

import type { Step } from "@/lib/domain/schema";
import { StepHeader } from "./step-header";
import { Badge } from "@/components/ui/badge";

export function StepPlaceholder({
  step,
  title,
  description,
  phase,
}: {
  step: Step;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <>
      <StepHeader step={step} title={title} description={description} />
      <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
        <div className="grid size-12 place-items-center rounded-xl bg-gold-soft text-gold">
          <Sparkles className="size-6" />
        </div>
        <Badge variant="gold" className="mt-5">
          Em construção
        </Badge>
        <p className="mt-3 max-w-[42ch] text-muted-foreground">
          Esta etapa chega na <span className="font-medium text-foreground">{phase}</span>,
          já consumindo a lógica de domínio e os stores desta base.
        </p>
      </div>
    </>
  );
}
