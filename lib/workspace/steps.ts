import type { Step } from "@/lib/domain/schema";

export interface StepMeta {
  id: Step;
  label: string;
  path: `/alunos/${string}`;
}

/** Os 5 passos do fluxo, na ordem fixa do PRD. */
export const STEP_META: StepMeta[] = [
  { id: "anamnese", label: "Anamnese", path: "/alunos/anamnese" },
  { id: "diagnostico", label: "Diagnóstico", path: "/alunos/diagnostico" },
  { id: "entrevista", label: "Entrevista", path: "/alunos/entrevista" },
  { id: "revisao", label: "Revisão", path: "/alunos/revisao" },
  { id: "relatorio", label: "Relatório", path: "/alunos/relatorio" },
];

export const STEP_TOTAL = STEP_META.length;

export function stepIndex(id: Step): number {
  return STEP_META.findIndex((s) => s.id === id);
}
