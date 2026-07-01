import type { Step } from "@/lib/domain/schema";
import { stepIndex, STEP_TOTAL } from "@/lib/workspace/steps";

export function StepHeader({
  step,
  title,
  description,
}: {
  step: Step;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
        Passo {stepIndex(step) + 1} de {STEP_TOTAL}
      </span>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-[34px]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2.5 max-w-[60ch] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3">{children}</div>
  );
}
