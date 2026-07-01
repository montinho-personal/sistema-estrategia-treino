"use client";

import { useState } from "react";
import { toast } from "sonner";

import { diagnosis, activeAdaptations, dna } from "@/lib/domain";
import {
  useStrategyStore,
  usePreferencesStore,
  useHistoryStore,
  useDnaStore,
  useAiStore,
  toPrefList,
} from "@/lib/store";
import { aiDiagnose } from "@/lib/ai/anthropic";
import { NoteList } from "@/components/common/notes";
import { Button } from "@/components/ui/button";

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground first:mt-0">
      {children}
    </h2>
  );
}

export function DiagnosticoView() {
  const state = useStrategyStore();
  const patch = useStrategyStore((s) => s.patch);
  const prefs = usePreferencesStore((s) => s.prefs);
  const snapshots = useHistoryStore((s) => s.snapshots);
  const samples = useDnaStore((s) => s.samples);
  const aiConfig = useAiStore((s) => s.config);
  const aiEnabled = Boolean(aiConfig.key);
  const [loading, setLoading] = useState(false);

  async function generateSummary() {
    setLoading(true);
    try {
      const text = await aiDiagnose(aiConfig, state);
      patch({ diagnosisNote: text });
      toast.success("Resumo executivo gerado.");
    } catch (err) {
      toast.error(`Falha na IA: ${err instanceof Error ? err.message : "erro"}`);
    } finally {
      setLoading(false);
    }
  }

  const d = diagnosis(state);
  const adaptations = activeAdaptations(state);
  const dnaResult = dna(state, {
    prefs: toPrefList(prefs),
    historyAnswers: snapshots.map((s) => s.answers),
    styleSamples: samples.length,
  });

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      {aiEnabled && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
          <p className="text-sm text-muted-foreground">
            Gere um resumo executivo com o assistente de IA a partir da anamnese.
          </p>
          <Button variant="outline" size="sm" onClick={generateSummary} disabled={loading}>
            {loading ? "Analisando…" : "Gerar resumo com IA"}
          </Button>
        </div>
      )}
      {state.diagnosisNote && (
        <>
          <SubHeading>Resumo executivo (IA)</SubHeading>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/80">
            {state.diagnosisNote}
          </p>
        </>
      )}
      <SubHeading>Perfil</SubHeading>
      {d.perfil.length ? (
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr] sm:gap-y-2.5">
          {d.perfil.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-[15px] text-muted-foreground">{k}</dt>
              <dd className="mb-2 text-[15px] sm:mb-0">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Preencha a anamnese para ver o perfil.</p>
      )}

      <SubHeading>Pontos de atenção &amp; riscos</SubHeading>
      <NoteList items={d.atencao} variant="warn" empty="Nenhum ponto crítico identificado automaticamente." />

      <SubHeading>Oportunidades</SubHeading>
      <NoteList items={d.oportunidades} variant="good" empty="Sem oportunidades destacadas ainda — depende de mais dados da anamnese." />

      {adaptations.length > 0 && (
        <>
          <SubHeading>A entrevista foi adaptada</SubHeading>
          <NoteList
            items={adaptations.map((a) => `Perguntas extras sobre ${(a.label ?? "").toLowerCase()} foram incluídas.`)}
            variant="good"
          />
        </>
      )}

      {(dnaResult.prefs.length > 0 || dnaResult.cycles > 0) && (
        <>
          <SubHeading>DNA do Montinho</SubHeading>
          <NoteList items={dnaResult.insights.slice(0, 4)} variant="good" />
        </>
      )}
    </div>
  );
}
