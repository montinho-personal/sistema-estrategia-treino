"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useHistoryStore, useStrategyStore } from "@/lib/store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString("pt-BR")} · ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

export function HistoryDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const snapshots = useHistoryStore((s) => s.snapshots);
  const deleteSnapshot = useHistoryStore((s) => s.deleteSnapshot);
  const loadSnapshot = useStrategyStore((s) => s.loadSnapshot);

  function openSnapshot(id: string) {
    const snap = snapshots.find((s) => s.id === id);
    if (!snap) return;
    if (confirm("Abrir esta estratégia? A estratégia atual em edição será substituída.")) {
      loadSnapshot(snap, snap.id);
      setOpen(false);
      router.push("/alunos/relatorio");
      toast.success("Estratégia carregada.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de estratégias</DialogTitle>
          <DialogDescription>
            Estratégias salvas neste navegador. Base para comparar ciclos e reutilizar planejamentos.
          </DialogDescription>
        </DialogHeader>
        {snapshots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma estratégia salva ainda. Salve a partir da etapa de Relatório.
          </p>
        ) : (
          <ul className="grid gap-2">
            {snapshots.map((snap) => (
              <li key={snap.id} className="flex items-center gap-3.5 rounded-[12px] border border-border bg-bg px-4 py-3.5">
                <div className="min-w-0">
                  <b className="text-[15px]">{snap.nome}</b>
                  <div className="text-[12.5px] text-muted-foreground">{formatDate(snap.savedAt)}</div>
                </div>
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => openSnapshot(snap.id)}
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
      </DialogContent>
    </Dialog>
  );
}
