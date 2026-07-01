import { cn } from "@/lib/utils";

/** Marca gráfica do Montinho — o "M" premium usado em nav, rodapé e documento. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid place-items-center rounded-[9px] bg-primary text-primary-foreground font-bold",
        "size-[30px] text-[15px]",
        className,
      )}
    >
      M
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        Montinho <span className="font-medium text-muted-foreground">Training Strategy</span>
      </span>
    </span>
  );
}
