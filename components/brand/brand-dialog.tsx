"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ImageUp, Trash2 } from "lucide-react";

import type { Brand } from "@/lib/domain/schema/brand";
import { useBrandStore } from "@/lib/store";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FIELDS: { id: keyof Brand; label: string; placeholder: string }[] = [
  { id: "nome", label: "Nome / marca", placeholder: "Montinho Personal Trainer" },
  { id: "whatsapp", label: "WhatsApp (com DDI/DDD)", placeholder: "Ex.: +55 11 99999-9999" },
  { id: "site", label: "Site", placeholder: "Ex.: montinho.com.br" },
  { id: "instagram", label: "Instagram", placeholder: "Ex.: @montinhopersonal" },
];

const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB (fica salvo no navegador)

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.readAsDataURL(file);
  });
}

export function BrandDialog({ trigger }: { trigger: ReactNode }) {
  const brand = useBrandStore((s) => s.brand);
  const setBrand = useBrandStore((s) => s.setBrand);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Brand>(brand);
  const logoRef = useRef<HTMLInputElement>(null);

  function onOpenChange(v: boolean) {
    if (v) setDraft(brand);
    setOpen(v);
  }
  function save() {
    setBrand({ ...draft, nome: draft.nome.trim() || "Montinho Personal Trainer" });
    setOpen(false);
    toast.success("Marca atualizada.");
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Envie um arquivo de imagem (PNG, JPG ou SVG).");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Imagem muito grande (máx. 1 MB).");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setDraft((d) => ({ ...d, logo: dataUrl }));
    } catch {
      toast.error("Não foi possível carregar a imagem.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sua marca</DialogTitle>
          <DialogDescription>
            Estes dados aparecem na capa e no encerramento do PDF premium, incluindo os QR Codes.
            Ficam salvos apenas neste navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label>Logo</Label>
            <div className="mt-1 flex items-center gap-3 rounded-[12px] border border-border bg-bg p-3">
              <div className="grid size-14 flex-none place-items-center overflow-hidden rounded-[10px] border border-border bg-surface">
                {draft.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- preview local (data URL)
                  <img src={draft.logo} alt="Prévia do logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="grid size-8 place-items-center rounded-[8px] bg-primary text-[15px] font-bold text-primary-foreground">
                    M
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={onLogo}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()}>
                    <ImageUp className="size-4" /> {draft.logo ? "Trocar logo" : "Enviar logo"}
                  </Button>
                  {draft.logo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDraft((d) => ({ ...d, logo: "" }))}
                    >
                      <Trash2 className="size-4" /> Remover
                    </Button>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
                  PNG, JPG ou SVG (máx. 1 MB). Aparece na capa e na assinatura do PDF. Sem logo, usamos o “M”.
                </p>
              </div>
            </div>
          </div>

          {FIELDS.map((f) => (
            <div key={f.id}>
              <Label htmlFor={`br_${f.id}`}>{f.label}</Label>
              <Input
                id={`br_${f.id}`}
                placeholder={f.placeholder}
                value={draft[f.id]}
                onChange={(e) => setDraft((d) => ({ ...d, [f.id]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
