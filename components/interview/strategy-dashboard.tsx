"use client";

import { Lightbulb } from "lucide-react";

import { completion, areaStatus, suggestions } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import type { AreaStatusValue } from "@/lib/domain/memory";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MemoryDialog } from "@/components/memory/memory-dialog";

function BlockBar({ pct }: { pct: number }) {
  const total = 12;
  const filled = Math.max(0, Math.min(total, Math.round((pct / 100) * total)));
  return (
    <div className="font-mono text-[15px] tracking-[2px]">
      <span className="text-gold">{"█".repeat(filled)}</span>
      <span className="text-border">{"░".repeat(total - filled)}</span>
    </div>
  );
}

const MARK: Record<AreaStatusValue, { glyph: string; className: string }> = {
  done: { glyph: "✓", className: "text-emerald-600" },
  progress: { glyph: "●", className: "text-amber-500" },
  pending: { glyph: "○", className: "text-border" },
};

export function StrategyDashboard({
  state,
  currentTopicId,
  onJumpTopic,
}: {
  state: StrategyState;
  currentTopicId?: string;
  onJumpTopic: (topicId: string) => void;
}) {
  const comp = completion(state);
  const areas = areaStatus(state, currentTopicId);
  const tips = suggestions(state);

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Estratégia em construção
      </h3>
      <div className="mt-2.5 mb-1 flex items-baseline gap-2.5">
        <b className="text-[34px] font-[680] tabular-nums tracking-[-0.03em]">{comp.pct}%</b>
        <span className="text-[13px] text-muted-foreground">
          {comp.complete ? "estratégia concluída" : "em construção"}
        </span>
      </div>
      <BlockBar pct={comp.pct} />

      <ul className="mt-4 grid gap-0.5">
        {areas.map((area) => (
          <li key={area.id}>
            <button
              type="button"
              onClick={() => onJumpTopic(area.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-sm transition-colors hover:bg-bg",
                area.status === "pending" ? "text-muted-foreground" : "text-foreground",
              )}
            >
              <span className={cn("grid size-5 place-items-center text-[13px]", MARK[area.status].className)}>
                {MARK[area.status].glyph}
              </span>
              <span className="flex-1">
                {area.n}. {area.name}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {tips.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Sugestões
          </h4>
          <ul className="grid gap-2">
            {tips.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug text-foreground/80">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <MemoryDialog
        state={state}
        trigger={
          <Button variant="outline" className="mt-4 w-full">
            Ver estratégia completa
          </Button>
        }
      />
    </div>
  );
}
