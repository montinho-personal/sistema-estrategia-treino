"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";

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

export function BrandDialog({ trigger }: { trigger: ReactNode }) {
  const brand = useBrandStore((s) => s.brand);
  const setBrand = useBrandStore((s) => s.setBrand);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Brand>(brand);

  function onOpenChange(v: boolean) {
    if (v) setDraft(brand);
    setOpen(v);
  }
  function save() {
    setBrand({ ...draft, nome: draft.nome.trim() || "Montinho Personal Trainer" });
    setOpen(false);
    toast.success("Marca atualizada.");
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
