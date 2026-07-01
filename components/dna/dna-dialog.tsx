"use client";

import { type ReactNode } from "react";

import { dna } from "@/lib/domain";
import {
  useStrategyStore,
  usePreferencesStore,
  useHistoryStore,
  useDnaStore,
  toPrefList,
} from "@/lib/store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { NoteList } from "@/components/common/notes";

export function DnaDialog({ trigger }: { trigger: ReactNode }) {
  const state = useStrategyStore();
  const prefs = usePreferencesStore((s) => s.prefs);
  const clearPreferences = usePreferencesStore((s) => s.clearPreferences);
  const snapshots = useHistoryStore((s) => s.snapshots);
  const samples = useDnaStore((s) => s.samples);
  const clearStyle = useDnaStore((s) => s.clearStyle);

  const result = dna(state, {
    prefs: toPrefList(prefs),
    historyAnswers: snapshots.map((s) => s.answers),
    styleSamples: samples.length,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>🧬 DNA do Montinho</DialogTitle>
          <DialogDescription>
            Uma memória viva que aprende como o Renato pensa e escreve, para que todo relatório soe
            como ele. Personaliza a comunicação — nunca substitui a ciência.
          </DialogDescription>
        </DialogHeader>

        <div>
          <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            O jeito do Montinho
          </h4>
          <NoteList items={result.insights} variant="good" />
        </div>

        {result.prefs.length > 0 && (
          <div>
            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Métodos preferidos
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.prefs.slice(0, 12).map((p) => (
                <span key={p.id} className="rounded-full border border-border px-3 py-1.5 text-[12.5px]">
                  <span className="mr-1 text-gold">●</span>
                  {p.title} · {p.count}x
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-[13px] text-muted-foreground">
          Aprendizado até aqui: {result.cycles} estratégia(s) no histórico · {result.styleSamples}{" "}
          edição(ões) de texto observada(s).
        </p>

        {(result.prefs.length > 0 || result.styleSamples > 0) && (
          <button
            type="button"
            onClick={() => {
              clearPreferences();
              clearStyle();
            }}
            className="text-[13px] text-gold hover:underline"
          >
            Limpar aprendizado
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
