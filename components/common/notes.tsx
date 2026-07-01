import { AlertTriangle, Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type NoteVariant = "warn" | "good";

export function NoteList({
  items,
  variant,
  empty,
}: {
  items: string[];
  variant: NoteVariant;
  empty?: string;
}) {
  if (items.length === 0) {
    return empty ? <p className="text-sm text-muted-foreground">{empty}</p> : null;
  }
  const Icon = variant === "warn" ? AlertTriangle : Check;
  return (
    <ul className="grid gap-2.5">
      {items.map((text, i) => (
        <li
          key={i}
          className={cn(
            "flex gap-3 rounded-[10px] border px-4 py-3 text-[14.5px] leading-relaxed",
            variant === "warn"
              ? "border-amber-300/60 bg-amber-50/60 text-foreground"
              : "border-emerald-300/50 bg-emerald-50/50 text-foreground",
          )}
        >
          <Icon
            className={cn(
              "mt-0.5 size-5 shrink-0",
              variant === "warn" ? "text-amber-600" : "text-emerald-600",
            )}
          />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
