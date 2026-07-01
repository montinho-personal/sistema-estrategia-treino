"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, ClipboardList, ImageUp, Loader2 } from "lucide-react";

import type { VolumeRow } from "@/lib/domain/schema";
import { parseVolumeText, mergeVolume } from "@/lib/domain";
import { useStrategyStore, useAiStore } from "@/lib/store";
import { aiExtractVolumeFromImage } from "@/lib/ai/anthropic";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const SUGESTOES = [
  "Peito", "Costas", "Ombros", "Bíceps", "Tríceps",
  "Quadríceps", "Posterior", "Glúteos", "Panturrilha", "Abdômen",
];

const MAX_IMG_BYTES = 5 * 1024 * 1024; // 5 MB

function totalOf(rows: VolumeRow[]): number | null {
  let sum = 0;
  let any = false;
  for (const r of rows) {
    const n = parseInt(r.series, 10);
    if (!Number.isNaN(n)) {
      sum += n;
      any = true;
    }
  }
  return any ? sum : null;
}

function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = String(reader.result);
      const c = r.indexOf(",");
      resolve(c >= 0 ? r.slice(c + 1) : r);
    };
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}

export function VolumeEditor() {
  const volume = useStrategyStore((s) => s.volume);
  const setVolume = useStrategyStore((s) => s.setVolume);
  const aiConfig = useAiStore((s) => s.config);
  const total = totalOf(volume);

  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [reading, setReading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const update = (i: number, patch: Partial<VolumeRow>) =>
    setVolume(volume.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const add = (grupo = "") => setVolume([...volume, { grupo, series: "" }]);
  const remove = (i: number) => setVolume(volume.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= volume.length) return;
    const next = volume.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setVolume(next);
  };

  const pctOf = (series: string): string => {
    const n = parseInt(series, 10);
    if (total == null || Number.isNaN(n) || total === 0) return "";
    return `${Math.round((n / total) * 100)}%`;
  };

  function applyImport(rows: VolumeRow[], origem: string) {
    if (rows.length === 0) {
      toast.error(`Não reconheci uma tabela ${origem}.`, {
        description: "Confira o formato (grupo e nº de séries) e tente de novo.",
      });
      return;
    }
    setVolume(mergeVolume(volume, rows));
    toast.success(`${rows.length} ${rows.length === 1 ? "grupo importado" : "grupos importados"}.`, {
      description: "Revise os valores antes de continuar.",
    });
  }

  function importFromText() {
    applyImport(parseVolumeText(pasteText), "no texto");
    setPasteText("");
    setShowPaste(false);
  }

  async function importFromImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!aiConfig.key) {
      toast.error("Ligue o Assistente de IA para ler o print.", {
        description: "No topo, clique em “IA desligada” e informe sua chave da Anthropic.",
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Envie uma imagem (print) da tabela.");
      return;
    }
    if (file.size > MAX_IMG_BYTES) {
      toast.error("Imagem muito grande (máx. 5 MB).");
      return;
    }
    setReading(true);
    const id = toast.loading("Lendo o print e montando a tabela…");
    try {
      const base64 = await imageToBase64(file);
      const rows = await aiExtractVolumeFromImage(aiConfig, base64, file.type);
      toast.dismiss(id);
      applyImport(rows, "na imagem");
    } catch (err) {
      toast.error("Não foi possível ler o print.", {
        id,
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setReading(false);
    }
  }

  const restantes = SUGESTOES.filter(
    (g) => !volume.some((r) => r.grupo.trim().toLowerCase() === g.toLowerCase()),
  );
  const ctrlCls =
    "grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Volume semanal de séries
      </h3>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        Informe os grupos e o nº de séries por semana — digitando, colando a tabela ou enviando um
        print. Aparece no relatório (PDF e WhatsApp).
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowPaste((v) => !v)}>
          <ClipboardList className="size-4" /> Colar tabela
        </Button>
        <input
          ref={imgRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={importFromImage}
        />
        <Button variant="outline" size="sm" onClick={() => imgRef.current?.click()} disabled={reading}>
          {reading ? <Loader2 className="size-4 animate-spin" /> : <ImageUp className="size-4" />}
          {reading ? "Lendo…" : "Enviar print (IA)"}
        </Button>
      </div>

      {showPaste && (
        <div className="mt-3 rounded-[12px] border border-border bg-bg p-3">
          <Textarea
            rows={5}
            placeholder={"Cole a tabela aqui. Ex.:\nAbdominal | 24 | 21,4%\nQuadríceps | 20 | 17,9%"}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowPaste(false); setPasteText(""); }}>
              Cancelar
            </Button>
            <Button size="sm" onClick={importFromText} disabled={!pasteText.trim()}>
              Preencher a partir do texto
            </Button>
          </div>
        </div>
      )}

      {volume.length > 0 && (
        <div className="mt-3 space-y-2">
          {volume.map((r, i) => {
            const pct = pctOf(r.series);
            return (
              <div key={i} className="flex items-center gap-1.5">
                <Input
                  className="flex-1"
                  placeholder="Grupo (ex.: Peito)"
                  value={r.grupo}
                  onChange={(e) => update(i, { grupo: e.target.value })}
                />
                <Input
                  className="w-16"
                  inputMode="numeric"
                  placeholder="Séries"
                  value={r.series}
                  onChange={(e) => update(i, { series: e.target.value })}
                />
                <span className="w-9 shrink-0 text-right text-[12.5px] tabular-nums text-muted-foreground">
                  {pct}
                </span>
                <button
                  type="button"
                  className={ctrlCls}
                  aria-label="Mover para cima"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  className={ctrlCls}
                  aria-label="Mover para baixo"
                  disabled={i === volume.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  className={`${ctrlCls} hover:border-red-300 hover:text-red-500`}
                  aria-label="Remover"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => add()}>
          <Plus className="size-4" /> Adicionar grupo
        </Button>
        {total != null && (
          <span className="ml-auto text-[13px] text-muted-foreground">
            Total: <b className="text-foreground">{total}</b> séries/sem
          </span>
        )}
      </div>

      {restantes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {restantes.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => add(g)}
              className="rounded-full border border-border px-2.5 py-1 text-[12.5px] text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:text-foreground"
            >
              + {g}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
