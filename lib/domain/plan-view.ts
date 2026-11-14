import { DIAS_SEMANA, PRIORIDADE_ESTRATEGIAS, prioridadeGrupos } from "./config";
import { INTENSIDADE_HINTS } from "./config/option-details";
import { fasesDe } from "./export-app";
import { faixaDe, volumeRows } from "./report";
import type { StrategyState } from "./schema";
import { has, toInt, val } from "./util";

/**
 * A estratégia traduzida para o aluno: a semana dia a dia, cada termo técnico
 * com a explicação em uma frase, o que esperar de cada fase e as regras do
 * dia a dia. Usado pelo PDF Premium — o treinador decide, aqui só se traduz.
 */
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const lista = (v: unknown): string[] => (Array.isArray(v) ? v : has(v) ? [v] : []).map((x) => val(x)).filter(Boolean);

/* ------------------------------ a semana ------------------------------ */
const SESSOES: [RegExp, string][] = [
  [/^full\s*body$/, "Corpo todo"],
  [/^lower$|inferior/, "Pernas e glúteos"],
  [/^upper$|superior/, "Parte de cima: costas, peito, ombros e braços"],
  [/^push$/, "Empurrar: peito, ombros e tríceps"],
  [/^pull$/, "Puxar: costas e bíceps"],
  [/^legs$/, "Pernas e glúteos"],
];

/** "Lower" → "Pernas e glúteos" (vazio quando o nome já é claro ou é só uma letra). */
export function sessionMeaning(nome: string): string {
  const n = norm(nome);
  return SESSOES.find(([re]) => re.test(n))?.[1] ?? "";
}

/** Os treinos da divisão, em ordem: "ABC" → A, B, C; "Upper / Lower" → Upper, Lower. */
export function divisionSessions(divisao: unknown): string[] {
  const d = val(divisao);
  if (!d) return [];
  if (/^[A-F]{2,6}$/i.test(d)) return d.toUpperCase().split("").map((l) => `Treino ${l}`);
  return d.split(/\s*[/+]\s*/).map((s) => s.trim()).filter(Boolean);
}

export interface WeekDay {
  /** "Segunda"… ou "Treino 1" quando os dias não foram marcados. */
  dia: string;
  treino: string | null;
  significado: string;
}

/** A semana do aluno: com os dias marcados, os 7 dias (treino ou descanso); senão, só os treinos. */
export function weekPlan(state: StrategyState): { comDias: boolean; dias: WeekDay[] } {
  const sessoes = divisionSessions(state.answers.divisao_qual);
  const marcados = DIAS_SEMANA.filter((d) => lista(state.answers.divisao_dias).includes(d));
  const total = marcados.length || toInt(state.anamnese.diasSemana) || sessoes.length;
  if (!sessoes.length || !total) return { comDias: false, dias: [] };
  const treinoDe = (i: number) => {
    const t = sessoes[i % sessoes.length];
    return { treino: t, significado: sessionMeaning(t) };
  };
  if (!marcados.length) {
    return { comDias: false, dias: Array.from({ length: total }, (_, i) => ({ dia: `Treino ${i + 1}`, ...treinoDe(i) })) };
  }
  let i = 0;
  return {
    comDias: true,
    dias: DIAS_SEMANA.map((d) => (marcados.includes(d) ? { dia: d, ...treinoDe(i++) } : { dia: d, treino: null, significado: "" })),
  };
}

/* --------------------------- termos traduzidos --------------------------- */
export interface Term { nome: string; como: string }

const RECURSOS: Record<string, string> = {
  Falha: "Ir até não conseguir mais nenhuma repetição com boa execução",
  RIR: "Parar quando ainda conseguiria fazer mais 1 ou 2 repetições",
  RPE: "Uma nota de 0 a 10 para o esforço de cada série",
  Cadência: "Ritmo controlado, sem pressa, em cada repetição",
  "Tempo sob tensão": "Manter o músculo trabalhando por mais tempo em cada série",
  Isometria: "Segurar o movimento parado por alguns segundos",
  "Drop-set": "Ao terminar a série, reduzir a carga e continuar sem descanso",
  "Rest-pause": "Pausas curtas (10–20s) para somar mais repetições na mesma série",
  Cluster: "Pausas curtas dentro da série",
};

const PROGRESSAO: Record<string, string> = {
  "Dupla progressão (repetições → carga)": "Primeiro você aumenta as repetições; quando chegar ao topo da faixa, sobe a carga",
  "Subir a carga ao atingir o topo das repetições": "Fez o máximo de repetições em todas as séries? No próximo treino, a carga sobe",
  "Acrescentar séries a cada bloco": "A cada fase, um pouco mais de séries",
  "Trocar exercícios a cada 4–6 semanas": "Alguns exercícios mudam de tempos em tempos, para o corpo não se acostumar",
  "Inserir técnicas avançadas na fase final": "Na última fase entram técnicas para exigir mais do músculo",
  "Reavaliar a cada 4 semanas": "A cada 4 semanas eu revejo tudo com você e ajusto",
  "Deload quando houver fadiga acumulada": "Se o cansaço acumular, fazemos uma semana mais leve para você recuperar",
  "Ajustar pelo RIR/RPE da semana": "O esforço da semana se ajusta a como você está se sentindo",
};

const termos = (v: unknown, dic: Record<string, string>): Term[] => lista(v).map((nome) => ({ nome, como: dic[nome] ?? "" }));

export const intensityTerms = (state: StrategyState): Term[] => termos(state.answers.intensidade_estrategia, INTENSIDADE_HINTS);
export const resourceTerms = (state: StrategyState): Term[] => termos(state.answers.intensidade_tecnicas, RECURSOS);
export const progressionTerms = (state: StrategyState): Term[] => termos(state.answers.progressao_como, PROGRESSAO);
export const priorityTerms = (state: StrategyState): Term[] =>
  prioridadeGrupos(state.answers).length ? termos(state.answers.prioridade_estrategias, PRIORIDADE_ESTRATEGIAS) : [];

