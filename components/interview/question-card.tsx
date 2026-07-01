"use client";

import { ArrowLeft, ArrowRight, CornerDownRight } from "lucide-react";

import {
  questionsForTopic,
  knowledgeForTopic,
  type Question,
  type Topic,
  type ConsistencyNote,
} from "@/lib/domain";
import { TOPICS } from "@/lib/domain/config";
import type { StrategyState } from "@/lib/domain/schema";
import type { AnswerValue } from "@/lib/domain/schema/answers";
import type { Progress } from "@/lib/domain/interview";
import { has } from "@/lib/domain/util";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AnswerControl } from "./answer-control";
import { AnswerSuggestions } from "./answer-suggestions";
import { ConsistencyNotes } from "./consistency-notes";
import { KbEntryCard } from "@/components/knowledge/kb-entry-card";

/** Converte o valor de uma resposta em texto legível para dar contexto à IA. */
function answerToText(value: AnswerValue | undefined): string {
  if (Array.isArray(value)) return value.join(", ");
  return typeof value === "string" ? value : "";
}

const ADAPTIVE_HINT = "✦ pergunta adaptada";

export function QuestionCard({
  state,
  question,
  topic,
  progress,
  isAdaptive,
  isLast,
  prevDisabled,
  notes,
  prefs,
  onAnswer,
  onPrev,
  onAdvance,
  onReview,
  onKeep,
  onJumpTopic,
}: {
  state: StrategyState;
  question: Question;
  topic: Topic;
  progress: Progress;
  isAdaptive: boolean;
  isLast: boolean;
  prevDisabled: boolean;
  notes: ConsistencyNote[];
  prefs: Record<string, unknown>;
  onAnswer: (value: AnswerValue) => void;
  onPrev: () => void;
  onAdvance: () => void;
  onReview: (topicId: string) => void;
  onKeep: (id: string) => void;
  onJumpTopic: (topicId: string) => void;
}) {
  const isWhy = Boolean(question.why);
  const kbEntries = knowledgeForTopic(state, topic.id);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-md sm:p-8">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
        <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[12.5px] font-semibold text-gold">
          Tópico {topic.n} de {TOPICS.length}
        </span>
        <span>{topic.name}</span>
        {isAdaptive && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[12px] text-muted-foreground">
            {ADAPTIVE_HINT}
          </span>
        )}
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${progress.pct}%` }} />
      </div>
      <p className="mt-1.5 mb-5 text-[13px] text-muted-foreground">
        {progress.answered} de {progress.total} perguntas respondidas
      </p>

      {isWhy ? (
        <p className="flex items-start gap-2 text-[17px] font-medium">
          <CornerDownRight className="mt-1 size-4 shrink-0 text-gold" />
          {question.prompt}
        </p>
      ) : (
        <h2 className="text-2xl font-semibold leading-tight tracking-[-0.02em]">{question.prompt}</h2>
      )}
      {question.hint && <p className="mt-2 text-sm text-muted-foreground">{question.hint}</p>}

      <div className="mt-5">
        <Label>{isWhy ? "O porquê (será explicado ao aluno em linguagem simples)" : "Sua resposta"}</Label>
        <AnswerControl question={question} value={state.answers[question.id]} onChange={onAnswer} />
        {isWhy && (
          <AnswerSuggestions
            question={question.prompt}
            topicName={topic.name}
            mainAnswer={answerToText(state.answers[topic.mainQ])}
            state={state}
            value={answerToText(state.answers[question.id])}
            onInsert={onAnswer}
          />
        )}
      </div>

      <ConsistencyNotes notes={notes} onReview={onReview} onKeep={onKeep} />

      {kbEntries.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            📚 Biblioteca
          </h3>
          <div className="grid gap-2.5">
            {kbEntries.slice(0, 3).map((e) => (
              <KbEntryCard key={e.id} entry={e} state={state} isPreference={Boolean(prefs[e.id])} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={onPrev} disabled={prevDisabled}>
          <ArrowLeft className="size-4" /> Anterior
        </Button>
        <span className="flex-1" />
        <Button onClick={onAdvance}>
          {isLast ? "Concluir e revisar" : "Registrar e continuar"} <ArrowRight className="size-4" />
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {TOPICS.map((t) => {
          const filled = questionsForTopic(t, state).some((q) => has(state.answers[q.id]));
          const current = t.id === topic.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onJumpTopic(t.id)}
              className={cn(
                "rounded-full border px-2.5 py-1.5 text-[12.5px] transition-colors",
                current
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {filled && !current && <span className="mr-1 text-gold">●</span>}
              {t.n}. {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
