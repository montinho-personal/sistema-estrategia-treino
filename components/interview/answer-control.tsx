"use client";

import { useState } from "react";
import { Check, ChevronDown, Info } from "lucide-react";

import type { OptionDetail, Question } from "@/lib/domain/types";
import type { AnswerValue } from "@/lib/domain/schema/answers";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Opção destacada e o selo exibido ao lado dela. */
export interface Suggestion {
  value: string;
  label: string;
}

/** Opções longas (frases, fases) ficam melhores em cartões do que em chips. */
const CARD_THRESHOLD = 40;

export function AnswerControl({
  question,
  value,
  onChange,
  suggested,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  /** Opção sugerida (ex.: vinda da anamnese) — ganha um destaque discreto. */
  suggested?: Suggestion;
}) {
  if (question.type === "choice" || question.type === "multi") {
    return <OptionsControl question={question} value={value} onChange={onChange} suggested={suggested} />;
  }

  const str = typeof value === "string" ? value : "";
  if (question.type === "text") {
    return <Input value={str} placeholder={question.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <Textarea value={str} placeholder={question.placeholder} onChange={(e) => onChange(e.target.value)} />
  );
}

/**
 * Escolha única (choice) ou múltipla (multi) com opção "Outra".
 * - choice: o valor é a opção escolhida OU o texto livre digitado.
 * - multi: o valor é a lista de opções marcadas + o texto livre (se houver).
 * Respostas antigas em texto continuam aparecendo, como texto livre.
 */
function OptionsControl({
  question,
  value,
  onChange,
  suggested,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  suggested?: Suggestion;
}) {
  const opts = question.options ?? [];
  /** Selo da opção: "seu padrão" (preferida do treinador) ou a sugestão recebida. */
  const markOf = (opt: string) =>
    question.featured === opt ? "seu padrão" : suggested?.value === opt ? suggested.label : undefined;
  const multi = question.type === "multi";
  const arr = Array.isArray(value) ? value : typeof value === "string" && value !== "" ? [value] : [];
  const selected = arr.filter((v) => opts.includes(v));
  const custom = arr.filter((v) => !opts.includes(v)).join(", ");
  const [otherOpen, setOtherOpen] = useState(custom !== "");
  const showOther = Boolean(question.allowOther) && (otherOpen || custom !== "");
  const asCards = Boolean(question.hints) || opts.some((o) => o.length > CARD_THRESHOLD);

  function emit(nextSelected: string[], nextCustom: string) {
    if (multi) onChange(nextCustom ? [...nextSelected, nextCustom] : nextSelected);
    else onChange(nextCustom || nextSelected[0] || "");
  }

  function toggle(opt: string) {
    if (multi) {
      emit(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt], custom);
    } else {
      setOtherOpen(false);
      emit(selected.includes(opt) ? [] : [opt], "");
    }
  }

  function toggleOther() {
    if (showOther) {
      setOtherOpen(false);
      emit(selected, "");
    } else {
      setOtherOpen(true);
      if (!multi) emit([], "");
    }
  }

  const otherInput = showOther && (
    <Input
      autoFocus={otherOpen && custom === ""}
      value={custom}
      placeholder={question.placeholder ?? "Escreva a sua"}
      onChange={(e) => emit(multi ? selected : [], e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="mt-2.5"
    />
  );

  return (
    <div className="mt-1.5">
      {multi && <p className="mb-2 text-[12.5px] text-muted-foreground">Marque quantas quiser.</p>}

      {asCards ? (
        <div className="grid gap-2">
          {opts.map((opt) => (
            <OptionCard
              key={opt}
              label={opt}
              hint={question.hints?.[opt]}
              detail={question.details?.[opt]}
              on={selected.includes(opt)}
              multi={multi}
              mark={markOf(opt)}
              onClick={() => toggle(opt)}
            />
          ))}
          {question.allowOther && (
            <OptionCard
              label={multi ? "Outra estratégia" : "Outra — escrever a minha"}
              hint="Nem sempre é uma dessas"
              on={showOther}
              multi={multi}
              onClick={toggleOther}
            >
              {otherInput}
            </OptionCard>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {opts.map((opt) => (
              <Chip key={opt} on={selected.includes(opt)} mark={markOf(opt)} onClick={() => toggle(opt)}>
                {opt}
              </Chip>
            ))}
            {question.allowOther && (
              <Chip on={showOther} onClick={toggleOther}>
                {multi ? "+ Outra" : "Outra"}
              </Chip>
            )}
          </div>
          {otherInput}
        </>
      )}
    </div>
  );
}

function Chip({
  on,
  mark,
  onClick,
  children,
}: {
  on: boolean;
  mark?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors",
        on
          ? "border-transparent bg-primary text-primary-foreground"
          : mark
            ? "border-gold/60 bg-gold-soft text-foreground"
            : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
      )}
    >
      {children}
      {mark && !on && <span className="ml-1.5 text-[11px] font-semibold text-gold">{mark}</span>}
    </button>
  );
}

function OptionCard({
  label,
  hint,
  detail,
  on,
  multi,
  mark,
  onClick,
  children,
}: {
  label: string;
  hint?: string;
  detail?: OptionDetail;
  on: boolean;
  multi: boolean;
  mark?: string;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={on}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        on ? "border-gold bg-gold-soft" : mark ? "border-gold/50" : "border-border hover:border-gold/60",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-[18px] shrink-0 place-items-center border-2 transition-colors",
          multi ? "rounded-[5px]" : "rounded-full",
          on ? "border-gold bg-gold text-white" : "border-border",
        )}
      >
        {on && <Check className="size-3" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium leading-snug">
          {mark && (
            <span className="mr-1.5 inline-block rounded-full bg-gold px-2 py-0.5 align-[2px] text-[10.5px] font-semibold uppercase tracking-[0.04em] text-white">
              {mark}
            </span>
          )}
          {label}
        </span>
        {hint && <span className="mt-0.5 block text-[12.5px] leading-snug text-muted-foreground">{hint}</span>}
        {detail && (
          <>
            <button
              type="button"
              aria-expanded={open}
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-foreground hover:border-gold/60"
            >
              <Info className="size-3.5 text-gold" />
              Quando usar e vantagens
              <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <span
                className="mt-2 block cursor-auto rounded-lg border border-border bg-surface p-3 text-[12.5px] leading-relaxed"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-gold">Quando usar</span>
                <span className="mt-0.5 block text-foreground">{detail.quando}</span>
                <span className="mt-2.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-gold">Vantagens</span>
                {detail.vantagens.map((v) => (
                  <span key={v} className="mt-1 flex gap-1.5 text-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-gold" strokeWidth={3} />
                    {v}
                  </span>
                ))}
              </span>
            )}
          </>
        )}
        {children}
      </span>
    </div>
  );
}
