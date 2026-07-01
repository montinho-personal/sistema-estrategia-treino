"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { buildMemory, firstIdOfTopic } from "@/lib/domain";
import type { StrategyState } from "@/lib/domain/schema";
import { useStrategyStore } from "@/lib/store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function MemoryDialog({
  state,
  trigger,
}: {
  state: StrategyState;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const setCurrentQ = useStrategyStore((s) => s.setCurrentQ);
  const sections = buildMemory(state);

  function edit(section: (typeof sections)[number]) {
    setOpen(false);
    if (section.editStep === "anamnese") {
      router.push("/alunos/anamnese");
    } else if (section.editTopic) {
      const fid = firstIdOfTopic(state, section.editTopic);
      if (fid) setCurrentQ(fid);
      router.push("/alunos/entrevista");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Estratégia em construção</DialogTitle>
          <DialogDescription>
            Tudo o que já foi definido para este aluno, organizado. Atualiza em tempo real.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2.5">
          {sections.map((section) => (
            <div key={section.title} className="rounded-[14px] border border-border bg-bg p-4">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="text-lg">{section.emoji}</span>
                <h3 className="flex-1 text-[15px] font-semibold tracking-[-0.01em]">{section.title}</h3>
                <button
                  type="button"
                  onClick={() => edit(section)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-gold transition-colors hover:border-gold"
                >
                  Editar
                </button>
              </div>
              <dl className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-[minmax(140px,36%)_1fr]">
                {section.rows.map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className={value ? "" : "text-border"}>{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
