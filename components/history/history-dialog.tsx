"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUp } from "lucide-react";

import { hasUnsavedWork, unsavedWarning, useHistoryStore, useStrategyStore, type StrategySnapshot } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImportReport } from "./import-report";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

/** startImport: abre direto em "Importar relatório antigo". */
export function HistoryDialog({ trigger, startImport = false }: { trigger: ReactNode; startImport?: boolean }) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const router = useRouter();
  const snapshots = useHistoryStore((s) => s.snapshots);
  const deleteSnapshot = useHistoryStore((s) => s.deleteSnapshot);
  const loadSnapshot = useStrategyStore((s) => s.loadSnapshot);
  const sourceId = useStrategyStore((s) => s.sourceId);
  // mais recente primeiro (relatórios importados entram na data em que foram enviados)
  const lista = useMemo(() => [...snapshots].sort((a, b) => b.savedAt.localeCompare(a.savedAt)), [snapshots]);

  function load(snap: StrategySnapshot, owned: boolean) {
    loadSnapshot(snap, snap.id, owned);
    setOpen(false);
    setImporting(false);
    router.push("/alunos/relatorio");
    toast.success("Estratégia carregada.");
  }

  function openSnapshot(snap: StrategySnapshot) {
    if (snap.id === sourceId) {
      setOpen(false);
      router.push("/alunos/relatorio");
      return;
    }
    const msg = hasUnsavedWork()
      ? `${unsavedWarning()}\n\nAbrir “${snap.nome}” mesmo assim?`
      : `Abrir a estratégia de ${snap.nome}?`;
    if (confirm(msg)) load(snap, false);
  }

  /** Relatório importado: salvo e aberto para ajustar (as mudanças atualizam a mesma entrada). */
  function openImported(snap: StrategySnapshot) {
    if (!hasUnsavedWork() || confirm(`${unsavedWarning()}\n\nAbrir “${snap.nome}” mesmo assim?`)) load(snap, true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setImporting(v && startImport);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de estratégias</DialogTitle>
          <DialogDescription>
            Estratégias salvas neste navegador. Toda vez que você gera o WhatsApp ou o PDF, a estratégia entra aqui
            sozinha.
          </DialogDescription>
        </DialogHeader>
        {importing ? (
          <ImportReport onBack={() => setImporting(false)} onOpen={openImported} />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-dashed border-border px-4 py-3">
              <p className="text-[13px] leading-snug text-muted-foreground">
                Tem relatórios antigos que não estão aqui? Envie o PDF e a IA reconstrói a estratégia.
              </p>
              <Button variant="outline" size="sm" onClick={() => setImporting(true)}>
                <FileUp className="size-4" /> Importar relatório antigo
              </Button>
            </div>
            {lista.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma estratégia salva ainda. Ela entra aqui quando você gera o relatório (WhatsApp ou PDF).
              </p>
            ) : (
              <ul className="grid min-w-0 gap-2">
                {lista.map((snap) => (
                  <li key={snap.id} className="flex items-center gap-3.5 rounded-[12px] border border-border bg-bg px-4 py-3.5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <b className="text-[15px]">{snap.nome}</b>
                        {snap.id === sourceId && (
                          <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold">em edição</span>
                        )}
                        {snap.origem === "importado" && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                            importado
                          </span>
                        )}
                      </div>
                      {snap.anamnese.tituloPlano && (
                        <div className="line-clamp-2 break-words text-[13px]">{snap.anamnese.tituloPlano}</div>
                      )}
                      <div className="text-[12.5px] text-muted-foreground">
                        {formatDate(snap.savedAt)}
                        {snap.updatedAt && !snap.updatedAt.startsWith(snap.savedAt.slice(0, 10)) && (
                          <> · atualizada em {new Date(snap.updatedAt).toLocaleDateString("pt-BR")}</>
                        )}
                      </div>
                    </div>
                    <span className="flex-1" />
                    <button
                      type="button"
                      onClick={() => openSnapshot(snap)}
                      className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] transition-colors hover:border-muted-foreground/50"
                    >
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={() => confirm("Excluir esta estratégia do histórico?") && deleteSnapshot(snap.id)}
                      className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-red-600 transition-colors hover:border-red-300"
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
