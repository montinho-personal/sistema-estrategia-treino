"use client";

import { AlertTriangle } from "lucide-react";

import type { ConsistencyNote } from "@/lib/domain/types";

export function ConsistencyNotes({
  notes,
  onReview,
  onKeep,
  heading = true,
}: {
  notes: ConsistencyNote[];
  onReview: (topicId: string) => void;
  onKeep: (id: string) => void;
  heading?: boolean;
}) {
  if (notes.length === 0) return null;
  return (
    <div className="mt-5">
      {heading && (
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          Análise crítica
        </h3>
      )}
      <ul className="grid gap-2.5">
        {notes.map((note) => (
          <li
            key={note.id}
            className="flex gap-3 rounded-[10px] border border-amber-300/60 bg-amber-50/60 px-4 py-3"
          >
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div className="text-[14.5px] leading-relaxed">
              <p>{note.text}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => onReview(note.topic)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Rever
                </button>
                <button
                  type="button"
                  onClick={() => onKeep(note.id)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Manter decisão
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
