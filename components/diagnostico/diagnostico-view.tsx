"use client";

import { diagnosis, activeAdaptations, dna } from "@/lib/domain";
import {
  useStrategyStore,
  usePreferencesStore,
  useHistoryStore,
  useDnaStore,
  toPrefList,
} from "@/lib/store";
import { NoteList } from "@/components/common/notes";

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground first:mt-0">
      {children}
    </h2>
  );
}

export function DiagnosticoView() {
  const state = useStrategyStore();
  const prefs = usePreferencesStore((s) => s.prefs);
  const snapshots = useHistoryStore((s) => s.snapshots);
  const samples = useDnaStore((s) => s.samples);

  const d = diagnosis(state);
  const adaptations = activeAdaptations(state);
  const dnaResult = dna(state, {
    prefs: toPrefList(prefs),
    historyAnswers: snapshots.map((s) => s.answers),
    styleSamples: samples.length,
  });

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
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
