import type { AdaptiveQuestion } from "../types";
import { has, low } from "../util";

/**
 * Perguntas adaptativas — injetadas conforme a anamnese, para que cada
 * entrevista seja diferente. Entram ao fim do tópico indicado.
 */
export const ADAPTIVE: AdaptiveQuestion[] = [
  {
    id: "adapt_dor", topic: "exercicios", label: "Cuidado com a região sensível", optional: true, type: "textarea",
    when: (a) => has(a.dores) || has(a.lesoes),
    prompt: "A anamnese aponta dor/lesão. Como a estratégia protege essa região, e há movimentos a evitar?",
  },
  {
    id: "adapt_atleta", topic: "objetivo", label: "Demandas de performance", optional: true, type: "textarea",
    when: (a) => low(a.experiencia) === "atleta" || low(a.objetivo) === "competição" || low(a.objetivo) === "performance",
    prompt: "Sendo um foco de performance/atleta, quais demandas específicas do esporte guiam este ciclo?",
  },
  {
    id: "adapt_idoso", topic: "mobilidade", label: "Segurança e estabilidade", optional: true, type: "textarea",
    when: (a) => { const i = parseInt(a.idade ?? "", 10); return !!i && i >= 60; },
    prompt: "Para este aluno mais velho, quais cuidados de segurança e estabilidade são prioritários?",
  },
  {
    id: "adapt_emagrecimento", topic: "cardio", label: "Gasto energético", optional: true, type: "textarea",
    when: (a) => low(a.objetivo) === "emagrecimento",
    prompt: "Como será a estratégia de gasto energético (déficit, NEAT, cardio) neste ciclo?",
  },
  {
    id: "adapt_hipertrofia", topic: "intensidade", label: "Volume de treino", optional: true, type: "textarea",
    when: (a) => low(a.objetivo) === "hipertrofia",
    prompt: "Qual será o volume semanal (séries por grupo) e como ele progride ao longo do ciclo?",
  },
  {
    id: "adapt_reab", topic: "exercicios", label: "Limitações da reabilitação", optional: true, type: "textarea",
    when: (a) => low(a.objetivo) === "reabilitação",
    prompt: "Quais limitações e amplitudes seguras devem ser respeitadas nesta fase de reabilitação?",
  },
];
