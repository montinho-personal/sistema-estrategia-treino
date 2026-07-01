"use client";

import { useRouter } from "next/navigation";
import { Check, AlertTriangle, ArrowRight } from "lucide-react";

import { requiredMissing, consistency, firstIdOfTopic, type MissingItem } from "@/lib/domain";
import { TOPICS } from "@/lib/domain/config";
import { useStrategyStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConsistencyNotes } from "@/components/interview/consistency-notes";

export function RevisaoView() {
  const router = useRouter();
  const state = useStrategyStore();
  const setCurrentQ = useStrategyStore((s) => s.setCurrentQ);
  const acknowledge = useStrategyStore((s) => s.acknowledge);

  const missing = requiredMissing(state);
  const notes = consistency(state);
  const byTopic = new Map<string, MissingItem[]>();
  for (const m of missing) {
    byTopic.set(m.topic.id, [...(byTopic.get(m.topic.id) ?? []), m]);
  }

  function review(topicId: string) {
    const fid = firstIdOfTopic(state, topicId);
    if (fid) setCurrentQ(fid);
    router.push("/alunos/entrevista");
  }
  function respond(id: string) {
    setCurrentQ(id);
    router.push("/alunos/entrevista");
  }

  return (
    <div className="space-y-6">
      {notes.length > 0 && (
        <ConsistencyNotes notes={notes} onReview={review} onKeep={acknowledge} />
      )}

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Checklist por área
        </h2>
        <ul className="grid gap-2.5">
          {TOPICS.map((t) => {
            const topicMissing = byTopic.get(t.id) ?? [];
            const ok = topicMissing.length === 0;
            const Icon = ok ? Check : AlertTriangle;
            return (
              <li
                key={t.id}
                className={cn(
                  "flex gap-3 rounded-[10px] border px-4 py-3",
                  ok ? "border-emerald-300/50 bg-emerald-50/50" : "border-amber-300/60 bg-amber-50/60",
                )}
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", ok ? "text-emerald-600" : "text-amber-600")} />
                <div className="text-[14.5px]">
                  <p>
                    <b>
                      {t.n}. {t.name}
                    </b>
                    {ok && <span className="text-muted-foreground"> — completo</span>}
                  </p>
                  {!ok && (
                    <>
                      {topicMissing.map((m) => (
                        <p key={m.id} className="mt-1.5 text-[13.5px] text-muted-foreground">
                          Falta: {m.q?.prompt ?? m.id}
                        </p>
                      ))}
                      <button
                        type="button"
                        onClick={() => respond(topicMissing[0].id)}
                        className="mt-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-gold transition-colors hover:border-gold"
                      >
                        Responder agora
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {missing.length === 0 && (
        <div className="rounded-[14px] border border-gold/25 bg-gold-soft px-5 py-4 text-[15px] text-foreground/80">
          Deseja alterar alguma informação antes de gerar o relatório? Você pode editar qualquer
          área — nada é gerado automaticamente.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => router.push("/alunos/entrevista")}>
          ← Voltar à entrevista
        </Button>
        <span className="flex-1" />
        {missing.length > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              Faltam {missing.length} resposta(s) obrigatória(s).
            </span>
            <Button size="lg" disabled className="opacity-50">
              Gerar relatório <ArrowRight className="size-4" />
            </Button>
          </>
        ) : (
          <Button size="lg" onClick={() => router.push("/alunos/relatorio")}>
            Gerar relatório <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
