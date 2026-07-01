import type { AnamneseRule, ConsistencyRule } from "../types";
import { has, low, joinWords, toInt } from "../util";

/**
 * Regras da anamnese — geram os pontos de atenção do diagnóstico.
 * Puras: recebem a anamnese, devolvem uma mensagem (ou nada).
 */
export const ANAMNESE_RULES: AnamneseRule[] = [
  (a) => (has(a.dores) || has(a.lesoes))
    ? "Há relato de dores ou lesões. Vale detalhar bem o aquecimento, a mobilidade e a seleção de exercícios para proteger essa região."
    : undefined,
  (a) => {
    const d = toInt(a.diasSemana);
    return d && d <= 2
      ? `Disponibilidade baixa (${d} dia(s)/semana). A divisão e o volume precisam caber bem nessa frequência.`
      : undefined;
  },
  (a) => (low(a.sono) === "ruim" || low(a.estresse) === "alto")
    ? "Sono e/ou estresse aparecem como pontos frágeis. A recuperação pode limitar volume e intensidade."
    : undefined,
  (a) => {
    const i = toInt(a.idade);
    return i && i >= 50
      ? "Aluno com 50+ anos: priorizar progressão gradual, cuidado articular e boa preparação antes das cargas altas."
      : undefined;
  },
  (a) => (low(a.motivacao) === "baixa" || has(a.fatoresAbandono))
    ? "Existem sinais de risco de abandono. Estratégias de adesão (metas curtas, constância acima de intensidade) tendem a pesar bastante aqui."
    : undefined,
  (a) => low(a.experiencia) === "iniciante"
    ? "Aluno iniciante: técnica e constância vêm antes de complexidade. Técnicas avançadas podem entrar mais adiante."
    : undefined,
];

/**
 * Auditoria de inconsistência durante a entrevista.
 * Nunca altera a decisão: apenas pergunta se deseja rever ou manter.
 */
export const CONSISTENCY_RULES: ConsistencyRule[] = [
  (a, ans) =>
    has(a.dores) &&
    /(falha|for[çc]a|m[áa]xim|1rm|pesad)/i.test(
      joinWords(ans.intensidade_estrategia, ans.intensidade_porque, ans.intensidade_tecnicas),
    )
      ? { id: "c_dor_intensidade", topic: "intensidade", text: "A anamnese relata dor e a intensidade escolhida é elevada. Gostaria de rever essa estratégia ou manter sua decisão?" }
      : undefined,
  (a, ans) => {
    const d = toInt(a.diasSemana);
    return d && d <= 3 && /(abcde|5x|6x|ppl|push.?pull.?legs|a-?b-?c-?d-?e)/i.test(String(ans.divisao_qual ?? ""))
      ? { id: "c_freq_divisao", topic: "divisao", text: `A divisão parece pedir frequência alta, mas a disponibilidade é de ${d} dia(s)/semana. Gostaria de rever ou manter?` }
      : undefined;
  },
  (a, ans) =>
    low(a.objetivo) === "emagrecimento" && ans.cardio_have === "Não"
      ? { id: "c_emag_cardio", topic: "cardio", text: "O objetivo é emagrecimento e o cardio ficou de fora. Gostaria de rever ou manter sua decisão?" }
      : undefined,
  (a, ans) =>
    low(a.experiencia) === "iniciante" &&
    /(drop|rest-?pause|cluster|falha)/i.test(joinWords(ans.intensidade_tecnicas, ans.intensidade_estrategia))
      ? { id: "c_inic_tecnicas", topic: "intensidade", text: "Aluno iniciante com técnicas avançadas de intensidade. Rever agora ou manter e introduzir com cautela?" }
      : undefined,
  (a, ans) =>
    low(a.objetivo) === "hipertrofia" &&
    /(for[çc]a m[áa]xima|for[çc]a|1rm|pesad[íi]ssim|baixa[s]? repeti)/i.test(
      joinWords(ans.intensidade_estrategia, ans.intensidade_porque, ans.intensidade_reps),
    )
      ? { id: "c_obj_forca", topic: "intensidade", text: "Percebi que anteriormente definimos um foco em hipertrofia, mas agora a estratégia parece priorizar força. Gostaria de alterar o objetivo ou manter ambas as abordagens?" }
      : undefined,
];
