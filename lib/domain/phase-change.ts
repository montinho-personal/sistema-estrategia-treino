import { prioridadeGrupos } from "./config";
import { INTENSIDADE_HINTS } from "./config/option-details";
import { fasesDe } from "./export-app";
import { faixaDe, volumeRows } from "./report";
import type { StrategyState } from "./schema";
import { firstName, has, val } from "./util";

/**
 * Troca de fase: o documento que o aluno recebe quando o protocolo muda de
 * fase. Dois tipos de troca:
 * - "progressao": mesmo foco, mais desafio (técnicas avançadas, mais séries,
 *   troca de um ou outro exercício);
 * - "foco": o mês muda de objetivo (força → hipertrofia → resistência).
 * Tudo aqui é sugestão editável — o treinador ajusta antes de enviar.
 */
export type PhaseChangeKind = "progressao" | "foco";

export const PHASE_FOCUS = ["Força", "Hipertrofia", "Resistência"] as const;
export type PhaseFocus = (typeof PHASE_FOCUS)[number];

export interface ChangeRow { item: string; antes: string; agora: string }
export interface VolumeChangeRow { grupo: string; antes: string; agora: string }
export interface SwapRow { sai: string; entra: string; motivo: string }

export interface PhaseChange {
  tipo: PhaseChangeKind;
  /** Número da fase que começa (2 = segunda fase). */
  faseNumero: number;
  deNome: string;
  paraNome: string;
  focoDe: PhaseFocus;
  focoPara: PhaseFocus;
  /** Início da fase nova (AAAA-MM-DD) e duração em semanas. */
  inicio: string;
  semanas: string;
  /** Uma conquista por linha. */
  conquistas: string;
  porque: string;
  mudancas: ChangeRow[];
  tecnicas: string[];
  volume: VolumeChangeRow[];
  trocas: SwapRow[];
  mantem: string;
  normal: string;
  avisar: string;
  missao: string;
  medir: string;
  mensagem: string;
}

interface FocusPreset {
  reps: string;
  carga: string;
  descanso: string;
  esforco: string;
  /** "No último mês…" — o que a fase deixou de legado. */
  legado: string;
  /** "Agora o foco é…" */
  objetivo: string;
  sente: string[];
  missao: string[];
}

export const FOCUS_PRESETS: Record<PhaseFocus, FocusPreset> = {
  Força: {
    reps: "3 a 6",
    carga: "Pesada",
    descanso: "2 a 3 minutos",
    esforco: "Sobrando 1 a 2 repetições, sem falhar",
    legado: "você ficou mais forte e aprendeu a mover cargas altas com segurança",
    objetivo: "ganhar força: poucas repetições, carga alta e descanso longo",
    sente: [
      "Menos queimação e menos dor muscular do que antes",
      "Cansaço mais “geral” do que no músculo",
      "Descansos longos entre as séries — é assim mesmo, não é treino parado",
    ],
    missao: [
      "Aqueça bem antes das séries pesadas",
      "Respeite o descanso inteiro entre as séries",
      "A carga só sobe se o movimento estiver limpo",
    ],
  },
  Hipertrofia: {
    reps: "8 a 12",
    carga: "Moderada",
    descanso: "60 a 90 segundos",
    esforco: "Sobrando 1 a 2 repetições",
    legado: "seu músculo recebeu bastante trabalho para crescer",
    objetivo: "construir músculo: repetições médias, mais séries e esforço perto do limite",
    sente: [
      "A carga cai em relação à fase anterior — é esperado, o estímulo é outro",
      "Mais queimação e sensação de músculo “cheio”",
      "Mais dor muscular nos primeiros treinos",
    ],
    missao: [
      "Controle a descida do movimento em toda repetição",
      "Chegue perto do limite em cada série",
      "Proteína e sono em dia: é no descanso que o músculo cresce",
    ],
  },
  Resistência: {
    reps: "15 a 20",
    carga: "Leve a moderada",
    descanso: "30 a 45 segundos",
    esforco: "Até a queimação forte, mantendo a execução",
    legado: "você ganhou resistência e fôlego para aguentar mais trabalho",
    objetivo: "aguentar mais trabalho: muitas repetições, carga mais leve e descanso curto",
    sente: [
      "A carga cai bastante — é esperado, não é perda de força",
      "Muita queimação e o fôlego mais exigido",
      "Treino mais dinâmico e suado",
    ],
    missao: [
      "Respeite o descanso curto: ele faz parte do estímulo",
      "Não deixe a execução desandar no fim da série",
      "Hidrate-se bem antes e durante o treino",
    ],
  },
};

const AVISAR = [
  "Dor na articulação (e não no músculo)",
  "Dor que não melhora depois de 3 dias",
  "Queda forte de sono, disposição ou apetite",
];
const MEDIR = ["Cargas dos exercícios principais", "Check-in semanal comigo", "Fotos e medidas no fim da fase"];

