"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Download, FileUp, Loader2, Sparkles, Upload } from "lucide-react";

import { analyzeHistory, memoryOverview, writingSamples, type Count } from "@/lib/domain";
import { useAiStore, useDnaStore, useHistoryStore } from "@/lib/store";
import { aiMethodologyReport, trainerMemory } from "@/lib/ai/anthropic";
import { exportBackup, importBackup } from "@/lib/store/backup";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NoteList } from "@/components/common/notes";
import { RichText } from "@/components/common/rich-text";
import { HistoryDialog } from "@/components/history/history-dialog";
import { CycleCompare } from "./cycle-compare";
import { AiMemory } from "./ai-memory";

const fmtData = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Card({
  title,
  hint,
  children,
  className,
  id,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 ${className ?? ""}`}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h2>
      {hint && <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-[12.5px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Barras horizontais de uma série (um tom de dourado); largura = % das estratégias. */
function Bars({ items, max = 5 }: { items: Count[]; max?: number }) {
  return (
    <ul className="grid gap-2.5">
      {items.slice(0, max).map((c) => (
        <li key={c.value} title={`${c.value}: ${c.count} (${c.pct}%)`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 break-words text-[13.5px] leading-snug">{c.value}</span>
            <span className="shrink-0 text-[12.5px] tabular-nums text-muted-foreground">
              {c.count}× · {c.pct}%
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gold-soft">
            <div className="h-full rounded-r-[4px] bg-gold" style={{ width: `${Math.max(c.pct, 3)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PainelView() {
  const snapshots = useHistoryStore((s) => s.snapshots);
  const principles = useDnaStore((s) => s.principles);
  const setPrinciples = useDnaStore((s) => s.setPrinciples);
  const analysis = useDnaStore((s) => s.analysis);
  const styleSamples = useDnaStore((s) => s.samples);
  const setAnalysis = useDnaStore((s) => s.setAnalysis);
  const aiConfig = useAiStore((s) => s.config);

  const ins = useMemo(() => analyzeHistory(snapshots), [snapshots]);
  const [draft, setDraft] = useState(principles);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = draft.trim() !== principles.trim();
  const novas = analysis ? ins.total - analysis.count : 0;

  async function analisar() {
    if (!aiConfig.key) {
      toast.error("Ligue o Assistente de IA para gerar a análise.", {
        description: "No topo, toque em “IA desligada” e informe sua chave da Anthropic.",
      });
      return;
    }
    setLoading(true);
    try {
      const text = await aiMethodologyReport(aiConfig, principles);
      setAnalysis({ text, at: new Date().toISOString(), count: ins.total });
      toast.success("Análise da sua metodologia pronta.");
    } catch (err) {
      toast.error("Não foi possível gerar a análise.", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const r = importBackup(await file.text());
      setDraft(useDnaStore.getState().principles);
      toast.success(`Backup importado: ${r.added} estratégia(s) nova(s).`, {
        description: r.added ? "O painel e a IA já consideram esses dados." : "Nada novo — tudo já estava neste aparelho.",
      });
    } catch (err) {
      toast.error("Não foi possível importar.", { description: err instanceof Error ? err.message : undefined });
    }
  }

  const overview = useMemo(
    () => memoryOverview(ins, principles, writingSamples(snapshots, styleSamples.map((x) => x.t))),
    [ins, principles, snapshots, styleSamples],
  );
  const principiosRef = useRef<HTMLTextAreaElement>(null);
  function editarPrincipios() {
    document.getElementById("principios")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => principiosRef.current?.focus({ preventScroll: true }), 400);
  }
  const temDados = ins.total > 0;

  return (
    <div className="grid gap-5">
      {!temDados && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-[15px] leading-relaxed">
          <p className="font-semibold">Ainda não há estratégias salvas neste aparelho.</p>
          <p className="mt-1.5 text-muted-foreground">
            O painel aprende com o histórico: cada relatório que você gera (WhatsApp ou PDF) entra nele sozinho e
            ensina o painel e a IA. Já enviou relatórios antes? Importe os PDFs e a IA reconstrói essas estratégias. Se
            elas estão em outro aparelho, use o <b>backup</b> no fim desta página.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <HistoryDialog
              startImport
              trigger={
                <Button size="sm">
                  <FileUp className="size-4" /> Importar relatórios antigos
                </Button>
              }
            />
            <Button asChild variant="outline" size="sm">
              <Link href="/alunos/relatorio">Ir para o relatório</Link>
            </Button>
          </div>
        </div>
      )}

      {temDados && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Estratégias analisadas" value={String(ins.total)} />
          <Stat label="Alunos" value={String(ins.alunos)} />
          <Stat label="Período" value={fmtData(ins.desde)} sub={ins.ate && ins.ate !== ins.desde ? `até ${fmtData(ins.ate)}` : undefined} />
          <Stat
            label="“Porquês” escritos por você"
            value={ins.porquesPct === null ? "—" : `${ins.porquesPct}%`}
            sub="o resto a IA completa"
          />
        </div>
      )}

      {temDados && (
        <Card
          title="Análise da sua metodologia (IA)"
          hint="A IA lê o cruzamento de todas as suas estratégias e aponta padrões, pontos cegos e oportunidades."
        >
          {analysis ? (
            <>
              <RichText body={analysis.text} />
              <p className="mt-4 text-[12.5px] text-muted-foreground">
                Feita em {fmtData(analysis.at)}, com {analysis.count} estratégia(s)
                {novas > 0 ? ` · ${novas} nova(s) desde então — vale atualizar.` : "."}
              </p>
            </>
          ) : (
            <p className="text-[14px] text-muted-foreground">Nenhuma análise ainda.</p>
          )}
          <Button className="mt-4" onClick={analisar} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {analysis ? "Atualizar análise" : "Gerar análise da minha metodologia"}
          </Button>
        </Card>
      )}

      {temDados && (
        <Card
          title="Comparar ciclos do mesmo aluno"
          hint="Escolha o aluno e dois ciclos: veja o que mudou no perfil, nas decisões e no volume — e gere a mensagem do novo ciclo."
        >
          <CycleCompare />
        </Card>
      )}

      <Card
        id="principios"
        className="scroll-mt-[calc(var(--nav-h,64px)+16px)]"
        title="Seus princípios — a IA sempre segue"
        hint="Escreva do seu jeito: regras que você sempre segue, o que evita, sua filosofia, como gosta de explicar ao aluno. Tudo aqui vai junto em cada sugestão e texto da IA."
      >
        <Textarea
          ref={principiosRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            "Ex.: Sempre começo o ciclo com 4 semanas de adaptação.\nIniciante não treina até a falha.\nPriorizo constância antes de intensidade.\nGosto de explicar o porquê de forma simples, como numa conversa."
          }
          className="min-h-[150px]"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              setPrinciples(draft.trim());
              toast.success("Princípios salvos — a IA já passa a considerá-los.");
            }}
            disabled={!dirty}
          >
            Salvar princípios
          </Button>
          {dirty && <span className="text-[12.5px] text-muted-foreground">Alterações não salvas</span>}
        </div>
      </Card>

      {temDados && ins.observacoes.length > 0 && (
        <Card title="Pontos de atenção" hint="Observações automáticas a partir das suas escolhas — sem IA.">
          <NoteList items={ins.observacoes} variant="warn" />
        </Card>
      )}

      {temDados && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Perfil dos seus alunos">
            <p className="mb-2 text-[13px] font-medium">Objetivo</p>
            <Bars items={ins.objetivos} />
            {ins.experiencias.length > 0 && (
              <>
                <p className="mb-2 mt-5 text-[13px] font-medium">Experiência</p>
                <Bars items={ins.experiencias} />
              </>
            )}
          </Card>

          <Card title="Seu padrão por objetivo" hint="A decisão que você mais usa em cada tipo de aluno.">
            <div className="grid gap-4">
              {ins.porObjetivo.map((p) => (
                <div key={p.objetivo} className="rounded-xl border border-border p-3.5">
                  <p className="text-[14px] font-semibold">
                    {p.objetivo} <span className="font-normal text-muted-foreground">· {p.n} estratégia(s)</span>
                  </p>
                  {p.destaques.length ? (
                    <dl className="mt-2 grid gap-1.5 text-[13px]">
                      {p.destaques.map((d) => (
                        <div key={d.label} className="flex gap-2">
                          <dt className="w-[92px] shrink-0 text-muted-foreground">{d.label}</dt>
                          <dd className="min-w-0 break-words">
                            {d.value} <span className="text-muted-foreground">({d.count}/{d.of})</span>
                          </dd>
                        </div>
                      ))}
                      {p.volumeMedio !== null && (
                        <div className="flex gap-2">
                          <dt className="w-[92px] shrink-0 text-muted-foreground">Volume</dt>
                          <dd>{p.volumeMedio} séries/semana em média</dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="mt-1.5 text-[13px] text-muted-foreground">Sem decisões registradas.</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {temDados && ins.volume.length > 0 && (
        <Card
          title="Volume médio por grupo muscular"
          hint={`Séries por semana, nas ${ins.comVolume} estratégia(s) com tabela de volume${ins.volumeTotalMedio ? ` · total médio de ${ins.volumeTotalMedio} séries/semana` : ""}.`}
        >
          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-x-8">
            {ins.volume.slice(0, 12).map((v) => {
              const maxMedia = ins.volume[0]?.media || 1;
              return (
                <li key={v.grupo} title={`${v.grupo}: ${v.media} séries/semana (em ${v.n} estratégia(s))`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13.5px]">{v.grupo}</span>
                    <span className="text-[12.5px] tabular-nums text-muted-foreground">
                      {String(v.media).replace(".", ",")} séries
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gold-soft">
                    <div className="h-full rounded-r-[4px] bg-gold" style={{ width: `${(v.media / maxMedia) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {temDados && (
        <Card title="Suas escolhas mais frequentes" hint="Em cada pergunta, o que você mais escolhe (sobre as estratégias que responderam).">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-x-8">
            {ins.escolhas.map((e) => (
              <div key={e.id}>
                <p className="mb-2 text-[13px] font-medium">
                  {e.label} <span className="font-normal text-muted-foreground">· {e.answered}</span>
                </p>
                <Bars items={e.top} max={3} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card
        title="O que a IA sabe sobre você"
        hint="Esta é a memória que vai junto em cada pedido à IA: seus padrões de decisão, seus princípios e o seu jeito de escrever."
      >
        <AiMemory overview={overview} memoryText={trainerMemory} onEditPrinciples={editarPrincipios} />
      </Card>

      <Card
        title="Backup do aprendizado"
        hint="Seus dados ficam só neste navegador. Para levar o histórico, os princípios e o aprendizado do PC para o celular (ou vice-versa), exporte aqui e importe no outro aparelho. Relatórios antigos que não estão no histórico podem entrar pelo PDF."
      >
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => exportBackup()}>
            <Download className="size-4" /> Exportar backup
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Importar backup
          </Button>
          <HistoryDialog
            startImport
            trigger={
              <Button variant="outline">
                <FileUp className="size-4" /> Importar relatórios antigos (PDF)
              </Button>
            }
          />
        </div>
      </Card>
    </div>
  );
}
