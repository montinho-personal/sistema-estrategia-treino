"use client";

import { useState } from "react";

import type { StrategyState } from "@/lib/domain/schema";
import { cn } from "@/lib/utils";
import { StrategyDashboard } from "./strategy-dashboard";
import { LivePreview } from "./live-preview";

type View = "estrategia" | "relatorio";

export function SidePanel({
  state,
  currentTopicId,
  onJumpTopic,
}: {
  state: StrategyState;
  currentTopicId?: string;
  onJumpTopic: (topicId: string) => void;
}) {
  const [view, setView] = useState<View>("estrategia");

  return (
    <div className="lg:sticky lg:top-32">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex gap-1 rounded-full bg-secondary p-1.5">
          {(
            [
              ["estrategia", "Estratégia"],
              ["relatorio", "Relatório"],
            ] as [View, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={cn(
                "flex-1 rounded-full px-3 py-2 text-[13.5px] font-medium transition-colors",
                view === id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {view === "estrategia" ? (
          <StrategyDashboard state={state} currentTopicId={currentTopicId} onJumpTopic={onJumpTopic} />
        ) : (
          <LivePreview state={state} />
        )}
      </div>
    </div>
  );
}
