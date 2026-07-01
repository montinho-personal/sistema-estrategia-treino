"use client";

import { useStrategyStore } from "@/lib/store";
import { ReportDocument } from "./report-document";
import { ReportTools } from "./report-tools";
import { VoiceReview } from "./voice-review";

export function ReportWorkspace() {
  const state = useStrategyStore();

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <ReportDocument state={state} />
      <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <ReportTools state={state} />
        <VoiceReview state={state} />
      </div>
    </div>
  );
}