/* ------------------------------- volume ------------------------------- */
export interface VolumeBar { grupo: string; texto: string; pct: number; prioritario: boolean }

/** Barras de volume: largura relativa ao grupo que mais treina; prioritários em destaque. */
export function volumeBars(state: StrategyState): VolumeBar[] {
  const pri = prioridadeGrupos(state.answers).map(norm);
  const rows = volumeRows(state)
    .map((r) => ({ r, f: faixaDe(r) }))
    .filter((x): x is { r: (typeof x)["r"]; f: { min: number; max: number } } => x.f !== null);
  const topo = Math.max(1, ...rows.map((x) => x.f.max));
  return rows
    .map(({ r, f }) => ({
      grupo: r.grupo.trim(),
      texto: f.max > f.min ? `${f.min} a ${f.max}` : String(f.min),
      pct: Math.round((f.max / topo) * 100),
      prioritario: pri.some((p) => norm(r.grupo).includes(p) || p.includes(norm(r.grupo))),
    }))
    .sort((a, b) => Number(b.prioritario) - Number(a.prioritario) || b.pct - a.pct);
}

/** Uma frase que dá sentido aos números: quem recebe mais trabalho, e por quê. */
export function volumeInsight(bars: VolumeBar[]): string {
  const pri = bars.filter((b) => b.prioritario).map((b) => b.grupo.toLowerCase());
  if (!pri.length) return "Cada grupo recebe a quantidade de trabalho que ele precisa para evoluir, sem passar do que você recupera.";
  const nomes = pri.length > 1 ? `${pri.slice(0, -1).join(", ")} e ${pri[pri.length - 1]}` : pri[0];
  return `Seus ${nomes} recebem mais séries do que os outros grupos: são a sua prioridade. Os demais ficam no volume certo para evoluir sem roubar a sua energia.`;
}

/* -------------------------------- fases -------------------------------- */
const ESPERAR: [RegExp, string][] = [
  [/adapta|base|tecnic|introdu/, "Aprender os movimentos e criar o hábito. As cargas são confortáveis de propósito."],
  [/intensific|forca|carga|progress/, "O treino fica mais desafiador: mais carga e mais esforço. É aqui que o corpo mais muda."],
  [/consolid|pico|final|refin|defin/, "Firmar o que você construiu, com as técnicas mais avançadas, e medir o resultado."],
  [/volume|acumul|hipertrof/, "Mais séries e mais trabalho para o músculo crescer."],
  [/deload|recuper|regener/, "Semana mais leve, para o corpo recuperar e voltar mais forte."],
  [/resist/, "Mais repetições e menos descanso, para aguentar mais trabalho."],
];
const POR_POSICAO = [
  "Aprender os movimentos e criar o hábito.",
  "Aumentar o desafio, na medida certa.",
  "Firmar os ganhos e medir o resultado.",
];

export interface PhaseStep { numero: number; nome: string; semanas: number | null; esperar: string }

export function phaseSteps(state: StrategyState): PhaseStep[] {
  return fasesDe(state.answers.periodizacao_fases).slice(0, 5).map((f, i) => ({
    ...f,
    esperar: ESPERAR.find(([re]) => re.test(norm(f.nome)))?.[1] ?? POR_POSICAO[Math.min(i, POR_POSICAO.length - 1)],
  }));
}

/* ----------------------------- cuidados ----------------------------- */
const NADA = /^(n[aã]o|nenhum[a]?|nada|sem\b|-+$)/i;

export interface CareView { contou: string[]; plano: string[] }

/** O que o aluno contou (dores, lesões, limitações) e o que o plano faz por isso. */
export function careView(state: StrategyState): CareView {
  const a = state.anamnese, x = state.answers;
  const contou = [a.dores, a.lesoes, a.limitacoes].map((v) => val(v)).filter((t) => t && !NADA.test(t));
  const plano: string[] = [];
  if (has(x.adapt_dor)) plano.push(val(x.adapt_dor));
  if (has(x.adapt_reab)) plano.push(val(x.adapt_reab));
  if (has(x.exercicios_proibido)) plano.push(`Por enquanto, vamos evitar: ${val(x.exercicios_proibido)}`);
  if (has(x.divisao_adaptacoes)) plano.push(val(x.divisao_adaptacoes));
  if (has(x.mobilidade_porque)) plano.push(val(x.mobilidade_porque));
  return { contou, plano };
}

/* --------------------------- regra de ouro --------------------------- */
/** Três comportamentos para todo treino, tirados das decisões da estratégia. */
export function goldenRules(state: StrategyState): string[] {
  const x = state.answers;
  const rec = lista(x.intensidade_tecnicas), prog = lista(x.progressao_como), log = lista(x.exercicios_logica);
  const out: string[] = [];
  out.push(
    log.includes("Técnica e amplitude acima da carga") || rec.includes("Cadência")
      ? "Movimento bem feito vale mais do que carga alta. Capriche em cada repetição."
      : "Capriche na execução antes de pensar em subir a carga.",
  );
  out.push(
    rec.includes("Falha")
      ? "Leve as séries até o limite, sempre com boa execução."
      : "Termine cada série sentindo que ainda faria mais 1 ou 2 repetições.",
  );
  out.push(
    prog.some((p) => /topo|dupla/i.test(p))
      ? "Anote as cargas. Fez o máximo de repetições em todas as séries? A carga sobe no próximo treino."
      : "Anote as cargas de cada treino: é assim que a gente enxerga a sua evolução.",
  );
  return out;
}
