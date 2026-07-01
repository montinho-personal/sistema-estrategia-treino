"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useAiStore, DEFAULT_AI_MODEL } from "@/lib/store";
import { cn } from "@/lib/utils";
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

export function AiDialog() {
  const config = useAiStore((s) => s.config);
  const setConfig = useAiStore((s) => s.setConfig);
  const clearConfig = useAiStore((s) => s.clearConfig);
  const on = Boolean(config.key);

  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(config.key);
  const [model, setModel] = useState(config.model);

  function onOpenChange(v: boolean) {
    if (v) {
      setKey(config.key);
      setModel(config.model);
    }
    setOpen(v);
  }
  function save() {
    if (!key.trim()) {
      toast.error("Informe a chave ou clique em Desligar IA.");
      return;
    }
    setConfig({ key: key.trim(), model: model.trim() });
    setOpen(false);
    toast.success("IA ligada.");
  }
  function turnOff() {
    clearConfig();
    setOpen(false);
    toast.success("IA desligada.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:border-muted-foreground/40"
        >
          <span className={cn("size-1.5 rounded-full", on ? "bg-emerald-500" : "bg-muted-foreground")} />
          {on ? "IA ligada" : "IA desligada"}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assistente de IA <span className="text-[15px] font-normal text-muted-foreground">(opcional)</span>
          </DialogTitle>
          <DialogDescription>
            Ligue o assistente com a sua própria chave da API da Anthropic para gerar o resumo
            executivo e reescrever seções em linguagem premium. A chave fica salva apenas neste
            navegador. Sem chave, tudo funciona normalmente — a IA só potencializa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="ai_key">Chave da API</Label>
            <Input id="ai_key" type="password" placeholder="sk-ant-..." value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ai_model">Modelo</Label>
            <Input id="ai_model" placeholder={DEFAULT_AI_MODEL} value={model} onChange={(e) => setModel(e.target.value)} />
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Deixe em branco para usar o padrão ({DEFAULT_AI_MODEL}).
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          {on && (
            <Button variant="ghost" onClick={turnOff} className="mr-auto">
              Desligar IA
            </Button>
          )}
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
