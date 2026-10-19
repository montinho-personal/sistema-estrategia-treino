"use client";

import { useState } from "react";
import { Brain, Check, FileText, ListChecks, PenLine, Quote, Shuffle, Target, TrendingUp, Users } from "lucide-react";

import { META_ESTRATEGIAS, type DecisionPattern, type MemoryOverview, type PatternStrength } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const GRUPOS: { key: PatternStrength; title: string; hint: string; icon: typeof Target }[] = [
  { key: "forte", title: "Padrões fortes", hint: "Você quase sempre escolhe isso. A IA usa como padrão.", icon: Target },
  { key: "tendencia", title: "Tendências", hint: "Você costuma escolher. A IA sugere como ponto de partida.", icon: TrendingUp },
  { key: "varia", title: "Você varia", hint: "Muda de aluno para aluno. A IA decide pela anamnese.", icon: Shuffle },
];

/** Uma decisão: pergunta, sua escolha mais comum e com que frequência. */
function PatternRow({ p }: { p: DecisionPattern }) {
  return (
    <li title={`${p.label}: ${p.value} — ${p.count} de ${p.of} estratégias (${p.pct}%)`}>
      <p className="text-[12px] text-muted-foreground">{p.label}</p>
      <p className="line-clamp-2 break-words text-[13.5px] font-medium leading-snug">{p.value}</p>
      <div className="mt-1.5 flex items-center gap-2.5">
        <div className="h-1.5 flex-1 rounded-full bg-gold-soft">
          <div className="h-full rounded-r-[4px] bg-gold" style={{ width: `${Math.max(p.pct, 3)}%` }} />
        </div>
        <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
          {p.count} de {p.of}
        </span>
      </div>
    </li>
  );
}

function Tile({ icon: Icon, label, value, sub }: { icon: typeof Brain; label: string; value: string; sub: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-bg p-3 sm:p-4">
      <p className="flex items-start gap-1.5 text-[11.5px] leading-tight text-muted-foreground sm:text-[12.5px]">
        <Icon className="mt-px size-3.5 shrink-0" /> {label}
      </p>
      <p className="mt-1 text-[22px] font-semibold leading-tight tracking-[-0.02em] sm:text-[24px]">{value}</p>
      <p className="mt-0.5 hidden text-[12px] text-muted-foreground sm:block">{sub}</p>
    </div>
  );
}

/**
 * Painel → "O que a IA sabe sobre você": a memória que vai junto em cada pedido
 * à IA, apresentada como painel (nível, padrões por força, princípios e escrita).
 * O texto exato enviado continua disponível para conferência.
 */
