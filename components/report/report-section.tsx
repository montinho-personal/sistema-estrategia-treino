"use client";

import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ReportSection({
  title,
  body,
  hasOverride,
  onSave,
  onRevert,
}: {
  title: string;
  body: string;
  hasOverride: boolean;
  onSave: (text: string) => void;
  onRevert: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);

  function startEdit() {
    setDraft(body);
    setEditing(true);
  }
  function save() {
    onSave(draft);
    setEditing(false);
  }

  return (
    <section className="group mt-8 first:mt-0">
      <div className="flex items-center gap-2">
        <h3 className="inline-block border-b-2 border-gold-soft pb-1 text-[19px] font-semibold tracking-[-0.02em]">
          {title}
        </h3>
        <div className="flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            onClick={startEdit}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Editar
          </button>
          {hasOverride && (
            <button
              type="button"
              onClick={onRevert}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Reverter
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mt-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[140px] text-[16px] leading-relaxed"
            autoFocus
          />
          <div className="mt-2.5 flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={save}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-[16px] leading-[1.7]">{body}</p>
      )}
    </section>
  );
}
