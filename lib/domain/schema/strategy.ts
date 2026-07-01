import { z } from "zod";

import { AnamneseSchema } from "./anamnese";
import { AnswerValueSchema } from "./answers";
import type { Answers } from "./answers";

export const WORKSPACE_STEPS = [
  "anamnese",
  "diagnostico",
  "entrevista",
  "revisao",
  "relatorio",
] as const;
export const StepSchema = z.enum(WORKSPACE_STEPS);
export type Step = z.infer<typeof StepSchema>;

/** Uma linha da tabela de volume semanal: grupo muscular e nº de séries. */
export const VolumeRowSchema = z.object({
  grupo: z.string().default(""),
  series: z.string().default(""),
});
export type VolumeRow = z.infer<typeof VolumeRowSchema>;

/** Estado completo de uma estratégia (a "memória viva" da sessão). */
export const StrategyStateSchema = z.object({
  anamnese: AnamneseSchema.default({}),
  answers: z.record(z.string(), AnswerValueSchema).default({}),
  acknowledged: z.record(z.string(), z.boolean()).default({}),
  overrides: z.record(z.string(), z.string()).default({}),
  volume: z.array(VolumeRowSchema).default([]),
  diagnosisNote: z.string().default(""),
  step: StepSchema.default("anamnese"),
  currentQ: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
});

export type StrategyState = Omit<
  z.infer<typeof StrategyStateSchema>,
  "answers"
> & { answers: Answers };

export function createStrategyState(): StrategyState {
  return {
    anamnese: {},
    answers: {},
    acknowledged: {},
    overrides: {},
    volume: [],
    diagnosisNote: "",
    step: "anamnese",
    currentQ: null,
    updatedAt: null,
  };
}
