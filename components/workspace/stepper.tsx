"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { STEP_META } from "@/lib/workspace/steps";

export function Stepper() {
  const pathname = usePathname();
  const activeIndex = Math.max(
    0,
    STEP_META.findIndex((s) => pathname.startsWith(s.path)),
  );

  return (
    <div className="sticky top-[57px] z-40 border-b border-border bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto px-6 py-3">
        {STEP_META.map((s, i) => {
          const active = i === activeIndex;
          const done = i < activeIndex;
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-border">›</span>}
              <Link
                href={s.path}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "border-border bg-surface font-medium text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "grid size-[22px] place-items-center rounded-full text-xs font-semibold",
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-gold text-gold-foreground"
                        : "bg-secondary text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
