"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AnamneseSchema, type Anamnese } from "@/lib/domain/schema/anamnese";
import { ANAMNESE_SECTIONS } from "@/lib/domain/config";
import type { AnamneseFieldDef } from "@/lib/domain/types";
import { useStrategyStore, useAiStore } from "@/lib/store";
import { aiExtractAnamnese } from "@/lib/ai/anthropic";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";

const MAX_PDF_BYTES = 32 * 1024 * 1024; // limite da API (32 MB)

/** Lê o arquivo como base64 puro (sem o prefixo data:). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

export function AnamneseForm() {
  const patch = useStrategyStore((s) => s.patch);
  const aiConfig = useAiStore((s) => s.config);
  const [initial] = useState<Anamnese>(() => useStrategyStore.getState().anamnese);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<Anamnese>({
    resolver: zodResolver(AnamneseSchema),
    defaultValues: initial,
  });
  const { register, subscribe, reset, getValues } = form;

  // Autosave: cada alteração é persistida no store (fonte da verdade).
  useEffect(() => {
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => patch({ anamnese: values }),
    });
    return unsubscribe;
  }, [subscribe, patch]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reenviar o mesmo arquivo depois
    if (!file) return;

    if (!aiConfig.key) {
      toast.error("Ligue o Assistente de IA para importar de PDF.", {
        description: "No topo, clique em “IA desligada” e informe sua chave da Anthropic.",
      });
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("Envie um arquivo PDF.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error("PDF muito grande (máx. 32 MB).");
      return;
    }

    setImporting(true);
    const loadingId = toast.loading("Lendo o PDF e preenchendo a anamnese…");
    try {
      const base64 = await fileToBase64(file);
      const extracted = await aiExtractAnamnese(aiConfig, base64);
      const count = Object.keys(extracted).length;
      if (count === 0) {
        toast.error("Não consegui identificar campos neste PDF.", { id: loadingId });
        return;
      }
      const merged = { ...getValues(), ...extracted };
      reset(merged); // atualiza os campos exibidos
      patch({ anamnese: merged }); // e o store (fonte da verdade)
      toast.success(`Anamnese preenchida: ${count} ${count === 1 ? "campo" : "campos"}.`, {
        id: loadingId,
        description: "Revise tudo antes de continuar — você decide.",
      });
    } catch (err) {
      toast.error("Não foi possível ler o PDF.", {
        id: loadingId,
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <form className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-surface px-5 py-4">
        <div>
          <p className="text-sm font-semibold tracking-[-0.01em]">Já tem a anamnese em PDF?</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Envie o arquivo e a IA preenche a ficha para você revisar — sem digitar de novo.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
        >
          {importing ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Lendo…
            </>
          ) : (
            <>
              <FileUp className="size-4" /> Importar de PDF
            </>
          )}
        </Button>
      </div>

      {ANAMNESE_SECTIONS.map((section) => (
        <fieldset
          key={section.id}
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {section.title}
          </legend>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <Field key={field.id} field={field} register={register} />
            ))}
          </div>
        </fieldset>
      ))}
    </form>
  );
}

function Field({
  field,
  register,
}: {
  field: AnamneseFieldDef;
  register: ReturnType<typeof useForm<Anamnese>>["register"];
}) {
  const id = `f_${field.id}`;
  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea id={id} placeholder={field.placeholder} {...register(field.id)} />
      ) : field.type === "select" ? (
        <NativeSelect id={id} {...register(field.id)}>
          <option value="">—</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </NativeSelect>
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : "text"}
          placeholder={field.placeholder}
          {...register(field.id)}
        />
      )}
    </div>
  );
}
