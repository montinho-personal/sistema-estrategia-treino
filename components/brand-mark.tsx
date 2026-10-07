import Image from "next/image";

import { cn } from "@/lib/utils";

/** Marca gráfica do Montinho — o logo oficial (halter em "M" + nome). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/montinho-logo.png"
      alt="Montinho Personal Trainer"
      width={484}
      height={334}
      priority
      className={cn("h-10 w-auto sm:h-12", className)}
    />
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <span aria-hidden className="h-7 w-px bg-border" />
      <span className="text-[13px] font-medium leading-[1.15] tracking-[-0.01em] text-muted-foreground">
        Training
        <br />
        Strategy
      </span>
    </span>
  );
}
