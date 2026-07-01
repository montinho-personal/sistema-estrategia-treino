"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Check } from "lucide-react";

import type { StrategyState } from "@/lib/domain/schema";
import { useAiStore } from "@/lib/store";
import { aiSuggestAnswers } from "@/lib/ai/anthropic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AnswerSuggestions({
  question,
  topicName,
  mainAnswer,
  state,
  value,
  onInsert,
}: {
  question: string;
  topicName: string;
  mainAnswer: string;
  state: StrategyState;
  value: string;
  onInsert: (text: string) => void;
}) {
  const aiConfig = useAiStore((s) => s.config);
  const [items, setItems] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!aiConfig.key) {
      toast.error("Ligue o Assistente de IA para gerar sugestões.", {
        description: "No topo, clique em “IA desligada” e informe sua chave da Anthropic.",
      });
      return;
    }
    setLoading(true);
    try {
      const extra = mainAnswer
        ? `Decisão registrada neste tópico (${topicName}): ${mainAnswer}`
        : `Tópico: ${topicName}`;
      const sug = await aiSuggestAnswers(aiConfig, question, state, extra);
      if (sug.length === 0) {
        toast.error("Não consegui gerar sugestões agora. Tente novamente.");
      }
      setItems(sug);
      setSelected(new Set());
    } catch (err) {
      toast.error("Falha ao gerar sugestões.", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function insertSelected() {
    const chosen = items.filter((_, i) => selected.has(i));
    if (chosen.length === 0) return;
    const current = value.trim();
    const addition = chosen.join(" ");
    onInsert(current ? `${current} ${addition}` : addition);
    setSelected(new Set());
    toast.success(chosen.length === 1 ? "Motivo inserido." : `${chosen.length} motivos inseridos.`);
  }

  return (
    <div className="mt-3">
      <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Gerando…
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            {items.length > 0 ? "Gerar outras sugestões" : "Sugerir respostas com IA"}
          </>
        )}
      </Button>

      {items.length > 0 && (
        <div className="mt-3">
          <p className="text-[12.5px] text-muted-foreground">
            Marque um ou mais motivos e clique em inserir. Você pode editar o texto depois.
          </p>
          <div className="mt-2 grid gap-2">
            {items.map((s, i) => {
              const on = selected.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(i)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-[12px] border px-3.5 py-2.5 text-left text-[14px] leading-relaxed transition-colors",
                    on
                      ? "border-gold/60 bg-gold-soft text-foreground"
                      : "border-border bg-bg text-foreground/90 hover:border-gold/40 hover:bg-gold-soft/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[6px] border transition-colors",
                      on ? "border-gold bg-gold text-gold-foreground" : "border-muted-foreground/40",
                    )}
                  >
                    {on && <Check className="size-3" />}
                  </span>
                  <span>{s}</span>
                </button>
              );
            })}
          </div>

          <Button className="mt-3 w-full" onClick={insertSelected} disabled={selected.size === 0}>
            {selected.size > 0
              ? `Inserir ${selected.size} ${selected.size === 1 ? "selecionado" : "selecionados"}`
              : "Inserir selecionados"}
          </Button>
        </div>
      )}
    </div>
  );
}
