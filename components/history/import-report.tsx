"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, FileUp, Loader2 } from "lucide-react";

import { importSummary, importedCount, type ImportedStrategy } from "@/lib/domain";
import { aiImportReport } from "@/lib/ai/anthropic";
import { MAX_PDF_BYTES, fileToBase64 } from "@/lib/file";
import { useAiStore, useHistoryStore, type StrategySnapshot } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Data de hoje / do relatório no formato do <input type="date">. */
const toInputDate = (iso?: string | null) => {
  const d = iso ? new Date(iso) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const fromInputDate = (v: string) => {
  const [y, m, d] = v.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d, 12).toISOString() : new Date().toISOString();
};
const sameDay = (a: string, b: string) => toInputDate(a) === toInputDate(b);

interface Review {
  imp: ImportedStrategy;
  arquivo: string;
  nome: string;
  titulo: string;
  data: string;
}

/**
 * Histórico → Importar relatório antigo: a IA lê o PDF (ou o texto do WhatsApp)
 * que já foi entregue ao aluno, reconstrói a estratégia e o treinador confere
 * antes de salvar. Aceita vários PDFs de uma vez (um por vez na conferência).
 */
export function ImportReport({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  /** Salvar e abrir no editor (só no último relatório da fila). */
  onOpen: (snap: StrategySnapshot) => void;
}) {
  const aiConfig = useAiStore((s) => s.config);
  const snapshots = useHistoryStore((s) => s.snapshots);
  const addSnapshot = useHistoryStore((s) => s.addSnapshot);
  const fileRef = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [queue, setQueue] = useState<File[]>([]);
  const [pos, setPos] = useState(0);
  const [loading, setLoading] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  /** Quantos relatórios da fila foram salvos (ref: lido no fim do laço assíncrono). */
  const salvos = useRef(0);

  async function read(input: { pdfBase64: string } | { text: string }, arquivo: string): Promise<boolean> {
    setLoading(arquivo);
    try {
      const imp = await aiImportReport(aiConfig, input);
      if (importedCount(imp) === 0) {
        toast.error(`Não encontrei uma estratégia em “${arquivo}”.`, {
          description: "Funciona com os relatórios gerados por esta ferramenta (PDF Premium ou WhatsApp).",
        });
        return false;
      }
      setReview({
        imp,
        arquivo,
        nome: imp.anamnese.nome ?? "",
        titulo: imp.anamnese.tituloPlano ?? "",
        data: toInputDate(imp.data),
      });
      return true;
    } catch (err) {
      toast.error(`Não foi possível ler “${arquivo}”.`, { description: err instanceof Error ? err.message : undefined });
      return false;
    } finally {
      setLoading("");
    }
  }

  /** Lê o próximo PDF da fila; os que falham são pulados. */
  async function readFrom(files: File[], start: number) {
    for (let i = start; i < files.length; i++) {
      const f = files[i];
      setPos(i);
      if (f.type !== "application/pdf") {
        toast.error(`“${f.name}” não é um PDF.`);
        continue;
      }
      if (f.size > MAX_PDF_BYTES) {
        toast.error(`“${f.name}” é muito grande (máx. 32 MB).`);
        continue;
      }
      if (await read({ pdfBase64: await fileToBase64(f) }, f.name)) return;
    }
    finish(files.length);
  }

  function finish(total: number) {
    setReview(null);
    setQueue([]);
    if (total > 1) toast.success(`Importação concluída: ${salvos.current} de ${total} relatórios no histórico.`);
  }

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    salvos.current = 0;
    setQueue(files);
    void readFrom(files, 0);
  }

  function next() {
    setReview(null);
    if (pos + 1 < queue.length) void readFrom(queue, pos + 1);
    else finish(queue.length);
  }

  function save(open: boolean) {
    if (!review) return;
    const { imp } = review;
    const snap = addSnapshot({
      nome: review.nome,
      savedAt: fromInputDate(review.data),
      origem: "importado",
      anamnese: {
        ...imp.anamnese,
        ...(review.nome.trim() ? { nome: review.nome.trim() } : {}),
        ...(review.titulo.trim() ? { tituloPlano: review.titulo.trim() } : {}),
      },
      answers: imp.answers,
      overrides: {},
      volume: imp.volume,
    });
    salvos.current += 1;
    toast.success(`Estratégia de ${snap.nome} adicionada ao histórico.`);
    if (open) onOpen(snap);
    else if (queue.length > 1) next();
    else {
      setReview(null);
      setTexto("");
      onBack();
    }
  }

  const back = (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex w-fit items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Voltar ao histórico
    </button>
  );

  if (loading) {
    return (
      <div className="grid gap-4">
        {back}
        <div className="flex items-start gap-3 rounded-[12px] border border-border bg-bg px-4 py-5">
          <Loader2 className="mt-0.5 size-5 shrink-0 animate-spin text-gold" />
          <div>
            <p className="text-[14px] font-medium">
              Lendo {queue.length > 1 ? `${pos + 1} de ${queue.length} · ` : ""}“{loading}”…
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              A IA está reconstruindo a estratégia. Pode levar até um minuto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (review) {
    const s = importSummary(review.imp);
    const savedAt = fromInputDate(review.data);
    const nomeKey = review.nome.trim().toLowerCase();
    const repetida = snapshots.find((x) => nomeKey && x.nome.trim().toLowerCase() === nomeKey && sameDay(x.savedAt, savedAt));
    const ultimo = pos + 1 >= queue.length;
    return (
      <div className="grid gap-4">
        {back}
        <div>
          <p className="text-[15px] font-semibold">
            Confira antes de salvar{queue.length > 1 ? ` · ${pos + 1} de ${queue.length}` : ""}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
            A IA reconstruiu a estratégia a partir de “{review.arquivo}”. Pode não estar 100% — confira o principal. Depois
            de salvar, você pode abrir e ajustar qualquer resposta.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="imp_nome">Aluno</Label>
            <Input id="imp_nome" value={review.nome} placeholder="Nome do aluno" onChange={(e) => setReview({ ...review, nome: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="imp_titulo">Nome do treino</Label>
            <Input id="imp_titulo" value={review.titulo} placeholder="Opcional" onChange={(e) => setReview({ ...review, titulo: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="imp_data">Data do relatório</Label>
            <Input id="imp_data" type="date" value={review.data} onChange={(e) => setReview({ ...review, data: e.target.value })} />
          </div>
        </div>
        {!review.imp.data && (
          <p className="-mt-2 text-[12.5px] text-muted-foreground">
            Não achei a data no relatório — ajuste para o dia em que você enviou (ela define a ordem dos ciclos).
          </p>
        )}
        {repetida && (
          <p className="rounded-lg border border-gold/50 bg-gold-soft px-3.5 py-2.5 text-[13px]">
            Já existe uma estratégia de {repetida.nome} nesta data no histórico. Se for o mesmo relatório, pule este.
          </p>
        )}

        <div>
          <h4 className="mb-2 text-[13px] font-semibold">Decisões recuperadas ({s.decisoes.length})</h4>
          {s.decisoes.length ? (
            <ul className="grid gap-1.5">
              {s.decisoes.map((d) => (
                <li key={d.id} className="rounded-lg border border-border px-3 py-2 text-[13px] leading-snug">
                  <span className="text-muted-foreground">{d.label}:</span> {d.value.join(" · ")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground">Nenhuma decisão de múltipla escolha foi encontrada.</p>
          )}
        </div>

        {review.imp.volume.length > 0 && (
          <div>
            <h4 className="mb-2 text-[13px] font-semibold">Volume semanal</h4>
            <p className="text-[13px] leading-relaxed">
              {review.imp.volume.map((v) => `${v.grupo} ${v.series}`).join(" · ")}{" "}
              <span className="text-muted-foreground">
                (total {review.imp.volume.reduce((a, v) => a + (parseInt(v.series, 10) || 0), 0)} séries/sem)
              </span>
            </p>
          </div>
        )}

        {s.perfil.length > 0 && (
          <div>
            <h4 className="mb-2 text-[13px] font-semibold">Perfil do aluno</h4>
            <p className="text-[13px] leading-relaxed">
              {s.perfil.map((p) => (
                <span key={p.label} className="mr-3 inline-block">
                  <span className="text-muted-foreground">{p.label}:</span> {p.value}
                </span>
              ))}
            </p>
          </div>
        )}

        <p className="text-[13px] text-muted-foreground">
          {s.textos > 0 && <>Também recuperei {s.textos} {s.textos === 1 ? "explicação" : "explicações"} (porquês, vantagens, mensagem). </>}
          {s.faltando.length > 0 && <>Não aparece no relatório: {s.faltando.join(", ")}.</>}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => save(false)}>Salvar no histórico</Button>
          {ultimo && (
            <Button variant="outline" onClick={() => save(true)}>
              Salvar e abrir para ajustar
            </Button>
          )}
          <Button variant="ghost" onClick={queue.length > 1 ? next : onBack}>
            {queue.length > 1 ? (ultimo ? "Pular e concluir" : "Pular este") : "Descartar"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {back}
      <div>
        <p className="text-[15px] font-semibold">Importar relatório antigo</p>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          Envie o PDF de um relatório que você já mandou para um aluno. A IA reconstrói a estratégia — perfil, decisões,
          porquês e volume — e ela passa a contar no Painel, na comparação de ciclos e em “Começar a partir de uma
          estratégia parecida”. Funciona com os relatórios gerados por esta ferramenta. Pode escolher vários PDFs de uma vez.
        </p>
      </div>
      {!aiConfig.key ? (
        <p className="rounded-lg border border-gold/50 bg-gold-soft px-3.5 py-2.5 text-[13px]">
          Para importar, ligue o Assistente de IA: no topo, toque em <b>“IA desligada”</b> e informe sua chave.
        </p>
      ) : (
        <>
          <input ref={fileRef} type="file" accept="application/pdf" multiple className="hidden" onChange={pick} />
          <Button className="w-fit" onClick={() => fileRef.current?.click()}>
            <FileUp className="size-4" /> Escolher PDF(s)
          </Button>
          <div className="grid gap-2 border-t border-border pt-4">
            <Label htmlFor="imp_texto">Ou cole o texto da versão WhatsApp</Label>
            <Textarea
              id="imp_texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Cole aqui a mensagem do relatório que você enviou ao aluno"
              className="min-h-[110px]"
            />
            <Button
              variant="outline"
              className="w-fit"
              disabled={texto.trim().length < 80}
              onClick={() => {
                setQueue([]);
                setPos(0);
                void read({ text: texto.trim() }, "texto colado");
              }}
            >
              Ler texto
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
