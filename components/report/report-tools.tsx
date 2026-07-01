"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, ArrowLeft } from "lucide-react";

import { completion, reportWhatsapp } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useHistoryStore } from "@/lib/store";
import { copyToClipboard } from "@/lib/clipboard";
import { Button } from "@/components/ui/button";
import { MemoryDialog } from "@/components/memory/memory-dialog";

export function ReportTools({ state }: { state: StrategyState }) {
  const router = useRouter();
  const saveSnapshot = useHistoryStore((s) => s.saveSnapshot);
  const [waOpen, setWaOpen] = useState(false);
  const comp = completion(state);

  async function copyWhatsapp() {
    const ok = await copyToClipboard(reportWhatsapp(state));
    toast[ok ? "success" : "error"](ok ? "Texto do WhatsApp copiado." : "Não foi possível copiar.");
  }

  function save() {
    const snap = saveSnapshot(state);
    toast.success(`Estratégia de ${snap.nome} salva no histórico.`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Progresso</h3>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gold" style={{ width: `${comp.pct}%` }} />
        </div>
        <p className="mt-2.5 text-sm text-muted-foreground">
          {comp.done} de {comp.total} respostas obrigatórias · {comp.topics} áreas
        </p>
        <Button variant="ghost" className="mt-3 w-full" onClick={() => router.push("/alunos/revisao")}>
          <ArrowLeft className="size-4" /> Voltar à revisão
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Versões finais</h3>
        <Button className="mt-3 w-full" onClick={copyWhatsapp}>
          <MessageCircle className="size-4" /> Copiar versão WhatsApp
        </Button>
        <Button variant="outline" className="mt-2.5 w-full" onClick={() => setWaOpen((v) => !v)}>
          Prévia do WhatsApp
        </Button>
        {waOpen && (
          <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[12px] border border-[#1f2c33] bg-[#0b141a] p-4 font-sans text-[13.5px] leading-relaxed text-[#e9edef]">
            {reportWhatsapp(state)}
          </pre>
        )}
        <p className="mt-3 text-[12.5px] text-muted-foreground">
          PDF premium e exportação HTML chegam na Fase 7.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Estratégia</h3>
        <MemoryDialog
          state={state}
          trigger={
            <Button variant="outline" className="mt-3 w-full">
              Ver estratégia completa
            </Button>
          }
        />
        <Button variant="ghost" className="mt-2.5 w-full" onClick={save}>
          Salvar no histórico
        </Button>
      </div>
    </div>
  );
}