/** Texto com uma ideia por linha → lista (ignora marcadores e linhas vazias). */
export function linesOf(text: unknown): string[] {
  return String(text ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-•*✓]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const faixaTexto = (r: { series: string; max?: string }) => {
  const f = faixaDe({ grupo: "", ...r });
  return f ? (f.max > f.min ? `${f.min} a ${f.max}` : String(f.min)) : "";
};

/** O que continua igual, lido da estratégia. */
function mantemDe(state: StrategyState): string[] {
  const a = state.anamnese, x = state.answers;
  const pri = prioridadeGrupos(x);
  return [
    has(a.diasSemana) ? `${val(a.diasSemana)} treinos por semana` : "",
    has(x.divisao_qual) ? `A divisão dos treinos (${val(x.divisao_qual)})` : "",
    pri.length ? `As prioridades: ${pri.join(", ")}` : "",
  ].filter(Boolean);
}

export interface PhaseChangeOptions {
  tipo?: PhaseChangeKind;
  faseNumero?: number;
  focoDe?: PhaseFocus;
  focoPara?: PhaseFocus;
}

/** Documento sugerido para a troca — ponto de partida que o treinador edita. */
export function phaseChangeDefaults(state: StrategyState, o: PhaseChangeOptions = {}): PhaseChange {
  const tipo = o.tipo ?? "progressao";
  const fases = fasesDe(state.answers.periodizacao_fases);
  const faseNumero = Math.max(2, o.faseNumero ?? 2);
  const focoDe = o.focoDe ?? "Força";
  const focoPara = o.focoPara ?? "Hipertrofia";
  const de = FOCUS_PRESETS[focoDe], para = FOCUS_PRESETS[focoPara];
  const nova = fases[faseNumero - 1];
  const volume = volumeRows(state).map((r) => ({ grupo: r.grupo.trim(), antes: faixaTexto(r), agora: "" }));
  const mantem = mantemDe(state);

  const base = {
    tipo,
    faseNumero,
    focoDe,
    focoPara,
    inicio: hojeISO(),
    semanas: nova?.semanas ? String(nova.semanas) : "4",
    conquistas: "",
    tecnicas: [],
    volume,
    trocas: [],
    avisar: AVISAR.join("\n"),
    medir: MEDIR.join("\n"),
    mensagem: "",
  };

  if (tipo === "foco") {
    return {
      ...base,
      deNome: focoDe,
      paraNome: focoPara,
      porque:
        `No último mês, ${de.legado}. Agora usamos essa base para ${para.objetivo}. ` +
        "Cada fase prepara a seguinte: mudar o foco de tempos em tempos é o que mantém o seu corpo evoluindo — e isso já estava planejado desde o início.",
      mudancas: [
        { item: "Foco", antes: focoDe, agora: focoPara },
        { item: "Repetições", antes: de.reps, agora: para.reps },
        { item: "Carga", antes: de.carga, agora: para.carga },
        { item: "Descanso", antes: de.descanso, agora: para.descanso },
        { item: "Esforço", antes: de.esforco, agora: para.esforco },
      ],
      mantem: [...mantem, "A maior parte dos exercícios"].join("\n"),
      normal: para.sente.join("\n"),
      missao: para.missao.join("\n"),
    };
  }

  return {
    ...base,
    deNome: fases[faseNumero - 2]?.nome ?? `Fase ${faseNumero - 1}`,
    paraNome: nova?.nome ?? `Fase ${faseNumero}`,
    porque:
      "Nas últimas semanas, seu corpo aprendeu os movimentos e se acostumou com o treino. E corpo acostumado para de evoluir. " +
      "Por isso, agora aumentamos o desafio na medida certa: a base está pronta, é hora de subir o próximo andar — exatamente como planejamos desde o início.",
    mudancas: [
      { item: "Séries por semana", antes: "", agora: "Mais séries nos grupos prioritários" },
      { item: "Esforço", antes: "Sobrando 3 a 4 repetições", agora: "Sobrando 1 a 2 repetições" },
      { item: "Exercícios", antes: "", agora: "Troco um ou outro; o resto continua" },
    ],
    mantem: [...mantem, "A maior parte dos exercícios"].join("\n"),
    normal: [
      "Mais dor muscular na primeira semana",
      "Treino mais cansativo e um pouco mais longo",
      "Carga menor nos exercícios novos e nas técnicas novas",
    ].join("\n"),
    missao: [
      "Anote as cargas de cada treino",
      "Capriche na execução antes de subir a carga",
      "Durma bem: é no descanso que o músculo cresce",
    ].join("\n"),
  };
}

export type TimelineStatus = "feita" | "atual" | "proxima";
export interface TimelineStep { numero: number; nome: string; semanas: number | null; status: TimelineStatus }

/** Mapa das fases com o "você está aqui". Sem periodização, mostra só a troca. */
export function phaseTimeline(state: StrategyState, pc: PhaseChange): TimelineStep[] {
  const fases = pc.tipo === "progressao" ? fasesDe(state.answers.periodizacao_fases) : [];
  const status = (n: number): TimelineStatus => (n < pc.faseNumero ? "feita" : n === pc.faseNumero ? "atual" : "proxima");
  if (fases.length >= pc.faseNumero) {
    return fases.map((f) => ({
      numero: f.numero,
      nome: f.numero === pc.faseNumero ? pc.paraNome || f.nome : f.numero === pc.faseNumero - 1 ? pc.deNome || f.nome : f.nome,
      semanas: f.semanas,
      status: status(f.numero),
    }));
  }
  return [
    { numero: pc.faseNumero - 1, nome: pc.deNome, semanas: null, status: "feita" },
    { numero: pc.faseNumero, nome: pc.paraNome, semanas: parseInt(pc.semanas, 10) || null, status: "atual" },
  ];
}

/** Técnicas novas com a explicação em linguagem simples. */
export function techniqueNotes(pc: PhaseChange): { nome: string; como: string }[] {
  return pc.tecnicas.map((t) => ({ nome: t, como: INTENSIDADE_HINTS[t] ?? "" }));
}

export const filledChanges = (pc: PhaseChange) => pc.mudancas.filter((m) => has(m.item) && (has(m.antes) || has(m.agora)));
export const filledVolume = (pc: PhaseChange) => pc.volume.filter((v) => has(v.grupo) && has(v.agora));
export const filledSwaps = (pc: PhaseChange) => pc.trocas.filter((t) => has(t.sai) || has(t.entra));

/** Data prevista da próxima troca (início + semanas), ou null. */
export function nextChangeDate(pc: PhaseChange): Date | null {
  const [y, m, d] = pc.inicio.split("-").map(Number);
  const sem = parseInt(pc.semanas, 10);
  if (!y || !m || !d || !sem) return null;
  return new Date(y, m - 1, d + sem * 7, 12);
}

const dataBR = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/** Título da fase nova: "Fase 2 · Intensificação". */
export function phaseTitle(pc: PhaseChange): string {
  return `Fase ${pc.faseNumero}${has(pc.paraNome) ? ` · ${pc.paraNome}` : ""}`;
}

/** Versão WhatsApp do documento de troca de fase. */
export function phaseChangeWhatsapp(state: StrategyState, pc: PhaseChange): string {
  const nome = firstName(state.anamnese.nome);
  const out: string[] = [];
  const bloco = (titulo: string, linhas: string[]) => linhas.length && out.push(`${titulo}\n${linhas.join("\n")}`);
  const marcados = (xs: string[], m = "•") => xs.map((x) => `${m} ${x}`);

  out.push(
    `🚀 *Troca de fase${has(state.anamnese.tituloPlano) ? ` — ${val(state.anamnese.tituloPlano)}` : ""}*\n` +
      `${nome === "aluno" ? "Olá" : nome}, você fechou a fase *${pc.deNome}* e agora começa a *${phaseTitle(pc)}*.`,
  );

  const tl = phaseTimeline(state, pc);
  if (tl.length > 2) {
    bloco(
      "🗺️ *Onde você está*",
      tl.map((f) => `${f.status === "feita" ? "✅" : f.status === "atual" ? "👉" : "▫️"} Fase ${f.numero} · ${f.nome}${f.status === "atual" ? " _(você está aqui)_" : ""}`),
    );
  }
  bloco("🏆 *O que você conquistou*", marcados(linesOf(pc.conquistas), "✓"));
  if (has(pc.porque)) out.push(`💡 *Por que mudar agora*\n${pc.porque.trim()}`);
  bloco(
    "🔄 *O que muda*",
    filledChanges(pc).map((m) => `• *${m.item}:* ${has(m.antes) && has(m.agora) ? `${m.antes} → ${m.agora}` : m.agora || m.antes}`),
  );
  bloco("⚡ *Técnicas novas*", techniqueNotes(pc).map((t) => `• *${t.nome}*${t.como ? `: ${t.como.charAt(0).toLowerCase()}${t.como.slice(1)}` : ""}`));
  bloco(
    "📊 *Séries por semana*",
    filledVolume(pc).map((v) => `• ${v.grupo}: ${has(v.antes) ? `${v.antes} → ` : ""}${v.agora}`),
  );
  bloco(
    "🔁 *Exercícios que mudam*",
    filledSwaps(pc).map((t) => `• ${[t.sai, t.entra].filter(has).join(" → ")}${has(t.motivo) ? ` _(${t.motivo})_` : ""}`),
  );
  bloco("✅ *O que continua igual*", marcados(linesOf(pc.mantem)));
  bloco("🙂 *É normal sentir*", marcados(linesOf(pc.normal)));
  bloco("⚠️ *Me avise se sentir*", marcados(linesOf(pc.avisar)));
  bloco("🎯 *Sua missão nesta fase*", linesOf(pc.missao).map((l, i) => `${i + 1}. ${l}`));
  const prox = nextChangeDate(pc);
  bloco("📅 *Como vamos acompanhar*", [
    ...marcados(linesOf(pc.medir)),
    ...(prox ? [`Próxima troca de fase prevista: *${dataBR(prox)}*`] : []),
  ]);
  if (has(pc.mensagem)) out.push(pc.mensagem.trim());
  out.push("_O treino novo já está no aplicativo. Bora pra cima!_ 💪");
  return out.join("\n\n");
}
