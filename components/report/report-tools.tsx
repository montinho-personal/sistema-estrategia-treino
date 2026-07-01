"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, FileText, Copy, ArrowLeft } from "lucide-react";

import { completion, reportWhatsapp } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useHistoryStore, useStrategyStore } from "@/lib/store";
import { copyToClipboard } from "@/lib/clipboard";
import { Button } from "@/components/ui/button";
import { MemoryDialog } from "@/components/memory/memory-dialog";
import { BrandDialog } from "@/components/brand/brand-dialog";
import { PremiumPreview } from "@/components/premium/premium-preview";

export function ReportTools({ state }: { state: StrategyState }) {
  const router = useRouter();
  const saveSnapshot = useHistoryStore((s) => s.saveSnapshot);
  const updateSnapshot = useHistoryStore((s) => s.updateSnapshot);
  const snapshots = useHistoryStore((s) => s.snapshots);
  const sourceId = useStrategyStore((s) => s.sourceId);
  const loaded = sourceId ? snapshots.find((s) => s.id === sourceId) : undefined;
  const [waOpen, setWaOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const comp = completion(state);

  async function copyWhatsapp(feedback = true) {
    const ok = await copyToClipboard(reportWhatsapp(state));
    if (feedback) toast[ok ? "success" : "error"](ok ? "Texto do WhatsApp copiado." : "Não foi possível copiar.");
    return ok;
  }
  function openPremium() {
    setPreviewOpen(true);
  }
  async function ambos() {
    await copyWhatsapp(false);
    toast.success("WhatsApp copiado.");
    openPremium();
  }
  function save() {
    const snap = saveSnapshot(state);
    toast.success(`Estratégia de ${snap.nome} salva no histórico.`);
  }
  function update() {
    if (!sourceId) return;
    const snap = updateSnapshot(sourceId, state);
    if (snap) toast.success(`Relatório de ${snap.nome} atualizado no histórico.`);
    else toast.error("Este relatório não está mais no histórico. Salve como novo.");
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
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Qual versão deseja gerar?
        </h3>
        <div className="mt-3 grid gap-2.5">
          <Button className="justify-start" onClick={() => copyWhatsapp()}>
            <MessageCircle className="size-4" /> 1 · WhatsApp
          </Button>
          <Button variant="outline" className="justify-start" onClick={openPremium}>
            <FileText className="size-4" /> 2 · PDF Premium
          </Button>
          <Button variant="outline" className="justify-start" onClick={ambos}>
            <Copy className="size-4" /> 3 · Ambos
          </Button>
        </div>
        <Button variant="ghost" className="mt-2.5 w-full" onClick={() => setWaOpen((v) => !v)}>
          Prévia do WhatsApp
        </Button>
        {waOpen && (
          <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[12px] border border-[#1f2c33] bg-[#0b141a] p-4 font-sans text-[13.5px] leading-relaxed text-[#e9edef]">
            {reportWhatsapp(state)}
          </pre>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Estratégia</h3>
        <MemoryDialog
          state={state}
          trigger={<Button variant="outline" className="mt-3 w-full">Ver estratégia completa</Button>}
        />
        <BrandDialog trigger={<Button variant="outline" className="mt-2.5 w-full">Configurar marca</Button>} />
        {loaded ? (
          <>
            <Button className="mt-2.5 w-full" onClick={update}>
              Atualizar “{loaded.nome}” no histórico
            </Button>
            <Button variant="ghost" className="mt-2.5 w-full" onClick={save}>
              Salvar como novo (cópia)
            </Button>
          </>
        ) : (
          <Button variant="ghost" className="mt-2.5 w-full" onClick={save}>
            Salvar no histórico
          </Button>
        )}
      </div>

      {previewOpen && <PremiumPreview state={state} onClose={() => setPreviewOpen(false)} />}
    </div>
  );
}
