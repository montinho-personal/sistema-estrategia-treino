import type { Topic } from "../types";

/**
 * Tópicos da entrevista — ordem fixa, cada um com várias perguntas.
 * mainQ = pergunta principal (abre a seção); whyQ = o motivo.
 * label = rótulo curto usado no relatório; optional = não bloqueia o checklist.
 */
export const TOPICS: Topic[] = [
  {
    id: "objetivo", n: 1, name: "Objetivo", title: "Seu objetivo",
    lead: "O foco principal do seu plano é", mainQ: "objetivo_principal", whyQ: "objetivo_porque",
    questions: [
      { id: "objetivo_principal", prompt: "Qual será o objetivo principal deste ciclo?", type: "textarea", placeholder: "Ex.: Hipertrofia de membros superiores nas próximas 12 semanas" },
      { id: "objetivo_secundario", prompt: "Existe algum objetivo secundário?", type: "text", optional: true, label: "Objetivo secundário", placeholder: "Ex.: Melhorar a postura" },
      { id: "objetivo_prioridade", prompt: "Existe alguma prioridade muscular?", type: "text", optional: true, label: "Prioridade muscular", placeholder: "Ex.: Ombros e dorsais" },
      { id: "objetivo_prazo", prompt: "Qual o prazo previsto para este ciclo?", type: "text", optional: true, label: "Prazo", placeholder: "Ex.: 12 semanas" },
      { id: "objetivo_porque", prompt: "Por que você escolheu esse objetivo para este aluno?", type: "textarea", why: true },
    ],
  },
  {
    id: "filosofia", n: 2, name: "Filosofia da estratégia", title: "A filosofia do seu treino",
    lead: "A ideia que guia todo o seu treino é", mainQ: "filosofia_frase", whyQ: null,
    questions: [
      { id: "filosofia_frase", prompt: "Se você tivesse que resumir toda essa estratégia em uma frase, qual seria?", type: "textarea", placeholder: "Ex.: Constância inteligente — treinar forte respeitando o corpo.", hint: "Esta frase abrirá o relatório do aluno." },
    ],
  },
  {
    id: "divisao", n: 3, name: "Divisão do treinamento", title: "Como seus treinos estão divididos",
    lead: "Seus treinos foram organizados assim:", mainQ: "divisao_qual", whyQ: "divisao_porque",
    questions: [
      { id: "divisao_qual", prompt: "Qual divisão será utilizada e como ela fica distribuída na semana?", type: "textarea", placeholder: "Ex.: Upper/Lower, 4x — A: superiores, B: inferiores..." },
      { id: "divisao_porque", prompt: "Por que escolheu essa divisão?", type: "textarea", why: true },
      { id: "divisao_vantagens", prompt: "Quais vantagens ela oferece para este aluno?", type: "textarea", optional: true, label: "Vantagens para você" },
      { id: "divisao_adaptacoes", prompt: "Existe alguma adaptação por rotina, lesão, equipamentos ou modalidade?", type: "textarea", optional: true, label: "Adaptações" },
    ],
  },
  {
    id: "intensidade", n: 4, name: "Estratégia de intensidade", title: "A intensidade dos treinos",
    lead: "A forma como vamos trabalhar o esforço nos treinos é", mainQ: "intensidade_estrategia", whyQ: "intensidade_porque",
    questions: [
      { id: "intensidade_estrategia", prompt: "Qual estratégia de intensidade será utilizada?", type: "choice", options: ["Pirâmide crescente", "Pirâmide decrescente", "Carga fixa", "Dupla progressão", "Top Set", "Back Off", "Cluster", "Outro"] },
      { id: "intensidade_porque", prompt: "Por que escolheu essa estratégia?", type: "textarea", why: true },
      { id: "intensidade_reps", prompt: "Como será a faixa de repetições?", type: "text", optional: true, label: "Faixa de repetições", placeholder: "Ex.: 8–12 nos compostos, 12–15 nos isoladores" },
      { id: "intensidade_tecnicas", prompt: "Quais recursos de intensidade serão usados? (marque o que se aplica)", type: "multi", optional: true, label: "Recursos de intensidade", options: ["Falha", "RIR", "RPE", "Cadência", "Tempo sob tensão", "Isometria", "Drop-set", "Rest-pause", "Cluster"] },
    ],
  },
  {
    id: "periodizacao", n: 5, name: "Periodização", title: "A evolução ao longo do tempo",
    lead: "Ao longo das próximas semanas, o plano vai evoluir assim:", mainQ: "periodizacao_fases", whyQ: "periodizacao_porque",
    questions: [
      { id: "periodizacao_fases", prompt: "Como pretende dividir este planejamento? Quantas fases, e qual objetivo, duração e estratégia de cada uma?", type: "textarea", placeholder: "Ex.: Fase 1 (4 sem) adaptação; Fase 2 (4 sem) acúmulo; Fase 3 (3 sem) intensificação; deload" },
      { id: "periodizacao_porque", prompt: "Por que decidiu fazer essa periodização?", type: "textarea", why: true },
    ],
  },
  {
    id: "mobilidade", n: 6, name: "Mobilidade", title: "Aquecimento e mobilidade",
    lead: "Antes de cada treino, a preparação do seu corpo será", mainQ: "mobilidade_o_que", whyQ: "mobilidade_porque",
    questions: [
      { id: "mobilidade_o_que", prompt: "O que fará parte da preparação para os treinos?", type: "multi", options: ["Aquecimento", "Mobilidade", "Alongamentos", "Ativação", "Core", "Estabilidade"] },
      { id: "mobilidade_porque", prompt: "Por que essas estratégias são importantes para este aluno?", type: "textarea", why: true },
    ],
  },
  {
    id: "exercicios", n: 7, name: "Estratégia dos exercícios", title: "A escolha dos exercícios",
    lead: "A seleção dos seus exercícios seguiu esta lógica:", mainQ: "exercicios_logica", whyQ: "exercicios_porque",
    questions: [
      { id: "exercicios_logica", prompt: "Qual é a lógica geral de seleção dos exercícios?", type: "textarea", placeholder: "Ex.: Prioridade em compostos livres; máquinas para isolar pontos fracos" },
      { id: "exercicios_prioridade", prompt: "Existe prioridade para algum grupo muscular?", type: "text", optional: true, label: "Prioridade", placeholder: "Ex.: Dorsais" },
      { id: "exercicios_obrigatorio", prompt: "Existe algum exercício obrigatório?", type: "text", optional: true, label: "Exercícios-chave" },
      { id: "exercicios_proibido", prompt: "Existe algum exercício proibido (por dor, equipamento, etc.)?", type: "text", optional: true, label: "A evitar" },
      { id: "exercicios_porque", prompt: "Por que essas escolhas e adaptações foram necessárias?", type: "textarea", why: true },
    ],
  },
  {
    id: "cardio", n: 8, name: "Cardio", title: "O cardio no seu plano",
    lead: "O trabalho aeróbico (cardio) entra assim no seu plano:", mainQ: "cardio_have", whyQ: "cardio_porque",
    questions: [
      { id: "cardio_have", prompt: "Haverá cardio neste ciclo?", type: "choice", options: ["Sim", "Não"] },
      { id: "cardio_detalhe", prompt: "Qual o objetivo, a frequência e a intensidade do cardio?", type: "textarea", label: "Como será", placeholder: "Ex.: 3x/semana, 30 min, zona 2, para saúde cardiovascular", condition: (_a, ans) => ans.cardio_have === "Sim" },
      { id: "cardio_porque", prompt: "Por que decidiu dessa forma?", type: "textarea", why: true },
    ],
  },
  {
    id: "progressao", n: 9, name: "Progressão", title: "Como você vai progredir",
    lead: "Para você continuar evoluindo, a progressão será", mainQ: "progressao_como", whyQ: "progressao_porque",
    questions: [
      { id: "progressao_como", prompt: "Como será feita a progressão? (quando subir carga, séries, trocar exercícios, inserir técnicas e reavaliar)", type: "textarea", placeholder: "Ex.: Progressão dupla; +séries a cada bloco; reavaliar a cada 4 semanas" },
      { id: "progressao_porque", prompt: "Por que escolheu essa estratégia de progressão?", type: "textarea", why: true },
    ],
  },
  {
    id: "acompanhamento", n: 10, name: "Acompanhamento", title: "O que vamos acompanhar juntos",
    lead: "Para acompanhar sua evolução de perto, vamos registrar", mainQ: "acompanhamento_info", whyQ: "acompanhamento_porque",
    questions: [
      { id: "acompanhamento_info", prompt: "Quais informações você quer receber semanalmente?", type: "multi", options: ["Peso", "Fotos", "Sono", "Dor", "Fadiga", "Execução", "Cargas", "Recuperação", "Medidas"] },
      { id: "acompanhamento_porque", prompt: "Por que essas informações são importantes?", type: "textarea", why: true },
    ],
  },
  {
    id: "mensagem", n: 11, name: "Mensagem final", title: "Uma mensagem para você",
    lead: "", mainQ: "mensagem_final", whyQ: null,
    questions: [
      { id: "mensagem_final", prompt: "Qual mensagem final você quer deixar para este aluno?", type: "textarea", placeholder: "Ex.: Confie no processo. Estarei com você em cada passo." },
    ],
  },
];
