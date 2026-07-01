import { z } from "zod";

/**
 * Anamnese do aluno — o que o treinador preenche antes da entrevista.
 * Todos os campos são opcionais (a ficha é preenchida progressivamente).
 */
export const AnamneseSchema = z
  .object({
    nome: z.string(),
    idade: z.string(),
    sexo: z.string(),
    modalidade: z.string(),
    objetivo: z.string(),
    experiencia: z.string(),
    historico: z.string(),
    diasSemana: z.string(),
    tempoSessao: z.string(),
    rotina: z.string(),
    dores: z.string(),
    lesoes: z.string(),
    limitacoes: z.string(),
    mobilidade: z.string(),
    composicao: z.string(),
    alimentacao: z.string(),
    sono: z.string(),
    hidratacao: z.string(),
    estresse: z.string(),
    motivacao: z.string(),
    aderencia: z.string(),
    fatoresAbandono: z.string(),
    observacoes: z.string(),
  })
  .partial();

export type Anamnese = z.infer<typeof AnamneseSchema>;
export type AnamneseField = keyof Anamnese;
