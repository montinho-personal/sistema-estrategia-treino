"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import {
  currentId,
  itemById,
  neighbor,
  firstIdOfTopic,
  progress,
  consistency,
  knowledgeForTopic,
  missingPrefill,
  essentialItems,
  isFromAnamnese,
  similarStrategies,
} from "@/lib/domain";
import { ADAPTIVE } from "@/lib/domain/config";
import { has, low } from "@/lib/domain/util";
import { useStrategyStore, usePreferencesStore, useHistoryStore } from "@/lib/store";
import { scrollToElement } from "@/lib/scroll";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "./question-card";
import { SidePanel } from "./side-panel";
import { SimilarStart } from "./similar-start";

const ADAPTIVE_IDS = new Set(ADAPTIVE.map((a) => a.id));

export function InterviewWorkspace() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const state = useStrategyStore();
  const setAnswer = useStrategyStore((s) => s.setAnswer);
  const setCurrentQ = useStrategyStore((s) => s.setCurrentQ);
  const acknowledge = useStrategyStore((s) => s.acknowledge);
  const prefs = usePreferencesStore((s) => s.prefs);
  const learnPreference = usePreferencesStore((s) => s.learnPreference);
  const anamnese = useStrategyStore((s) => s.anamnese);
  const patch = useStrategyStore((s) => s.patch);

  // O que já está na anamnese chega marcado na entrevista (sem sobrescrever
  // respostas do treinador). Se a entrevista ainda não começou, ela abre no
  // tópico 1 para o treinador conferir o que veio preenchido.
  useEffect(() => {
    const st = useStrategyStore.getState();
    const missing = missingPrefill(st);
    if (Object.keys(missing).length === 0) return;
    const first = essentialItems(st)[0]?.q.id ?? null;
    patch({ answers: { ...st.answers, ...missing }, currentQ: st.currentQ ?? first });
  }, [anamnese, patch]);

  const curId = currentId(state);
  const item = curId ? itemById(state, curId) : null;

  // "Começar a partir de uma estratégia parecida": só enquanto a entrevista
  // não começou (as únicas respostas são as que vieram da anamnese).
  const snapshots = useHistoryStore((s) => s.snapshots);
  const [baseDismissed, setBaseDismissed] = useState(false);
  const fresh = Object.entries(state.answers).every(([id, v]) => !has(v) || isFromAnamnese(state, id));
  const matches = useMemo(
    () => (fresh && !baseDismissed ? similarStrategies(snapshots, state.anamnese) : []),
    [fresh, baseDismissed, snapshots, state.anamnese],
  );

  // Ao trocar de pergunta (avançar, voltar ou pular de tópico), leva a tela
  // até o topo do card — não fica parada lá embaixo, onde estava o botão.
  const cardRef = useRef<HTMLDivElement>(null);
  const lastId = useRef<string | null>(null);
  useEffect(() => {
    if (lastId.current !== null && lastId.current !== curId && cardRef.current) {
      scrollToElement(cardRef.current);
    }
    lastId.current = curId;
  }, [curId]);

  if (!curId || !item) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-surface p-16 text-center">
        <p className="max-w-[40ch] text-muted-foreground">
          Preencha a anamnese para começar a entrevista.
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/alunos/anamnese">Ir para a anamnese</Link>
        </Button>
      </div>
    );
  }

  const { q: question, topic } = item;
  const nextId = neighbor(state, curId, 1);
  const prevId = neighbor(state, curId, -1);

  function jumpTopic(topicId: string) {
    const fid = firstIdOfTopic(state, topicId);
    if (fid) setCurrentQ(fid);
  }

  function advance() {
    const context = low(state.anamnese.experiencia);
    for (const e of knowledgeForTopic(state, topic.id)) {
      learnPreference(e.id, e.title, context);
    }
    if (nextId) setCurrentQ(nextId);
    else router.push("/alunos/revisao");
  }

  const card = (
    <QuestionCard
      state={state}
      question={question}
      topic={topic}
      progress={progress(state)}
      isAdaptive={ADAPTIVE_IDS.has(question.id)}
      isLast={!nextId}
      prevDisabled={!prevId}
      notes={consistency(state)}
      prefs={prefs}
      onAnswer={(value) => setAnswer(question.id, value)}
      onAnswerId={(id, value) => setAnswer(id, value)}
      onPrev={() => prevId && setCurrentQ(prevId)}
      onAdvance={advance}
      onReview={jumpTopic}
      onKeep={acknowledge}
      onJumpTopic={jumpTopic}
    />
  );

  return (
    <>
    {matches.length > 0 && <SimilarStart matches={matches} onDismiss={() => setBaseDismissed(true)} />}
    <div ref={cardRef} className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      {reduce ? (
        card
      ) : (
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {card}
        </motion.div>
      )}
      <SidePanel state={state} currentTopicId={topic.id} onJumpTopic={jumpTopic} />
    </div>
    </>
  );
}
