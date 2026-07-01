"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  currentId,
  itemById,
  neighbor,
  firstIdOfTopic,
  progress,
  consistency,
  knowledgeForTopic,
} from "@/lib/domain";
import { ADAPTIVE } from "@/lib/domain/config";
import { low } from "@/lib/domain/util";
import { useStrategyStore, usePreferencesStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { QuestionCard } from "./question-card";
import { SidePanel } from "./side-panel";

const ADAPTIVE_IDS = new Set(ADAPTIVE.map((a) => a.id));

export function InterviewWorkspace() {
  const router = useRouter();
  const state = useStrategyStore();
  const setAnswer = useStrategyStore((s) => s.setAnswer);
  const setCurrentQ = useStrategyStore((s) => s.setCurrentQ);
  const acknowledge = useStrategyStore((s) => s.acknowledge);
  const prefs = usePreferencesStore((s) => s.prefs);
  const learnPreference = usePreferencesStore((s) => s.learnPreference);

  const curId = currentId(state);
  const item = curId ? itemById(state, curId) : null;

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

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
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
        onPrev={() => prevId && setCurrentQ(prevId)}
        onAdvance={advance}
        onReview={jumpTopic}
        onKeep={acknowledge}
        onJumpTopic={jumpTopic}
      />
      <SidePanel state={state} currentTopicId={topic.id} onJumpTopic={jumpTopic} />
    </div>
  );
}
