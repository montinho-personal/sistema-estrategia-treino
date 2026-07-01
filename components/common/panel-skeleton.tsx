export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <div className="h-3 w-28 animate-pulse rounded bg-secondary" />
          <div className="mt-4 h-9 animate-pulse rounded-[10px] bg-secondary/70" />
        </div>
      ))}
    </div>
  );
}
