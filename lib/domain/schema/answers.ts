import { z } from "zod";

/** Valor de uma resposta: texto simples ou múltipla escolha. */
export const AnswerValueSchema = z.union([z.string(), z.array(z.string())]);
export type AnswerValue = z.infer<typeof AnswerValueSchema>;

/**
 * Respostas da entrevista, indexadas por id de pergunta.
 * Mantido como record (as perguntas são dinâmicas: fixas + adaptativas).
 */
export const AnswersSchema = z.record(z.string(), AnswerValueSchema);

export type Answers = Record<string, AnswerValue | undefined>;
