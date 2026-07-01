"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AnamneseSchema, type Anamnese } from "@/lib/domain/schema/anamnese";
import { ANAMNESE_SECTIONS } from "@/lib/domain/config";
import type { AnamneseFieldDef } from "@/lib/domain/types";
import { useStrategyStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";

export function AnamneseForm() {
  const patch = useStrategyStore((s) => s.patch);
  const [initial] = useState<Anamnese>(() => useStrategyStore.getState().anamnese);

  const form = useForm<Anamnese>({
    resolver: zodResolver(AnamneseSchema),
    defaultValues: initial,
  });
  const { register, subscribe } = form;

  // Autosave: cada alteração é persistida no store (fonte da verdade).
  useEffect(() => {
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => patch({ anamnese: values }),
    });
    return unsubscribe;
  }, [subscribe, patch]);

  return (
    <form className="space-y-4">
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
