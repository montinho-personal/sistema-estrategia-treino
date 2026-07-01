"use client";

import type { Question } from "@/lib/domain/types";
import type { AnswerValue } from "@/lib/domain/schema/answers";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

export function AnswerControl({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}) {
  if (question.type === "choice") {
    return (
      <NativeSelect
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {question.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </NativeSelect>
    );
  }

  if (question.type === "multi") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (opt: string) =>
      onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);
    return (
      <div className="flex flex-wrap gap-2">
        {question.options?.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
                on
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }

  const str = typeof value === "string" ? value : "";
  if (question.type === "text") {
    return <Input value={str} placeholder={question.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <Textarea value={str} placeholder={question.placeholder} onChange={(e) => onChange(e.target.value)} />
  );
}
