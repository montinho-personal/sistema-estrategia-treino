"use client";

import { toast } from "sonner";
import { Copy, X } from "lucide-react";

import { answersFromBase, essentialItems, type SimilarMatch } from "@/lib/domain";
import { val } from "@/lib/domain/util";
import { useStrategyStore, type StrategySnapshot } from "@/lib/store";
import { Button } from "@/components/ui/button";

const fmtData = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";

function nivel(score: number): string {
  if (score >= 80) return "muito parecida";
  if (score >= 55) return "parecida";
  return "algo parecida";
}

/** Resumo das decisões principais da estratégia-base. */
function resumo(s: StrategySnapshot): string {
  return [val(s.answers.divisao_qual), val(s.answers.intensidade_estrategia), val(s.answers.periodizacao_fases)]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Oferece começar a entrevista a partir das decisões de uma estratégia
 * parecida do histórico. Só aparece enquanto a entrevista ainda não começou.
 */
export function SimilarStart({
  matches,
  onDismiss,
}: {
  matches: SimilarMatch<StrategySnapshot>[];
  onDismiss: () => void;
}) {
  const patch = useStrategyStore((s) => s.patch);

  function usar(m: SimilarMatch<StrategySnapshot>) {
    const st = useStrategyStore.getState();
    const { answers, volume, copiadas } = answersFromBase(m.record, st);
    const first = essentialItems({ ...st, answers })[0]?.q.id ?? null;
    patch({ answers, volume, currentQ: first });
    toast.success(`${copiadas} decisões de ${m.record.nome} carregadas.`, {
      description: "Revise tópico a tópico e ajuste o que for diferente para este aluno.",
    });
    onDismiss();
  }

  return (
    <section className="mb-5 rounded-2xl border border-gold/40 bg-gold-soft p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-semibold tracking-[-0.01em]">
            <span className="text-gold">✦</span> Começar a partir de uma estratégia parecida
          </h2>
          <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
            Achei no seu histórico alunos com perfil parecido. Use as decisões de um deles como ponto de partida —
            você revisa e ajusta tudo na entrevista. Textos pessoais (porquês, mensagem final) não são copiados, e o
            que veio da anamnese deste aluno é mantido.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Começar do zero"
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <ul className="mt-4 grid gap-2.5">
        {matches.map((m) => (
          <li key={m.record.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-[14.5px] font-semibold">
                {m.record.nome}{" "}
                <span className="text-[12.5px] font-normal text-muted-foreground">· {fmtData(m.record.savedAt)}</span>
              </p>
              <span className="text-[12.5px] font-medium text-gold">
                {nivel(m.score)} · {m.score}%
              </span>
            </div>
            {m.reasons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.reasons.map((r) => (
                  <span key={r} className="rounded-full border border-border px-2.5 py-0.5 text-[12px] text-muted-foreground">
                    {r}
                  </span>
                ))}
              </div>
            )}
            {resumo(m.record) && <p className="mt-2 text-[13px] leading-snug">{resumo(m.record)}</p>}
            <Button size="sm" className="mt-3" onClick={() => usar(m)}>
              <Copy className="size-4" /> Usar como base ({m.decisoes} decisões)
            </Button>
          </li>
        ))}
      </ul>

      <Button variant="ghost" size="sm" className="mt-3" onClick={onDismiss}>
        Começar do zero
      </Button>
    </section>
  );
}
