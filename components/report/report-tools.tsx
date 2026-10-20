"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, FileText, Copy, ArrowLeft, Send } from "lucide-react";

import { completion, exportarParaApp, nomeArquivoApp, reportWhatsapp, sameStrategy } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import {
  autoSaveStrategy,
  replacePreviousVersion,
  useHistoryStore,
  useStrategyStore,
  type AutoSaveResult,
} from "@/lib/store";
import { copyToClipboard } from "@/lib/clipboard";
import { Button } from "@/components/ui/button";
import { MemoryDialog } from "@/components/memory/memory-dialog";
import { BrandDialog } from "@/components/brand/brand-dialog";
import { PremiumPreview } from "@/components/premium/premium-preview";

const fmtData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) +
  " · " +
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** O que o salvamento automático fez, para mostrar junto do aviso de cópia/PDF. */
function saveNote(r: AutoSaveResult): string | undefined {
  if (r.kind === "created") return "Estratégia salva automaticamente no histórico.";
  if (r.kind === "updated") return "Histórico atualizado.";
  if (r.kind === "version") return "Salva no histórico como nova versão — a anterior continua guardada.";
  return undefined;
}

export function ReportTools({ state }: { state: StrategyState }) {
  const router = useRouter();
  const saveSnapshot = useHistoryStore((s) => s.saveSnapshot);
  const updateSnapshot = useHistoryStore((s) => s.updateSnapshot);
  const snapshots = useHistoryStore((s) => s.snapshots);
  const sourceId = useStrategyStore((s) => s.sourceId);
  const sourceOwned = useStrategyStore((s) => s.sourceOwned);
  const setSource = useStrategyStore((s) => s.setSource);
  const loaded = sourceId ? snapshots.find((s) => s.id === sourceId) : undefined;
  const salva = loaded ? sameStrategy(loaded, state) : false;
  const [waOpen, setWaOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const comp = completion(state);

  /** Aviso de sucesso + o que foi salvo no histórico (com "desfazer" da nova versão). */
  function notify(title: string, r: AutoSaveResult) {
    toast.success(title, {
      description: saveNote(r),
      ...(r.kind === "version"
        ? {
            duration: 12000,
            action: {
              label: "Substituir a anterior",
              onClick: () => {
                const u = replacePreviousVersion(state, r);
                toast.success(u ? `Versão anterior de ${u.nome} substituída.` : "A versão anterior não está mais no histórico.");
              },
            },
          }
        : {}),
    });
  }

  async function copyWhatsapp() {
    const r = autoSaveStrategy(state);
    const ok = await copyToClipboard(reportWhatsapp(state));
    if (ok) notify("Texto do WhatsApp copiado.", r);
    else toast.error("Não foi possível copiar.", { description: saveNote(r) });
  }
  function openPremium() {
    const r = autoSaveStrategy(state);
    const note = saveNote(r);
    if (r.kind === "version") notify("PDF Premium aberto.", r);
    else if (note) toast.success(note);
    setPreviewOpen(true);
  }
  async function ambos() {
    const r = autoSaveStrategy(state);
    const ok = await copyToClipboard(reportWhatsapp(state));
    if (ok) notify("WhatsApp copiado.", r);
    else toast.error("Não foi possível copiar o WhatsApp.", { description: saveNote(r) });
    setPreviewOpen(true);
  }
  /** Arquivo de dados para importar no app Montinho (cadastro do aluno). */
  function enviarParaApp() {
    const r = autoSaveStrategy(state);
    const blob = new Blob([JSON.stringify(exportarParaApp(state), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivoApp(state);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Arquivo para o app Montinho baixado.", r);
  }
  /** Mesmo conteúdo do arquivo, copiado: no celular é só colar no app (sem procurar arquivo). */
  async function copiarParaApp() {
    const r = autoSaveStrategy(state);
    const ok = await copyToClipboard(JSON.stringify(exportarParaApp(state)));
    if (ok) notify("Estratégia copiada. No app Montinho, toque em “Colar do Strategy”.", r);
    else toast.error("Não foi possível copiar.", { description: saveNote(r) });
  }
  function save() {
    const snap = saveSnapshot(state);
    setSource(snap.id, true);
    toast.success(`Estratégia de ${snap.nome} salva no histórico.`);
  }
  function update() {
    if (!sourceId) return;
    const snap = updateSnapshot(sourceId, state);
    if (snap) {
      setSource(snap.id, true);
      toast.success(`Relatório de ${snap.nome} atualizado no histórico.`);
    } else toast.error("Este relatório não está mais no histórico. Salve como novo.");
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
          <Button className="justify-start" onClick={copyWhatsapp}>
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
        <div className="mt-3 border-t border-border pt-3">
          <div className="grid gap-2">
            <Button variant="outline" className="w-full justify-start" onClick={copiarParaApp}>
              <Copy className="size-4" /> Copiar para o app Montinho
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={enviarParaApp}>
              <Send className="size-4" /> Baixar arquivo para o app
            </Button>
          </div>
          <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
            No celular, use “Copiar”: no app, em Alunos → Novo aluno (ou no perfil do aluno → Estratégia), toque em “Colar do Strategy”. No computador, pode baixar o arquivo e escolher no app. O app monta os dias da semana por músculo com as metas de séries.
          </p>
        </div>
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
        <p className="mt-3 text-[12.5px] leading-snug text-muted-foreground">
          {salva && loaded
            ? `✓ Salva no histórico · ${fmtData(loaded.updatedAt ?? loaded.savedAt)}`
            : loaded && !sourceOwned
              ? "Você alterou uma estratégia aberta do histórico. Ao gerar o relatório, ela entra como nova versão (a anterior fica guardada) — ou toque em “Atualizar” para corrigir a anterior."
              : "Ao gerar o WhatsApp ou o PDF, a estratégia é salva sozinha no histórico."}
        </p>
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
