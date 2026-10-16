"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Loader2, MessageCircle } from "lucide-react";

import { compareCycles, comparisonText, studentsWithCycles, type DecisionStatus } from "@/lib/domain";
import { useAiStore, useHistoryStore } from "@/lib/store";
import { aiCycleMessage } from "@/lib/ai/anthropic";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

const fmtData = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "sem data";

const STATUS: Record<DecisionStatus, { label: string; cls: string }> = {
  mudou: { label: "Mudou", cls: "border-gold/50 bg-gold-soft text-foreground" },
  novo: { label: "Novo", cls: "border-emerald-300/70 bg-emerald-50 text-emerald-800" },
  removido: { label: "Retirado", cls: "border-rose-300/70 bg-rose-50 text-rose-800" },
  mantido: { label: "Mantido", cls: "border-border bg-secondary text-muted-foreground" },
};

const sinal = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2.5 text-[13px] font-semibold">{title}</h3>
      {children}
    </div>
  );
}

/** Painel: compara dois ciclos (estratégias salvas) do mesmo aluno. */
export function CycleCompare() {
  const snapshots = useHistoryStore((s) => s.snapshots);
  const aiConfig = useAiStore((s) => s.config);
  const alunos = useMemo(() => studentsWithCycles(snapshots), [snapshots]);

  const [alunoKey, setAlunoKey] = useState("");
  const aluno = alunos.find((a) => a.key === alunoKey) ?? alunos[0];
  const n = aluno?.ciclos.length ?? 0;
  const [sel, setSel] = useState<{ a: number; b: number } | null>(null);
  const ia = Math.min(sel?.a ?? n - 2, n - 1);
  const ib = Math.min(sel?.b ?? n - 1, n - 1);
  const [todos, setTodos] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const antes = aluno?.ciclos[ia];
  const depois = aluno?.ciclos[ib];
  const comp = useMemo(() => (antes && depois ? compareCycles(antes, depois) : null), [antes, depois]);

  if (!alunos.length) {
    return (
      <p className="text-[14px] leading-relaxed text-muted-foreground">
        Nenhum aluno tem 2 ciclos salvos ainda. Para registrar um novo ciclo: abra a estratégia anterior em{" "}
        <b>Histórico</b> (ou use <b>“Começar a partir de uma estratégia parecida”</b>, que reconhece o mesmo aluno),
        ajuste o que muda e, no relatório, toque em <b>“Salvar como novo (cópia)”</b> — não em “Atualizar”, que
        substitui o ciclo anterior.
      </p>
    );
  }

  const perfil = comp?.perfil.filter((p) => todos || p.mudou) ?? [];
  const decisoes = comp?.decisoes.filter((d) => todos || d.status !== "mantido") ?? [];
  const volume = comp?.volume.filter((v) => todos || v.delta !== 0) ?? [];

  async function gerarMensagem() {
    if (!comp || !depois || !aluno) return;
    if (!aiConfig.key) {
      toast.error("Ligue o Assistente de IA para gerar a mensagem.");
      return;
    }
    setLoading(true);
    try {
      setMsg(await aiCycleMessage(aiConfig, aluno.nome.split(" ")[0], comparisonText(comp, depois)));
    } catch (err) {
      toast.error("Não foi possível gerar a mensagem.", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  }

  const ciclos = aluno.ciclos.map((c, i) => (
    <option key={i} value={i}>
      Ciclo {i + 1} · {fmtData(c.savedAt)}
    </option>
  ));

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="cc_aluno">Aluno</Label>
          <NativeSelect
            id="cc_aluno"
            value={aluno.key}
            onChange={(e) => {
              setAlunoKey(e.target.value);
              setSel(null);
              setMsg("");
            }}
          >
            {alunos.map((a) => (
              <option key={a.key} value={a.key}>
                {a.nome} ({a.ciclos.length} ciclos)
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="cc_a">Ciclo anterior</Label>
          <NativeSelect id="cc_a" value={ia} onChange={(e) => { setSel({ a: Number(e.target.value), b: ib }); setMsg(""); }}>
            {ciclos}
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="cc_b">Ciclo novo</Label>
          <NativeSelect id="cc_b" value={ib} onChange={(e) => { setSel({ a: ia, b: Number(e.target.value) }); setMsg(""); }}>
            {ciclos}
          </NativeSelect>
        </div>
      </div>

      {ia === ib ? (
        <p className="mt-4 text-[14px] text-muted-foreground">Escolha dois ciclos diferentes para comparar.</p>
      ) : (
        comp && (
          <>
            <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
              <span className="rounded-full bg-gold-soft px-3 py-1 font-medium">{comp.mudaram} decisões mudaram</span>
              <span className="rounded-full bg-secondary px-3 py-1">{comp.mantidas} mantidas</span>
              {comp.dias !== null && <span className="rounded-full bg-secondary px-3 py-1">{comp.dias} dias entre os ciclos</span>}
              {comp.totalAntes !== null && comp.totalDepois !== null && (
                <span className="rounded-full bg-secondary px-3 py-1">
                  Volume {comp.totalAntes} → {comp.totalDepois} séries/sem ({sinal(comp.totalDepois - comp.totalAntes)})
                </span>
              )}
            </div>
            <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
              <input type="checkbox" checked={todos} onChange={(e) => setTodos(e.target.checked)} className="size-4 accent-[var(--gold)]" />
              Mostrar também o que se manteve
            </label>

            {perfil.length > 0 && (
              <Section title="Perfil do aluno">
                <ul className="grid gap-2">
                  {perfil.map((p) => (
                    <li key={p.id} className="rounded-lg border border-border px-3.5 py-2.5 text-[13.5px]">
                      <span className="text-muted-foreground">{p.label}:</span>{" "}
                      {p.mudou ? (
                        <>
                          <span className="text-muted-foreground line-through">{p.antes || "—"}</span>{" "}
                          <span className="text-gold">→</span> <b className="font-medium">{p.depois || "—"}</b>
                        </>
                      ) : (
                        <span>{p.depois}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            <Section title="Decisões do treino">
              {decisoes.length ? (
                <ul className="grid gap-2">
                  {decisoes.map((d) => (
                    <li key={d.id} className="rounded-lg border border-border px-3.5 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[13.5px] font-medium">{d.label}</span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11.5px] font-semibold", STATUS[d.status].cls)}>
                          {STATUS[d.status].label}
                        </span>
                      </div>
                      <div className="mt-1.5 text-[13px] leading-snug">
                        {d.status === "mantido" && <span>{d.depois.join(", ")}</span>}
                        {d.status === "novo" && <span>{d.depois.join(", ")}</span>}
                        {d.status === "removido" && <span className="text-muted-foreground line-through">{d.antes.join(", ")}</span>}
                        {d.status === "mudou" &&
                          (d.antes.length > 1 || d.depois.length > 1 ? (
                            <span className="flex flex-wrap gap-1.5">
                              {d.entrou.map((x) => (
                                <span key={`+${x}`} className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-800">+ {x}</span>
                              ))}
                              {d.saiu.map((x) => (
                                <span key={`-${x}`} className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-800 line-through">− {x}</span>
                              ))}
                              {d.depois
                                .filter((x) => !d.entrou.includes(x))
                                .map((x) => (
                                  <span key={`=${x}`} className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">{x}</span>
                                ))}
                            </span>
                          ) : (
                            <>
                              <span className="text-muted-foreground line-through">{d.antes.join(", ")}</span>{" "}
                              <span className="text-gold">→</span> <b className="font-medium">{d.depois.join(", ")}</b>
                            </>
                          ))}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13.5px] text-muted-foreground">Nenhuma decisão mudou entre esses ciclos.</p>
              )}
            </Section>

            {volume.length > 0 && (
              <Section title="Volume semanal (séries por grupo)">
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-[13.5px]">
                    <thead className="bg-bg text-[11.5px] uppercase tracking-[0.05em] text-muted-foreground">
                      <tr>
                        <th className="px-3.5 py-2 text-left font-semibold">Grupo</th>
                        <th className="px-3.5 py-2 text-right font-semibold">Antes</th>
                        <th className="px-3.5 py-2 text-right font-semibold">Agora</th>
                        <th className="px-3.5 py-2 text-right font-semibold">Diferença</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volume.map((v) => (
                        <tr key={v.grupo} className="border-t border-border">
                          <td className="px-3.5 py-2">{v.grupo}</td>
                          <td className="px-3.5 py-2 text-right tabular-nums text-muted-foreground">{v.antes ?? "—"}</td>
                          <td className="px-3.5 py-2 text-right tabular-nums">{v.depois ?? "—"}</td>
                          <td className="px-3.5 py-2 text-right font-medium tabular-nums">
                            {v.delta !== null ? sinal(v.delta) : v.depois === null ? "saiu" : "novo"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            <Section title="Mensagem para o aluno">
              <p className="mb-3 text-[13px] text-muted-foreground">
                A IA escreve uma mensagem de WhatsApp apresentando o novo ciclo: o que evoluiu, o que muda e por quê.
              </p>
              <Button onClick={gerarMensagem} disabled={loading} variant={msg ? "outline" : "default"}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
                {msg ? "Gerar outra versão" : "Gerar mensagem do novo ciclo"}
              </Button>
              {msg && (
                <div className="mt-3">
                  <pre className="whitespace-pre-wrap rounded-[12px] border border-[#1f2c33] bg-[#0b141a] p-4 font-sans text-[13.5px] leading-relaxed text-[#e9edef]">
                    {msg}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={async () =>
                      (await copyToClipboard(msg)) ? toast.success("Mensagem copiada.") : toast.error("Não foi possível copiar.")
                    }
                  >
                    <Copy className="size-4" /> Copiar mensagem
                  </Button>
                </div>
              )}
            </Section>
          </>
        )
      )}
    </div>
  );
}
