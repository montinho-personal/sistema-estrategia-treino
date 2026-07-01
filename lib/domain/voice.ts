import type { StrategyState } from "./schema";
import type { Answers } from "./schema/answers";

/** DNA do Montinho — como o sistema escreve, para soar como o Renato. */

export const QUALITY_QUESTION =
  "Esse texto parece realmente escrito pelo Montinho Personal?";

/** Aberturas em primeira pessoa por tópico — deixam o texto humano. */
const LEADS: Record<string, string> = {
  objetivo: "Neste ciclo, nosso foco será",
  filosofia: "A ideia que vai guiar todo o seu treino é simples:",
  divisao: "Escolhi organizar os seus treinos assim:",
  intensidade: "Para o esforço dos treinos, optei por",
  periodizacao: "Ao longo das próximas semanas, vamos evoluir assim:",
  mobilidade: "Antes de cada treino, preparei esta rotina para o seu corpo:",
  exercicios: "Para a escolha dos seus exercícios, segui esta lógica:",
  cardio: "Sobre o trabalho aeróbico, neste momento faz mais sentido",
  progressao: "Para você seguir evoluindo com segurança, pensei a progressão assim:",
  acompanhamento: "Para acompanhar você de perto, nosso combinado será registrar",
  mensagem: "",
};

export function personalLead(topicId: string): string | null {
  return Object.prototype.hasOwnProperty.call(LEADS, topicId) ? LEADS[topicId] : null;
}

/** Glossário: técnico → simples. Traduz o conhecimento para o aluno. */
export const JARGON: [string, string][] = [
  ["densidade de treino", "menos tempo de intervalo para aumentar o estímulo"],
  ["estresse metabólico", "mais estímulo dentro do músculo sem depender só de aumentar a carga"],
  ["hipertrofia miofibrilar", "ganho de massa muscular"],
  ["hipertrofia", "ganho de massa muscular"],
  ["sobrecarga progressiva", "aumentar o desafio do treino aos poucos"],
  ["tempo sob tensão", "tempo que o músculo fica trabalhando"],
  ["recrutamento de unidades motoras", "ativação das fibras musculares"],
  ["unidades motoras", "fibras musculares"],
  ["amplitude de movimento", "o quanto você move a articulação"],
  ["cadência", "ritmo do movimento"],
  ["propriocepção", "percepção do corpo no espaço"],
  ["déficit calórico", "gastar mais energia do que se consome"],
  ["periodização", "organização do treino em fases"],
  ["sinergistas", "músculos que ajudam no movimento"],
  ["isometria", "segurar a posição parado, sob tensão"],
];

const GENERIC = [
  "você consegue", "vamos pra cima", "vamos para cima",
  "bora pra cima", "foco total", "partiu treino",
];

function escRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wordRe(term: string): RegExp {
  try {
    return new RegExp(`(?<![\\p{L}])${escRe(term)}(?![\\p{L}])`, "giu");
  } catch {
    return new RegExp(escRe(term), "gi");
  }
}

/** Reescreve termos técnicos em linguagem simples. */
export function simplify(text: string): string {
  let out = String(text ?? "");
  for (const [term, plain] of JARGON) {
    out = out.replace(wordRe(term), (m) =>
      /^[A-ZÀ-Þ]/.test(m) ? plain.charAt(0).toUpperCase() + plain.slice(1) : plain,
    );
  }
  return out;
}

export interface VoiceIssue {
  level: "warn";
  text: string;
}

/** Auditoria de voz: aponta o que destoa do jeito do Montinho. */
export function checkVoice(text: string): VoiceIssue[] {
  const t = String(text ?? "");
  const issues: VoiceIssue[] = [];

  const longs = t.split(/\n{2,}/).filter((p) => p.trim().length > 360);
  if (longs.length)
    issues.push({ level: "warn", text: `${longs.length} parágrafo(s) longo(s) — quebre em partes menores para leitura no celular.` });

  const found = JARGON.filter(([term]) => wordRe(term).test(t)).map(([term]) => term);
  if (found.length)
    issues.push({ level: "warn", text: `Termos técnicos encontrados: ${found.slice(0, 4).join(", ")}. Prefira linguagem simples.` });

  const gen = GENERIC.filter((g) => wordRe(g).test(t));
  if (gen.length)
    issues.push({ level: "warn", text: `Frase genérica: “${gen[0]}”. Personalize para este aluno.` });

  if (!/(escolhi|optei|nosso foco|neste (primeiro )?ciclo|preparei|pensei|decidi)/i.test(t))
    issues.push({ level: "warn", text: "Falta tom pessoal — use expressões como “Escolhi…”, “Nosso foco será…”." });

  return issues;
}

/* -------------------- DNA (memória de aprendizado) -------------------- */
export interface Preference {
  id: string;
  title: string;
  count: number;
  contexts?: string[];
  lastAt?: string;
}

export interface DnaInputs {
  prefs: Preference[];
  historyAnswers: Answers[];
  styleSamples: number;
}

export interface DnaResult {
  insights: string[];
  prefs: Preference[];
  cycles: number;
  styleSamples: number;
}

/** Insights do DNA do Montinho, calculados a partir do estado + persistência. */
export function dna(state: StrategyState, inputs: DnaInputs): DnaResult {
  const { prefs, historyAnswers, styleSamples } = inputs;
  const out: string[] = [];

  for (const p of prefs.slice(0, 4)) {
    out.push(`Costuma usar ${String(p.title).toLowerCase()} (${p.count}x).`);
  }

  const samples: Answers[] = [state.answers, ...historyAnswers];
  let mob = 0, fb = 0, adapt = 0, whyF = 0, whyT = 0;
  for (const a of samples) {
    const m = a.mobilidade_o_que;
    const f = a.acompanhamento_info;
    if (Array.isArray(m) && m.length >= 3) mob++;
    if (Array.isArray(f) && f.length >= 4) fb++;
    if (/adapta/i.test(String(a.periodizacao_fases ?? ""))) adapt++;
    for (const k of ["objetivo_porque", "divisao_porque", "intensidade_porque"] as const) {
      whyT++;
      if (a[k] && String(a[k]).trim()) whyF++;
    }
  }
  if (mob) out.push("Valoriza mobilidade e preparação antes dos treinos.");
  if (fb) out.push("Prioriza acompanhamento próximo e aderência do aluno.");
  if (adapt) out.push("Gosta de iniciar ciclos com uma fase de adaptação.");
  if (whyT && whyF / whyT >= 0.6) out.push("Explica o motivo de cada decisão para o aluno.");
  out.push("Prefere documentos organizados e em linguagem simples.");

  return { insights: out.slice(0, 7), prefs, cycles: historyAnswers.length, styleSamples };
}
