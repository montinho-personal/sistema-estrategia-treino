"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

import {
  checkVoice,
  simplify,
  QUALITY_QUESTION,
  reportSections,
  reportIntro,
  reportClosing,
} from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useStrategyStore, useAiStore } from "@/lib/store";
import { aiEnhanceText } from "@/lib/ai/anthropic";
import { NoteList } from "@/components/common/notes";
import { Button } from "@/components/ui/button";

export function VoiceReview({ state }: { state: StrategyState }) {
  const setOverride = useStrategyStore((s) => s.setOverride);
  const aiConfig = useAiStore((s) => s.config);
  const [enhancing, setEnhancing] = useState(false);
  const sections = reportSections(state);
  if (sections.length === 0) return null;

  const fullText = [reportIntro(state), ...sections.map((s) => s.body), reportClosing(state)].join("\n\n");
  const issues = checkVoice(fullText);

  function applySimpleLanguage() {
    let n = 0;
    for (const s of reportSections(state)) {
      const simplified = simplify(s.body);
      if (simplified !== s.body) {
        setOverride(s.id, simplified);
        n++;
      }
    }
    toast.success(n ? `Linguagem simplificada em ${n} seção(ões).` : "Nada a simplificar — texto já está simples.");
  }

  async function enhanceWithAi() {
    if (!aiConfig.key) {
      toast.error("Ligue o Assistente de IA para aprimorar as respostas.", {
        description: "No topo, clique em “IA desligada” e informe sua chave da Anthropic.",
      });
      return;
    }
    const secs = reportSections(state);
    if (secs.length === 0) return;

    setEnhancing(true);
    const id = toast.loading(`Aprimorando ${secs.length} seções com IA…`);
    try {
      const results = await Promise.allSettled(
        secs.map((s) => aiEnhanceText(aiConfig, s.title, s.body, state)),
      );
      let n = 0;
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.trim()) {
          setOverride(secs[i].id, r.value.trim());
          n++;
        }
      });
      if (n > 0) {
        toast.success(`${n} ${n === 1 ? "seção aprimorada" : "seções aprimoradas"}.`, {
          id,
          description: "Corrigi o português e enriqueci o texto — revise antes de enviar.",
        });
      } else {
        toast.error("Não foi possível aprimorar agora. Tente novamente.", { id });
      }
    } catch (err) {
      toast.error("Falha ao aprimorar com IA.", {
        id,
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setEnhancing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Revisão de voz
      </h3>

      <div className="mt-3 rounded-[12px] border border-gold/25 bg-gold-soft px-4 py-3 text-[14px] text-foreground/80">
        {QUALITY_QUESTION}
      </div>

      <div className="mt-3">
        <Button className="w-full" onClick={enhanceWithAi} disabled={enhancing}>
          {enhancing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Aprimorando…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Aprimorar respostas com IA
            </>
          )}
        </Button>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          A IA corrige o português, melhora a escrita e enriquece cada seção — sem mudar as suas
          decisões. Você revisa tudo depois.
        </p>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            ✓ O texto está no tom do Montinho: pessoal, simples e organizado.
          </p>
        ) : (
          <>
            <NoteList items={issues.map((i) => i.text)} variant="warn" />
            <Button variant="outline" className="mt-3 w-full" onClick={applySimpleLanguage}>
              Aplicar linguagem simples
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
