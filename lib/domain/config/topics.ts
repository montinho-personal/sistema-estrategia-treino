import type { Topic } from "../types";
import type { Answers } from "../schema/answers";

/** Opção de "sem prioridade" na escolha de grupos musculares. */
export const SEM_PRIORIDADE = "Sem prioridade (equilíbrio geral)";

/**
 * Estratégias para priorizar grupos musculares — consenso dos grandes
 * treinadores (Israetel/RP, Schoenfeld, Helms, Nuckols, Rambod/FST-7...).
 * A descrição é escrita para o aluno: aparece também no relatório.
 */
export const PRIORIDADE_ESTRATEGIAS: Record<string, string> = {
  "Mais volume de séries": "mais séries por semana para esses músculos",
  "Maior frequência semanal": "treinar esses músculos 2 a 3 vezes por semana",
  "Começar a sessão pelo prioritário": "treiná-los no início do treino, com mais energia e foco",
  "Treinar o prioritário descansado": "evitar que eles cheguem cansados por outros exercícios",
  "Prioritário no início da semana": "colocá-los nos primeiros treinos da semana, quando você está mais descansado",
  "Manutenção nos demais grupos": "manter os outros músculos no volume mínimo para sobrar energia para o foco",
  "Mais proximidade da falha": "levar as séries desses músculos mais perto do limite",
  "Mais exercícios e ângulos": "variar os exercícios para trabalhar todas as regiões do músculo",
  "Progressão de carga mais agressiva": "buscar aumento de carga e repetições com mais frequência",
  "Técnicas avançadas no prioritário": "usar drop-set, rest-pause ou FST-7 nesses músculos",
  "Pré-exaustão (isolador antes do composto)": "ex.: cadeira extensora antes do agachamento, para o músculo já chegar ativado",
  "Conexão mente-músculo": "execução controlada, com foco total na contração do músculo",
};

/** Grupos marcados como prioridade (ignora a opção "sem prioridade"). */
export function prioridadeGrupos(ans: Answers): string[] {
  const v = ans.objetivo_prioridade;
  const arr = Array.isArray(v) ? v : typeof v === "string" && v.trim() ? [v] : [];
  return arr.filter((x) => x && x !== SEM_PRIORIDADE);
}

/**
 * Tópicos da entrevista — ordem fixa, cada um com várias perguntas.
 * mainQ = pergunta essencial (abre a seção); whyQ = o motivo (opcional).
 * label = rótulo curto; optional = não bloqueia o checklist.
 * Sempre que possível, as respostas são opções clicáveis + "Outra".
 */