export function AiMemory({
  overview: m,
  memoryText,
  onEditPrinciples,
}: {
  overview: MemoryOverview;
  memoryText: () => string;
  onEditPrinciples: () => void;
}) {
  const [raw, setRaw] = useState(false);
  const [todasAmostras, setTodasAmostras] = useState(false);
  const decisoes = m.padroes.forte.length + m.padroes.tendencia.length + m.padroes.varia.length;
  const vazia = !m.estrategias && !m.principios.length && !m.amostras.length;
  const amostras = todasAmostras ? m.amostras : m.amostras.slice(0, 2);

  if (vazia) {
    return (
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        A memória ainda está vazia. Ela se enche sozinha a cada relatório que você gera, e você pode adiantar escrevendo
        seus princípios acima.
      </p>
    );
  }

  return (
    <div className="grid gap-6">
      {/* nível de conhecimento */}
      <div className="rounded-xl bg-gold-soft p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-[15px] font-semibold">
            <Brain className="size-5 text-gold" /> {m.nivel.label}
          </p>
          <span className="text-[12.5px] tabular-nums text-muted-foreground">
            {Math.min(m.estrategias, META_ESTRATEGIAS)} de {META_ESTRATEGIAS} estratégias
          </span>
        </div>
        <div
          className="mt-3 h-2.5 rounded-full bg-surface"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={META_ESTRATEGIAS}
          aria-valuenow={Math.min(m.estrategias, META_ESTRATEGIAS)}
          aria-label="Estratégias estudadas pela IA"
        >
          <div className="h-full rounded-r-[4px] bg-gold" style={{ width: `${Math.max(m.nivel.pct, 2)}%` }} />
        </div>
        <p className="mt-2.5 text-[13px] leading-snug text-muted-foreground">
          {m.estrategias >= META_ESTRATEGIAS
            ? "Seus padrões já têm base sólida. Cada nova estratégia continua refinando."
            : `Com ${META_ESTRATEGIAS} estratégias os padrões ficam confiáveis. Cada relatório que você gera ensina a IA — e os PDFs antigos também contam (Histórico → Importar).`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Tile icon={FileText} label="Estratégias estudadas" value={String(m.estrategias)} sub={`de ${m.alunos} aluno(s)`} />
        <Tile
          icon={ListChecks}
          label="Seus princípios"
          value={String(m.principios.length)}
          sub={m.principios.length ? "regras que a IA sempre segue" : "nenhum escrito ainda"}
        />
        <Tile icon={PenLine} label="Exemplos da sua escrita" value={String(m.amostras.length)} sub="para imitar o seu tom" />
      </div>

      {/* perfil dos alunos (depende do aluno, não é decisão de método) */}
      {m.perfil.length > 0 && (
        <div>
          <h3 className="flex items-center gap-1.5 text-[15px] font-semibold">
            <Users className="size-4 text-gold" /> Seus alunos, na maioria
          </h3>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {m.perfil.map((p) => (
              <li
                key={p.id}
                title={`${p.label}: ${p.value} — ${p.count} de ${p.of} estratégias`}
                className="rounded-full border border-border bg-bg px-3 py-1.5 text-[13px]"
              >
                <span className="text-muted-foreground">{p.label}:</span> <b className="font-medium">{p.value}</b>{" "}
                <span className="tabular-nums text-muted-foreground">
                  · {p.count} de {p.of}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* jeito de decidir */}
      {decisoes > 0 && (
        <div>
          <h3 className="text-[15px] font-semibold">Seu jeito de decidir</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Em cada decisão do treino, a sua escolha mais comum — e quanto a IA se apoia nela.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {GRUPOS.map(({ key, title, hint, icon: Icon }) => (
              <section
                key={key}
                className={cn("rounded-xl border p-4", key === "forte" ? "border-gold/40 bg-gold-soft/40" : "border-border")}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[14px] font-semibold">
                    <Icon className={cn("size-4", key === "forte" ? "text-gold" : "text-muted-foreground")} /> {title}
                  </p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[12px] tabular-nums">{m.padroes[key].length}</span>
                </div>
                <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">{hint}</p>
                {m.padroes[key].length ? (
                  <ul className="mt-3.5 grid gap-3.5">
                    {m.padroes[key].map((p) => (
                      <PatternRow key={p.id} p={p} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[13px] text-muted-foreground">Nenhuma decisão aqui por enquanto.</p>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {/* princípios */}
        <section className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold">
            <ListChecks className="size-4 text-gold" /> Seus princípios
          </p>
          {m.principios.length ? (
            <ul className="mt-3 grid gap-2">
              {m.principios.map((t, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] leading-snug">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold" />
                  <span className="min-w-0 break-words">{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
              Você ainda não escreveu seus princípios. São as regras que a IA segue sempre — vale muito a pena.
            </p>
          )}
          <Button variant="outline" size="sm" className="mt-3" onClick={onEditPrinciples}>
            {m.principios.length ? "Editar princípios" : "Escrever meus princípios"}
          </Button>
        </section>

        {/* escrita */}
        <section className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold">
            <Quote className="size-4 text-gold" /> Como você escreve
          </p>
          {m.amostras.length ? (
            <>
              <ul className="mt-3 grid gap-2.5">
                {amostras.map((t, i) => (
                  <li key={i} className="border-l-2 border-gold/60 pl-3 text-[13.5px] italic leading-relaxed">
                    “{t}”
                  </li>
                ))}
              </ul>
              {m.amostras.length > 2 && (
                <button
                  type="button"
                  onClick={() => setTodasAmostras((v) => !v)}
                  className="mt-2.5 text-[13px] font-medium text-gold hover:underline"
                >
                  {todasAmostras ? "Mostrar menos" : `Ver todos (${m.amostras.length})`}
                </button>
              )}
            </>
          ) : (
            <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
              Ainda sem exemplos. Eles vêm dos “porquês” e das mensagens finais que você escreve nas estratégias.
            </p>
          )}
        </section>
      </div>

      <div>
        <Button variant="ghost" size="sm" onClick={() => setRaw((v) => !v)}>
          {raw ? "Esconder o texto técnico" : "Ver o texto exato que vai para a IA"}
        </Button>
        {raw && (
          <pre className="mt-2 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-bg p-4 font-sans text-[12.5px] leading-relaxed text-muted-foreground">
            {memoryText()}
          </pre>
        )}
      </div>
    </div>
  );
}
