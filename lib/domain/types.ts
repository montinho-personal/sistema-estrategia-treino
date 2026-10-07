import type { Anamnese, AnamneseField } from "./schema/anamnese";
import type { Answers } from "./schema/answers";

/* ---- Anamnese (definição de formulário) ---- */
export type FieldType = "text" | "number" | "textarea" | "select";

export interface AnamneseFieldDef {
  id: AnamneseField;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
}

export interface AnamneseSectionDef {
  id: string;
  title: string;
  fields: AnamneseFieldDef[];
}

/* ---- Entrevista ---- */
export type QuestionType = "text" | "textarea" | "choice" | "multi";

/** Explicação de uma opção: quando usar e quais as vantagens. */
export interface OptionDetail {
  quando: string;
  vantagens: string[];
}

export interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  optional?: boolean;
  label?: string;
  hint?: string;
  why?: boolean;
  /** choice/multi: mostra a opção "Outra" com campo de texto livre. */
  allowOther?: boolean;
  /** choice/multi: descrição curta por opção (exibe as opções em cartões). */
  hints?: Record<string, string>;
  /** choice/multi: explicação expansível por opção ("Quando usar e vantagens"). */
  details?: Record<string, OptionDetail>;
  /** choice/multi: opção preferida do treinador — ganha o selo "seu padrão". */
  featured?: string;
  /** Complemento exibido direto no card (fora do "Aprofundar"). */
  inline?: boolean;
  /** Mostra sugestões de resposta da IA abaixo do campo. */
  suggest?: boolean;
  condition?: (a: Anamnese, ans: Answers) => boolean;
}

export interface Topic {
  id: string;
  n: number;
  name: string;
  title: string;
  lead: string;
  mainQ: string;
  whyQ: string | null;
  questions: Question[];
}

export interface AdaptiveQuestion extends Question {
  topic: string;
  when: (a: Anamnese) => boolean;
}

/* ---- Auditoria ---- */
export interface ConsistencyNote {
  id: string;
  topic: string;
  text: string;
}

export type AnamneseRule = (a: Anamnese) => string | undefined;
export type ConsistencyRule = (
  a: Anamnese,
  ans: Answers,
) => ConsistencyNote | undefined;
