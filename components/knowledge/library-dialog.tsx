"use client";

import { useState, type ReactNode } from "react";

import { allKnowledge, CONF_ORDER } from "@/lib/domain";
import { useStrategyStore, usePreferencesStore, toPrefList } from "@/lib/store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { KbEntryCard } from "./kb-entry-card";

export function LibraryDialog({ trigger }: { trigger: ReactNode }) {
  const state = useStrategyStore();
  const prefs = usePreferencesStore((s) => s.prefs);
  const clearPreferences = usePreferencesStore((s) => s.clearPreferences);
  const [query, setQuery] = useState("");

  const prefList = toPrefList(prefs);
  const f = query.toLowerCase().trim();
  const items = allKnowledge()
    .filter((e) => !f || `${e.title} ${e.cat} ${e.what}`.toLowerCase().includes(f))
    .sort((a, b) => CONF_ORDER[b.conf] - CONF_ORDER[a.conf]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>📚 Biblioteca</DialogTitle>
          <DialogDescription>
            Conhecimento organizado que fundamenta cada decisão — sempre em linguagem simples para o
            aluno. Nunca substitui o treinador.
          </DialogDescription>
        </DialogHeader>

        {prefList.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Preferências do treinador
            </h4>
            <div className="flex flex-wrap gap-2">
              {prefList.slice(0, 12).map((p) => (
                <span key={p.id} className="rounded-full border border-border px-3 py-1.5 text-[12.5px]">
                  <span className="mr-1 text-gold">●</span>
                  {p.title} · {p.count}x
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => clearPreferences()}
              className="mt-2 text-[12.5px] text-gold hover:underline"
            >
              Limpar preferências
            </button>
          </div>
        )}

        <Input
          type="search"
          placeholder="Buscar na biblioteca (ex.: drop-set, upper lower, falha...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="grid gap-2.5">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nada encontrado para essa busca.</p>
          ) : (
            items.map((e) => <KbEntryCard key={e.id} entry={e} state={state} isPreference={Boolean(prefs[e.id])} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
