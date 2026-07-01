"use client";

import { Plus, Trash2 } from "lucide-react";

import type { VolumeRow } from "@/lib/domain/schema";
import { useStrategyStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SUGESTOES = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Quadríceps", "Posterior", "Glúteos", "Panturrilha", "Abdômen",
];

function totalOf(rows: VolumeRow[]): number | null {
  let sum = 0;
  let any = false;
  for (const r of rows) {
    const n = parseInt(r.series, 10);
    if (!Number.isNaN(n)) {
      sum += n;
      any = true;
    }
  }
  return any ? sum : null;
}

export function VolumeEditor() {
  const volume = useStrategyStore((s) => s.volume);
  const setVolume = useStrategyStore((s) => s.setVolume);
  const total = totalOf(volume);

  const update = (i: number, patch: Partial<VolumeRow>) =>
    setVolume(volume.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = (grupo = "") => setVolume([...volume, { grupo, series: "" }]);
  const remove = (i: number) => setVolume(volume.filter((_, idx) => idx !== i));

  const restantes = SUGESTOES.filter(
    (g) => !volume.some((r) => r.grupo.trim().toLowerCase() === g.toLowerCase()),
  );

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Volume semanal de séries
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        Informe os grupos musculares e o nº de séries por semana. A tabela aparece no relatório
        (PDF e WhatsApp).
      </p>

      {volume.length > 0 && (
        <div className="mt-3 space-y-2">
          {volume.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="flex-1"
                placeholder="Grupo (ex.: Peito)"
                value={r.grupo}
                onChange={(e) => update(i, { grupo: e.target.value })}
              />
              <Input
                className="w-24"
                inputMode="numeric"
                placeholder="Séries"
                value={r.series}
                onChange={(e) => update(i, { series: e.target.value })}
              />
              <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => remove(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => add()}>
          <Plus className="size-4" /> Adicionar grupo
        </Button>
        {total != null && (
          <span className="ml-auto text-[13px] text-muted-foreground">
            Total: <b className="text-foreground">{total}</b> séries/sem
          </span>
        )}
      </div>

      {restantes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {restantes.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => add(g)}
              className="rounded-full border border-border px-2.5 py-1 text-[12.5px] text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
            >
              + {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
