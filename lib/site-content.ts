/**
 * Conteúdo institucional da Home (Módulo 1 — identidade).
 * Mantido como dado para separar conteúdo de apresentação.
 */

export const IDENTITY = {
  name: "Montinho Training Strategy",
  brand: "Montinho Personal Trainer",
  slogan: ["Estratégias inteligentes.", "Resultados consistentes."],
  positioningNegatives: ["Gerador de treino", "IA comum", "Chatbot"],
  positioningPositive: "Assistente estratégico para Personal Trainers",
} as const;

export const PRINCIPLES = [
  {
    n: "01",
    title: "A IA auxilia, nunca decide",
    desc: "O Personal Trainer sempre toma as decisões. A ferramenta amplia o seu julgamento — jamais o substitui.",
  },
  {
    n: "02",
    title: "Fundamentado em evidências",
    desc: "Metodologias dos maiores especialistas da musculação mundial, sempre adaptadas ao indivíduo — nunca copiadas.",
  },
  {
    n: "03",
    title: "Comunicação extremamente clara",
    desc: "O aluno entende o motivo de cada decisão, sem linguagem excessivamente técnica.",
  },
  {
    n: "04",
    title: "Todo documento transmite valor",
    desc: "O objetivo não é apenas informar. É aumentar a percepção de valor da consultoria.",
  },
] as const;

export const FLOW = [
  { n: "01", title: "Recebe a anamnese", desc: "Objetivo, histórico, lesões, rotina e disponibilidade, organizados." },
  { n: "02", title: "Entrevista o treinador", desc: "Perguntas inteligentes que estruturam o raciocínio, uma por vez." },
  { n: "03", title: "Estrutura a estratégia", desc: "Suas decisões viram um plano coerente e justificado, editável." },
  { n: "04", title: "Entrega profissional", desc: "Documento premium, PDF impecável e versão para WhatsApp." },
] as const;

export type ModuleStatus = "now" | "next";

export const MODULES: {
  id: string;
  title: string;
  desc: string;
  status: ModuleStatus;
}[] = [
  { id: "01", title: "Fundação & identidade", desc: "Visão, princípios, posicionamento e a filosofia de design premium.", status: "now" },
  { id: "02", title: "O cérebro & o workspace", desc: "System prompt do consultor, anamnese, diagnóstico e relatório em tempo real.", status: "now" },
  { id: "03", title: "Entrevista inteligente", desc: "Uma pergunta por vez, adaptada à anamnese, com auditoria e checklist.", status: "now" },
  { id: "04", title: "Memória estratégica & dashboard", desc: "Memória viva, painel de progresso, sugestões e histórico.", status: "now" },
  { id: "05", title: "Biblioteca inteligente", desc: "Justificativas automáticas com base científica, adaptadas ao perfil.", status: "now" },
  { id: "06", title: "DNA do Montinho", desc: "A voz do Renato em cada relatório: linguagem simples e tom pessoal.", status: "now" },
  { id: "07", title: "Geração do relatório", desc: "Apresentação profissional em estrutura fixa, respondendo o porquê.", status: "now" },
  { id: "08", title: "PDF premium", desc: "Documento exclusivo de 5 páginas com capa, timeline e QR Codes.", status: "now" },
];
