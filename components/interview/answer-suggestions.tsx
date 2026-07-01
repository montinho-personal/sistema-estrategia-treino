"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Plus } from "lucide-react";

import type { StrategyState } from "@/lib/domain/schema";
import { useAiStore } from "@/lib/store";
import { aiSuggestAnswers } from "@/lib/ai/anthropic";
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
    } catch (err) {
      toast.error("Falha ao gerar sugestões.", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  function insert(text: string) {
    const current = value.trim();
    onInsert(current ? `${current} ${text}` : text);
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
        <div className="mt-3 grid gap-2">
          <p className="text-[12.5px] text-muted-foreground">
            Clique para inserir. Você pode escolher mais de uma e editar o texto depois.
          </p>
          {items.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => insert(s)}
              className="group flex items-start gap-2 rounded-[12px] border border-border bg-bg px-3.5 py-2.5 text-left text-[14px] leading-relaxed text-foreground/90 transition-colors hover:border-gold/50 hover:bg-gold-soft"
            >
              <Plus className="mt-0.5 size-4 shrink-0 text-gold" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
