"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, MessageCircle, Plus, RotateCcw, X } from "lucide-react";

import {
  PHASE_FOCUS,
  hasContent,
  phaseChangeDefaults,
  phaseChangeWhatsapp,
  phaseTitle,
  type PhaseChange,
  type PhaseChangeKind,
  type PhaseFocus,
} from "@/lib/domain";
import { INTENSIDADE_HINTS } from "@/lib/domain/config/option-details";
import { phaseKey, usePhaseStore, useStrategyStore } from "@/lib/store";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { PhasePreview } from "./phase-preview";

/** Campos que são sugestão automática: trocam junto com o tipo/foco, se não foram editados. */
const SUGERIDOS = ["deNome", "paraNome", "porque", "mudancas", "mantem", "normal", "missao", "semanas"] as const;

const TIPOS: { id: PhaseChangeKind; title: string; hint: string }[] = [
  { id: "progressao", title: "Subir o nível", hint: "Mesmo foco, mais desafio: técnicas avançadas, mais séries, troca de um ou outro exercício." },
  { id: "foco", title: "Mudar o foco", hint: "Cada mês com um objetivo: força, hipertrofia, resistência." },
];

function Card({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2.5 text-[15px] font-semibold">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[12px] text-primary-foreground">{n}</span>
        {title}
      </h2>
      {hint && <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Remover linha" className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
      <X className="size-4" />
    </button>
  );
}

export function PhaseWorkspace() {
  const state = useStrategyStore();
  const key = phaseKey(state.anamnese.nome);
  const draft = usePhaseStore((s) => s.drafts[key]);
  const setDraft = usePhaseStore((s) => s.setDraft);
  const removeDraft = usePhaseStore((s) => s.removeDraft);
  const fallback = useMemo(() => phaseChangeDefaults(state), [state]);
  const pc: PhaseChange = draft ?? fallback;
  const [preview, setPreview] = useState(false);
  const [waOpen, setWaOpen] = useState(false);

  if (!hasContent(state)) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-[15px] leading-relaxed">
        <p className="font-semibold">Abra primeiro a estratégia do aluno.</p>
        <p className="mt-1.5 text-muted-foreground">
          A troca de fase continua um protocolo que já existe: abra a estratégia do aluno pelo <b>Histórico</b> (no topo)
          e volte aqui. As fases, o volume e as prioridades vêm de lá.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/alunos/relatorio">Ir para o relatório</Link>
        </Button>
      </div>
    );
  }

  const set = (partial: Partial<PhaseChange>) => setDraft(key, { ...pc, ...partial });

  /** Troca tipo/foco/fase: as sugestões acompanham, sem apagar o que você já editou. */
  function retarget(o: { tipo?: PhaseChangeKind; faseNumero?: number; focoDe?: PhaseFocus; focoPara?: PhaseFocus }) {
    const atual = { tipo: pc.tipo, faseNumero: pc.faseNumero, focoDe: pc.focoDe, focoPara: pc.focoPara };
    const antes = phaseChangeDefaults(state, atual);
    const depois = phaseChangeDefaults(state, { ...atual, ...o });
    const next: PhaseChange = { ...pc, tipo: depois.tipo, faseNumero: depois.faseNumero, focoDe: depois.focoDe, focoPara: depois.focoPara };
    const out = next as unknown as Record<string, unknown>;
    for (const f of SUGERIDOS) {
      if (JSON.stringify(pc[f]) === JSON.stringify(antes[f])) out[f] = depois[f];
    }
    setDraft(key, next);
  }

  function recomecar() {
    if (!confirm("Recomeçar este documento? O que você preencheu aqui será apagado.")) return;
    removeDraft(key);
    toast.success("Documento reiniciado com as sugestões.");
  }

  async function copiar() {
    const ok = await copyToClipboard(phaseChangeWhatsapp(state, pc));
    toast[ok ? "success" : "error"](ok ? "Texto da troca de fase copiado." : "Não foi possível copiar.");
  }

  const rows = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((r, j) => (j === i ? { ...r, ...patch } : r));
  const semConquistas = !pc.conquistas.trim();

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-5">
        <Card n={1} title="Que troca é esta?">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TIPOS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => retarget({ tipo: t.id })}
                aria-pressed={pc.tipo === t.id}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  pc.tipo === t.id ? "border-gold bg-gold-soft" : "border-border hover:border-muted-foreground/40",
                )}
              >
                <span className="block text-[14.5px] font-semibold">{t.title}</span>
                <span className="mt-1 block text-[13px] leading-snug text-muted-foreground">{t.hint}</span>
              </button>
            ))}
          </div>

          {pc.tipo === "foco" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="pc_fde">Foco da fase que termina</Label>
                <NativeSelect id="pc_fde" value={pc.focoDe} onChange={(e) => retarget({ focoDe: e.target.value as PhaseFocus })}>
                  {PHASE_FOCUS.map((f) => <option key={f}>{f}</option>)}
                </NativeSelect>
              </div>
              <div>
                <Label htmlFor="pc_fpara">Foco da fase nova</Label>
                <NativeSelect id="pc_fpara" value={pc.focoPara} onChange={(e) => retarget({ focoPara: e.target.value as PhaseFocus })}>
                  {PHASE_FOCUS.map((f) => <option key={f}>{f}</option>)}
                </NativeSelect>
              </div>
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="pc_n">Fase que começa (número)</Label>
              <Input id="pc_n" type="number" min={2} value={pc.faseNumero} onChange={(e) => retarget({ faseNumero: Math.max(2, Number(e.target.value) || 2) })} />
            </div>
            <div>
              <Label htmlFor="pc_de">Nome da fase que termina</Label>
              <Input id="pc_de" value={pc.deNome} onChange={(e) => set({ deNome: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="pc_para">Nome da fase nova</Label>
              <Input id="pc_para" value={pc.paraNome} onChange={(e) => set({ paraNome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pc_ini">Começa em</Label>
                <Input id="pc_ini" type="date" value={pc.inicio} onChange={(e) => set({ inicio: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="pc_sem">Semanas</Label>
                <Input id="pc_sem" type="number" min={1} value={pc.semanas} onChange={(e) => set({ semanas: e.target.value })} />
              </div>
            </div>
          </div>
        </Card>

        <Card
          n={2}
          title="O que o aluno conquistou"
          hint="Uma conquista por linha, com números quando tiver. É o que faz o aluno sentir que avançou, e não que “começou de novo”."
        >
          <Textarea
            value={pc.conquistas}
            onChange={(e) => set({ conquistas: e.target.value })}
            placeholder={"Ex.: Fez 15 dos 16 treinos da fase\nAgachamento: de 40 kg para 55 kg\nExecução do stiff muito mais firme\nCintura: -2 cm"}
            className="min-h-[120px]"
          />
        </Card>

        <Card n={3} title="Por que mudar agora" hint="Em linguagem simples. A sugestão acompanha o tipo de troca; ajuste do seu jeito.">
          <Textarea value={pc.porque} onChange={(e) => set({ porque: e.target.value })} className="min-h-[110px]" />
        </Card>

        <Card n={4} title="O que muda: antes → agora" hint="Só o que importa para o aluno. Deixe em branco o que não mudou.">
          <div className="grid gap-2.5">
            {pc.mudancas.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-1.5 rounded-xl border border-border p-2.5 sm:grid-cols-[150px_1fr_1fr_auto] sm:border-0 sm:p-0">
                <Input aria-label="O que muda" value={r.item} placeholder="Ex.: Descanso" onChange={(e) => set({ mudancas: rows(pc.mudancas, i, { item: e.target.value }) })} />
                <div className="sm:order-last"><RemoveBtn onClick={() => set({ mudancas: pc.mudancas.filter((_, j) => j !== i) })} /></div>
                <Input aria-label="Antes" className="col-span-2 sm:col-span-1" value={r.antes} placeholder="Antes" onChange={(e) => set({ mudancas: rows(pc.mudancas, i, { antes: e.target.value }) })} />
                <Input aria-label="Agora" className="col-span-2 sm:col-span-1" value={r.agora} placeholder="Agora" onChange={(e) => set({ mudancas: rows(pc.mudancas, i, { agora: e.target.value }) })} />
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => set({ mudancas: [...pc.mudancas, { item: "", antes: "", agora: "" }] })}>
            <Plus className="size-4" /> Adicionar linha
          </Button>
        </Card>

        <Card n={5} title="Técnicas avançadas que entram" hint="Marque as que o aluno vai usar. O documento explica cada uma em uma frase.">
          <div className="flex flex-wrap gap-2">
            {Object.keys(INTENSIDADE_HINTS).map((t) => {
              const on = pc.tecnicas.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  title={INTENSIDADE_HINTS[t]}
                  onClick={() => set({ tecnicas: on ? pc.tecnicas.filter((x) => x !== t) : [...pc.tecnicas, t] })}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-muted-foreground/50",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Card>

        <Card n={6} title="Séries por semana" hint="O “antes” vem da estratégia. Preencha o “agora” só nos grupos que mudam — os outros não aparecem no documento.">
          {pc.volume.length ? (
            <div className="grid gap-2">
              <div className="grid grid-cols-[1fr_84px_84px] gap-2 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
                <span>Grupo</span><span>Antes</span><span>Agora</span>
              </div>
              {pc.volume.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_84px_84px] items-center gap-2">
                  <span className="min-w-0 break-words text-[14px]">{v.grupo}</span>
                  <Input aria-label={`${v.grupo}: antes`} value={v.antes} onChange={(e) => set({ volume: rows(pc.volume, i, { antes: e.target.value }) })} />
                  <Input aria-label={`${v.grupo}: agora`} value={v.agora} placeholder="—" onChange={(e) => set({ volume: rows(pc.volume, i, { agora: e.target.value }) })} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13.5px] text-muted-foreground">
              Esta estratégia não tem tabela de volume. Use a linha “Séries por semana” no bloco 4 para dizer o que muda.
            </p>
          )}
        </Card>

        <Card n={7} title="Exercícios que mudam" hint="Só os que trocam — um ou outro. Diga o motivo em poucas palavras.">
          <div className="grid gap-2.5">
            {pc.trocas.map((t, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-1.5 rounded-xl border border-border p-2.5 sm:grid-cols-[1fr_1fr_1fr_auto] sm:border-0 sm:p-0">
                <Input aria-label="Sai" value={t.sai} placeholder="Sai (ex.: Leg press)" onChange={(e) => set({ trocas: rows(pc.trocas, i, { sai: e.target.value }) })} />
                <div className="sm:order-last"><RemoveBtn onClick={() => set({ trocas: pc.trocas.filter((_, j) => j !== i) })} /></div>
                <Input aria-label="Entra" className="col-span-2 sm:col-span-1" value={t.entra} placeholder="Entra (ex.: Agachamento hack)" onChange={(e) => set({ trocas: rows(pc.trocas, i, { entra: e.target.value }) })} />
                <Input aria-label="Motivo" className="col-span-2 sm:col-span-1" value={t.motivo} placeholder="Por quê (ex.: mais foco no quadríceps)" onChange={(e) => set({ trocas: rows(pc.trocas, i, { motivo: e.target.value }) })} />
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className={pc.trocas.length ? "mt-3" : ""} onClick={() => set({ trocas: [...pc.trocas, { sai: "", entra: "", motivo: "" }] })}>
            <Plus className="size-4" /> Adicionar troca
          </Button>
        </Card>

        <Card n={8} title="Como viver esta fase" hint="Um item por linha. As sugestões acompanham o tipo de troca.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pc_mantem">O que continua igual</Label>
              <Textarea id="pc_mantem" value={pc.mantem} onChange={(e) => set({ mantem: e.target.value })} className="min-h-[110px]" />
            </div>
            <div>
              <Label htmlFor="pc_missao">Missão do aluno (até 3)</Label>
              <Textarea id="pc_missao" value={pc.missao} onChange={(e) => set({ missao: e.target.value })} className="min-h-[110px]" />
            </div>
            <div>
              <Label htmlFor="pc_normal">É normal sentir</Label>
              <Textarea id="pc_normal" value={pc.normal} onChange={(e) => set({ normal: e.target.value })} className="min-h-[110px]" />
            </div>
            <div>
              <Label htmlFor="pc_avisar">Me avise se sentir</Label>
              <Textarea id="pc_avisar" value={pc.avisar} onChange={(e) => set({ avisar: e.target.value })} className="min-h-[110px]" />
            </div>
            <div>
              <Label htmlFor="pc_medir">Como vamos acompanhar</Label>
              <Textarea id="pc_medir" value={pc.medir} onChange={(e) => set({ medir: e.target.value })} className="min-h-[110px]" />
            </div>
            <div>
              <Label htmlFor="pc_msg">Sua mensagem final</Label>
              <Textarea id="pc_msg" value={pc.mensagem} onChange={(e) => set({ mensagem: e.target.value })} placeholder="Ex.: Orgulho do que você construiu até aqui. Agora é hora de colher!" className="min-h-[110px]" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Documento</p>
          <p className="mt-2 text-[15px] font-semibold leading-snug">{phaseTitle(pc)}</p>
          <p className="text-[13px] text-muted-foreground">
            {String(state.anamnese.nome ?? "").trim() || "Aluno sem nome"} · depois de {pc.deNome}
          </p>
          {semConquistas && (
            <p className="mt-3 rounded-lg bg-gold-soft px-3 py-2 text-[12.5px] leading-snug">
              Falta o bloco 2 (conquistas). É a parte que mais pesa para o aluno.
            </p>
          )}
          <div className="mt-3 grid gap-2.5">
            <Button className="justify-start" onClick={copiar}>
              <MessageCircle className="size-4" /> Copiar versão WhatsApp
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => setPreview(true)}>
              <FileText className="size-4" /> PDF Premium
            </Button>
          </div>
          <Button variant="ghost" className="mt-2.5 w-full" onClick={() => setWaOpen((v) => !v)}>
            Prévia do WhatsApp
          </Button>
          {waOpen && (
            <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[12px] border border-[#1f2c33] bg-[#0b141a] p-4 font-sans text-[13.5px] leading-relaxed text-[#e9edef]">
              {phaseChangeWhatsapp(state, pc)}
            </pre>
          )}
          <Button variant="ghost" size="sm" className="mt-2 w-full text-muted-foreground" onClick={recomecar}>
            <RotateCcw className="size-4" /> Recomeçar documento
          </Button>
        </div>
        <p className="px-1 text-[12.5px] leading-snug text-muted-foreground">
          Salvo sozinho neste navegador, por aluno. O treino em si (exercícios, séries e repetições) fica no aplicativo.
        </p>
      </div>

      {preview && <PhasePreview state={state} pc={pc} onClose={() => setPreview(false)} />}
    </div>
  );
}