export const TOPICS: Topic[] = [
  {
    id: "objetivo", n: 1, name: "Objetivo", title: "Seu objetivo",
    lead: "O foco principal do seu plano é", mainQ: "objetivo_principal", whyQ: "objetivo_porque",
    questions: [
      {
        id: "objetivo_principal", prompt: "Qual será o objetivo principal deste ciclo?", type: "choice", allowOther: true,
        placeholder: "Ex.: Hipertrofia de membros superiores nas próximas 12 semanas",
        options: ["Hipertrofia", "Emagrecimento", "Recomposição corporal", "Força e performance", "Condicionamento físico", "Saúde e qualidade de vida", "Reabilitação", "Preparação para competição"],
      },
      {
        id: "objetivo_secundario", prompt: "Existe algum objetivo secundário?", type: "multi", allowOther: true, optional: true, label: "Objetivo secundário",
        placeholder: "Ex.: Melhorar a postura",
        options: ["Melhorar a postura", "Reduzir gordura", "Ganhar força", "Mais condicionamento", "Mobilidade e flexibilidade", "Saúde e longevidade", "Autoestima e bem-estar"],
      },
      {
        id: "objetivo_prazo", prompt: "Qual o prazo previsto para este ciclo?", type: "choice", allowOther: true, optional: true, label: "Prazo",
        placeholder: "Ex.: 10 semanas",
        options: ["4 semanas", "8 semanas", "12 semanas", "16 semanas", "6 meses"],
      },
      { id: "objetivo_porque", prompt: "Por que você escolheu esse objetivo para este aluno?", type: "textarea", why: true, optional: true },
    ],
  },
  {
    id: "prioridade", n: 2, name: "Prioridade muscular", title: "Seus grupos prioritários",
    lead: "", mainQ: "objetivo_prioridade", whyQ: null,
    questions: [
      {
        id: "objetivo_prioridade", prompt: "Quais grupos musculares são prioridade?", type: "multi", allowOther: true, label: "Prioridade muscular",
        placeholder: "Ex.: Deltoide lateral",
        options: ["Costas", "Peito", "Ombros", "Braços", "Quadríceps", "Posterior de coxa", "Glúteos", "Panturrilha", "Abdômen / Core", SEM_PRIORIDADE],
      },
      {
        id: "prioridade_estrategias", prompt: "Como vamos priorizar esses grupos?", type: "multi", allowOther: true, optional: true, inline: true,
        label: "Estratégias de priorização",
        hint: "As táticas mais usadas pelos grandes treinadores (Israetel/RP, Schoenfeld, Helms, Rambod…). Marque quantas quiser.",
        placeholder: "Ex.: Mesociclo de especialização de 3 semanas",
        options: Object.keys(PRIORIDADE_ESTRATEGIAS),
        hints: PRIORIDADE_ESTRATEGIAS,
        condition: (_a, ans) => prioridadeGrupos(ans).length > 0,
      },
    ],
  },
  {
    id: "divisao", n: 3, name: "Divisão do treinamento", title: "Como seus treinos estão divididos",
    lead: "Seus treinos foram organizados assim:", mainQ: "divisao_qual", whyQ: "divisao_porque",
    questions: [
      {
        id: "divisao_qual", prompt: "Qual divisão será utilizada?", type: "choice", allowOther: true,
        placeholder: "Ex.: Upper/Lower 4x — A: superiores, B: inferiores...",
        options: ["Full Body", "Upper / Lower", "Push / Pull / Legs", "Lower / Upper / Lower / Full Body", "Upper / Lower + Push / Pull / Legs", "ABC", "ABCD", "ABCDE"],
        hints: {
          "Full Body": "Corpo todo em cada treino · ideal para 2–3x/semana",
          "Upper / Lower": "Superiores e inferiores alternados · cada grupo 2x/semana",
          "Push / Pull / Legs": "Empurrar, puxar e pernas · 3x ou 6x/semana",
          "Lower / Upper / Lower / Full Body": "Mais frequência para os inferiores · 4x/semana",
          "Upper / Lower + Push / Pull / Legs": "Híbrido de 5 dias · volume alto com frequência 2x",
          ABC: "3 treinos diferentes · cada grupo 1–2x/semana",
          ABCD: "4 treinos diferentes · cada grupo 1–2x/semana",
          ABCDE: "5 treinos, um grupo por dia · cada grupo 1x/semana",
        },
      },
      { id: "divisao_porque", prompt: "Por que escolheu essa divisão?", type: "textarea", why: true, optional: true },
      { id: "divisao_vantagens", prompt: "Quais vantagens ela oferece para este aluno?", type: "textarea", optional: true, label: "Vantagens para você" },
      { id: "divisao_adaptacoes", prompt: "Existe alguma adaptação por rotina, lesão, equipamentos ou modalidade?", type: "textarea", optional: true, label: "Adaptações" },
    ],
  },
  {
    id: "intensidade", n: 4, name: "Estratégia de intensidade", title: "A intensidade dos treinos",
    lead: "A forma como vamos trabalhar o esforço nos treinos é", mainQ: "intensidade_estrategia", whyQ: "intensidade_porque",
    questions: [
      {
        id: "intensidade_estrategia", prompt: "Qual estratégia de intensidade será utilizada?", type: "choice", allowOther: true,
        placeholder: "Escreva a estratégia",
        options: ["Pirâmide crescente", "Pirâmide decrescente", "Carga fixa", "Dupla progressão", "Top Set", "Back Off", "Cluster"],
      },
      { id: "intensidade_porque", prompt: "Por que escolheu essa estratégia?", type: "textarea", why: true, optional: true },
      {
        id: "intensidade_reps", prompt: "Como será a faixa de repetições?", type: "choice", allowOther: true, optional: true, label: "Faixa de repetições",
        placeholder: "Ex.: 8–12 nos compostos, 12–15 nos isoladores",
        options: ["6–8 (força)", "8–12 (hipertrofia)", "12–15 (resistência)", "8–12 nos compostos · 12–15 nos isoladores", "Varia conforme a fase"],
      },
      {
        id: "intensidade_tecnicas", prompt: "Quais recursos de intensidade serão usados?", type: "multi", allowOther: true, optional: true, label: "Recursos de intensidade",
        placeholder: "Ex.: FST-7",
        options: ["Falha", "RIR", "RPE", "Cadência", "Tempo sob tensão", "Isometria", "Drop-set", "Rest-pause", "Cluster"],
      },
    ],
  },
  {
    id: "periodizacao", n: 5, name: "Periodização", title: "A evolução ao longo do tempo",
    lead: "Ao longo das próximas semanas, o plano vai evoluir assim:", mainQ: "periodizacao_fases", whyQ: "periodizacao_porque",
    questions: [
      {
        id: "periodizacao_fases", prompt: "Como o planejamento vai evoluir ao longo das semanas?", type: "choice", allowOther: true,
        placeholder: "Ex.: Fase 1 (4 sem) adaptação; Fase 2 (4 sem) acúmulo; Fase 3 (3 sem) intensificação; deload",
        options: [
          "Adaptação (4 sem); Acúmulo de volume (4 sem); Intensificação (3 sem); Deload (1 sem)",
          "Base técnica (3 sem); Hipertrofia (5 sem); Força (3 sem); Deload (1 sem)",
          "Volume (4 sem); Deload (1 sem); Volume maior (4 sem); Deload (1 sem)",
          "Ondulatória: alterna semanas de volume e de intensidade; deload a cada 4ª semana",
          "Linear: a carga sobe aos poucos toda semana; deload a cada 4–6 semanas",
        ],
        hints: {
          "Adaptação (4 sem); Acúmulo de volume (4 sem); Intensificação (3 sem); Deload (1 sem)": "Clássica em blocos · 12 semanas",
          "Base técnica (3 sem); Hipertrofia (5 sem); Força (3 sem); Deload (1 sem)": "Hipertrofia com fase final de força",
          "Volume (4 sem); Deload (1 sem); Volume maior (4 sem); Deload (1 sem)": "Ondas de acúmulo com recuperação",
          "Ondulatória: alterna semanas de volume e de intensidade; deload a cada 4ª semana": "Variação constante de estímulo",
          "Linear: a carga sobe aos poucos toda semana; deload a cada 4–6 semanas": "Simples e eficaz · ótima para iniciantes",
        },
      },
      { id: "periodizacao_porque", prompt: "Por que decidiu fazer essa periodização?", type: "textarea", why: true, optional: true },
    ],
  },
  {
    id: "mobilidade", n: 6, name: "Mobilidade", title: "Aquecimento e mobilidade",
    lead: "Antes de cada treino, a preparação do seu corpo será", mainQ: "mobilidade_o_que", whyQ: "mobilidade_porque",
    questions: [
      {
        id: "mobilidade_o_que", prompt: "O que fará parte da preparação para os treinos?", type: "multi", allowOther: true,
        placeholder: "Ex.: Mobilidade de tornozelo",
        options: ["Aquecimento", "Mobilidade", "Alongamentos", "Ativação", "Core", "Estabilidade", "Liberação miofascial"],
      },
      { id: "mobilidade_porque", prompt: "Por que essas estratégias são importantes para este aluno?", type: "textarea", why: true, optional: true },
    ],
  },
  {
    id: "exercicios", n: 7, name: "Estratégia dos exercícios", title: "A escolha dos exercícios",
    lead: "A seleção dos seus exercícios seguiu esta lógica:", mainQ: "exercicios_logica", whyQ: "exercicios_porque",
    questions: [
      {
        id: "exercicios_logica", prompt: "Qual é a lógica de seleção dos exercícios?", type: "multi", allowOther: true,
        placeholder: "Ex.: Priorizar exercícios em máquinas guiadas",
        options: [
          "Compostos livres como base", "Máquinas e cabos para isolar", "Unilaterais para corrigir assimetrias",
          "Exercícios-chave fixos para medir a evolução", "Variação de ângulos no prioritário",
          "Pré-exaustão (isolador antes do composto)", "Adaptado aos equipamentos disponíveis",
          "Técnica e amplitude acima da carga", "Baixo impacto articular",
        ],
      },
      { id: "exercicios_obrigatorio", prompt: "Existe algum exercício obrigatório?", type: "text", optional: true, label: "Exercícios-chave" },
      { id: "exercicios_proibido", prompt: "Existe algum exercício proibido (por dor, equipamento, etc.)?", type: "text", optional: true, label: "A evitar" },
      { id: "exercicios_porque", prompt: "Por que essas escolhas e adaptações foram necessárias?", type: "textarea", why: true, optional: true },
    ],
  },
  {
    id: "cardio", n: 8, name: "Cardio", title: "O cardio no seu plano",
    lead: "O trabalho aeróbico (cardio) entra assim no seu plano:", mainQ: "cardio_have", whyQ: "cardio_porque",
    questions: [
      { id: "cardio_have", prompt: "Haverá cardio neste ciclo?", type: "choice", options: ["Sim", "Não"] },
      {
        id: "cardio_detalhe", prompt: "Como será o cardio?", type: "multi", allowOther: true, inline: true, label: "Como será",
        placeholder: "Ex.: Bike 25 min após o treino de pernas",
        options: ["2x/semana", "3x/semana", "4x ou mais/semana", "20–30 min", "30–45 min", "Zona 2 (leve, dá para conversar)", "Intervalado (HIIT)", "Após a musculação", "Em dias separados", "Caminhada / passos diários"],
        condition: (_a, ans) => ans.cardio_have === "Sim",
      },
      { id: "cardio_porque", prompt: "Por que decidiu dessa forma?", type: "textarea", why: true, optional: true },
    ],
  },
  {
    id: "progressao", n: 9, name: "Progressão", title: "Como você vai progredir",
    lead: "Para você continuar evoluindo, a progressão será", mainQ: "progressao_como", whyQ: "progressao_porque",
    questions: [
      {
        id: "progressao_como", prompt: "Como será feita a progressão?", type: "multi", allowOther: true,
        placeholder: "Ex.: Subir 2 kg nos compostos a cada 2 semanas",
        options: [
          "Dupla progressão (repetições → carga)", "Subir a carga ao atingir o topo das repetições",
          "Acrescentar séries a cada bloco", "Trocar exercícios a cada 4–6 semanas",
          "Inserir técnicas avançadas na fase final", "Reavaliar a cada 4 semanas",
          "Deload quando houver fadiga acumulada", "Ajustar pelo RIR/RPE da semana",
        ],
      },
      { id: "progressao_porque", prompt: "Por que escolheu essa estratégia de progressão?", type: "textarea", why: true, optional: true },
    ],
  },
  {
    id: "acompanhamento", n: 10, name: "Acompanhamento", title: "O que vamos acompanhar juntos",
    lead: "Para acompanhar sua evolução de perto, vamos registrar", mainQ: "acompanhamento_info", whyQ: "acompanhamento_porque",
    questions: [
      {
        id: "acompanhamento_info", prompt: "Quais informações você quer receber semanalmente?", type: "multi", allowOther: true,
        placeholder: "Ex.: Passos diários",
        options: ["Peso", "Fotos", "Sono", "Dor", "Fadiga", "Execução", "Cargas", "Recuperação", "Medidas"],
      },
      { id: "acompanhamento_porque", prompt: "Por que essas informações são importantes?", type: "textarea", why: true, optional: true },
    ],
  },
  {
    id: "filosofia", n: 11, name: "Filosofia da estratégia", title: "A filosofia do seu treino",
    lead: "A ideia que guia todo o seu treino é", mainQ: "filosofia_frase", whyQ: null,
    questions: [
      {
        id: "filosofia_frase", prompt: "Se você tivesse que resumir toda essa estratégia em uma frase, qual seria?", type: "choice", allowOther: true,
        placeholder: "Ex.: Constância inteligente — treinar forte respeitando o corpo.",
        hint: "Esta frase abrirá o relatório do aluno.",
        options: [
          "Constância inteligente: treinar forte, respeitando o seu corpo.",
          "Menos é mais: poucos exercícios, muito bem executados.",
          "Cada detalhe tem um motivo — nada aqui é por acaso.",
          "Progresso constante, sem atalhos.",
          "Saúde em primeiro lugar; o resultado estético é consequência.",
          "Disciplina hoje, resultado amanhã.",
        ],
      },
    ],
  },
  {
    id: "mensagem", n: 12, name: "Mensagem final", title: "Uma mensagem para você",
    lead: "", mainQ: "mensagem_final", whyQ: null,
    questions: [
      {
        id: "mensagem_final", prompt: "Qual mensagem final você quer deixar para este aluno?", type: "textarea", suggest: true,
        placeholder: "Ex.: Confie no processo. Estarei com você em cada passo.",
      },
    ],
  },
];
