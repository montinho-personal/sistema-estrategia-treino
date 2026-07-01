import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[80px] w-full resize-y rounded-[10px] border border-input bg-bg px-3.5 py-2.5 text-[15px] leading-relaxed text-foreground outline-none transition-colors",
        "placeholder:text-muted-foreground/60",
        "focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
