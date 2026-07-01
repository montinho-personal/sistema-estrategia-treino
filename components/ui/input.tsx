import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-[10px] border border-input bg-bg px-3.5 text-[15px] text-foreground outline-none transition-colors",
        "placeholder:text-muted-foreground/60",
        "focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
