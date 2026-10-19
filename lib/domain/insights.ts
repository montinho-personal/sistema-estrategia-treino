import type { Anamnese } from "./schema/anamnese";
import type { Answers } from "./schema/answers";
import type { VolumeRow } from "./schema";
import { TOPICS } from "./config";
import { val } from "./util";

/**
 * Painel do treinador: cruza todas as estratégias salvas no histórico para
 * mostrar a metodologia do treinador na visão macro — e alimenta a "memória"
 * que a IA recebe, para responder cada vez mais do jeito que ele pensa.
 * Tudo aqui é determinístico (sem IA): funciona mesmo com a IA desligada.
 */

/** O mínimo de uma estratégia salva que a análise precisa. */
export interface StrategyRecord {
  nome?: string;
  savedAt?: string;
  anamnese: Anamnese;
  answers: Answers;
  volume?: VolumeRow[];
}

export interface Count {
  value: string;
  count: number;
  /** % sobre a base informada (ex.: estratégias que responderam a pergunta). */
  pct: number;
}

export interface QuestionStats {
  id: string;
  label: string;
  multi: boolean;
  /** Quantas estratégias responderam esta pergunta. */
  answered: number;
  top: Count[];
}

export interface ObjectiveProfile {
  objetivo: string;
  n: number;
  destaques: { label: string; value: string; count: number; of: number }[];
  volumeMedio: number | null;
}

export interface VolumeStat {
  grupo: string;
  media: number;
  /** Em quantas estratégias o grupo aparece na tabela de volume. */
  n: number;
}

export interface HistoryInsights {
  total: number;
  alunos: number;
  desde?: string;
  ate?: string;
  objetivos: Count[];
  experiencias: Count[];
  escolhas: QuestionStats[];
  porObjetivo: ObjectiveProfile[];
  volume: VolumeStat[];
  volumeTotalMedio: number | null;
  comVolume: number;
  porquesPct: number | null;
  observacoes: string[];
}

/* ------------------------------ utilidades ------------------------------ */
function norm(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function itemsOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  const s = typeof v === "string" ? v.trim() : "";
  return s ? [s] : [];
}

/** Conta valores entre registros (cada registro conta no máximo 1x por valor). */
function tally(lists: string[][], base: number): Count[] {
  const map = new Map<string, { value: string; count: number }>();
  for (const list of lists) {
    const seen = new Set<string>();
    for (const v of list) {
      const k = norm(v);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      const e = map.get(k) ?? { value: v, count: 0 };
      e.count++;
      map.set(k, e);
    }
  }
  return [...map.values()]
    .map((e) => ({ ...e, pct: base ? Math.round((e.count / base) * 100) : 0 }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "pt-BR"));
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Objetivo de uma estratégia: o da anamnese ou, na falta, o da entrevista. */
export function objetivoDe(r: StrategyRecord): string {
  return val(r.anamnese.objetivo) || itemsOf(r.answers.objetivo_principal)[0] || "Sem objetivo informado";
}

/** Perguntas de escolha (opções clicáveis) — as que dá para comparar entre estratégias. */
export function decisionQuestions(): { id: string; label: string; multi: boolean }[] {
  const out: { id: string; label: string; multi: boolean }[] = [];
  for (const t of TOPICS) {
    for (const q of t.questions) {
      if (q.type !== "choice" && q.type !== "multi") continue;
      out.push({ id: q.id, label: q.label ?? (q.id === t.mainQ ? t.name : q.prompt), multi: q.type === "multi" });
    }
  }
  return out;
}

function whyIds(): string[] {
  return TOPICS.flatMap((t) => t.questions.filter((q) => q.why).map((q) => q.id));
}

/** Total semanal de séries de uma estratégia (null se não há tabela). */
function volumeTotal(r: StrategyRecord): number | null {
  const rows = (r.volume ?? []).map((x) => parseInt(String(x.series), 10)).filter((n) => Number.isFinite(n) && n > 0);
  return rows.length ? rows.reduce((a, b) => a + b, 0) : null;
}

/** Destaques mostrados por objetivo (a decisão mais usada em cada um). */
const DESTAQUES: { id: string; label: string }[] = [
  { id: "divisao_qual", label: "Divisão" },
  { id: "volume_frequencia", label: "Frequência" },
  { id: "intensidade_estrategia", label: "Intensidade" },
  { id: "periodizacao_fases", label: "Periodização" },
  { id: "progressao_como", label: "Progressão" },
  { id: "cardio_have", label: "Cardio" },
];

const TECNICAS_AVANCADAS = /drop|rest-?pause|cluster|falha|bi-?set|21s|negativa|explosiv/i;

/* ------------------------------- análise -------------------------------- */
export function analyzeHistory(records: StrategyRecord[]): HistoryInsights {
  const total = records.length;
  const nomes = new Set(records.map((r) => norm(val(r.anamnese.nome) || r.nome || "")).filter(Boolean));
  const datas = records.map((r) => r.savedAt).filter((d): d is string => Boolean(d)).sort();

  const objetivos = tally(records.map((r) => [objetivoDe(r)]), total);
  const experiencias = tally(records.map((r) => itemsOf(r.anamnese.experiencia)), total);

  const escolhas: QuestionStats[] = [];
  for (const q of decisionQuestions()) {
    const lists = records.map((r) => itemsOf(r.answers[q.id])).filter((l) => l.length > 0);
    if (!lists.length) continue;
    escolhas.push({ id: q.id, label: q.label, multi: q.multi, answered: lists.length, top: tally(lists, lists.length) });
  }

  // Por objetivo: a escolha mais frequente em cada decisão-chave.
  const grupos = new Map<string, StrategyRecord[]>();
  for (const r of records) {
    const o = objetivoDe(r);
    const key = norm(o);
    const g = grupos.get(key) ?? [];
    g.push(r);
    grupos.set(key, g);
  }
  const porObjetivo: ObjectiveProfile[] = [...grupos.values()]
    .map((g) => {
      const destaques = DESTAQUES.flatMap((d) => {
        const lists = g.map((r) => itemsOf(r.answers[d.id])).filter((l) => l.length > 0);
        const top = tally(lists, lists.length)[0];
        return top ? [{ label: d.label, value: top.value, count: top.count, of: lists.length }] : [];
      });
      const totais = g.map(volumeTotal).filter((n): n is number => n !== null);
      return {
        objetivo: objetivoDe(g[0]),
        n: g.length,
        destaques,
        volumeMedio: totais.length ? Math.round(totais.reduce((a, b) => a + b, 0) / totais.length) : null,
      };
    })
    .sort((a, b) => b.n - a.n);

  // Volume médio por grupo muscular (só entre as estratégias que têm o grupo).
  const vol = new Map<string, { grupo: string; soma: number; n: number }>();
  for (const r of records) {
    for (const row of r.volume ?? []) {
      const s = parseInt(String(row.series), 10);
      const g = String(row.grupo ?? "").trim();
      if (!g || !Number.isFinite(s) || s <= 0) continue;
      const k = norm(g);
      const e = vol.get(k) ?? { grupo: g, soma: 0, n: 0 };
      e.soma += s;
      e.n++;
      vol.set(k, e);
    }
  }
  const volume = [...vol.values()]
    .map((e) => ({ grupo: e.grupo, media: round1(e.soma / e.n), n: e.n }))
    .sort((a, b) => b.media - a.media);
  const totais = records.map(volumeTotal).filter((n): n is number => n !== null);
  const volumeTotalMedio = totais.length ? Math.round(totais.reduce((a, b) => a + b, 0) / totais.length) : null;

  // Quanto dos "porquês" o próprio treinador escreve.
  const whys = whyIds();
  let whyTotal = 0, whyFeitos = 0;
  for (const r of records) {
    for (const id of whys) {
      whyTotal++;
      if (itemsOf(r.answers[id]).length) whyFeitos++;
    }
  }
  const porquesPct = whyTotal ? Math.round((whyFeitos / whyTotal) * 100) : null;

  const insights: HistoryInsights = {
    total,
    alunos: nomes.size,
    desde: datas[0],
    ate: datas[datas.length - 1],
    objetivos,
    experiencias,
    escolhas,
    porObjetivo,
    volume,
    volumeTotalMedio,
    comVolume: totais.length,
    porquesPct,
    observacoes: [],
  };
  insights.observacoes = observacoes(records, insights);
  return insights;
}

/** Observações automáticas: padrões fortes, incoerências e lacunas. */
function observacoes(records: StrategyRecord[], ins: HistoryInsights): string[] {
  const out: string[] = [];
  const divisao = ins.escolhas.find((e) => e.id === "divisao_qual");
  if (divisao && divisao.answered >= 3 && divisao.top[0]?.pct >= 75) {
    out.push(
      `Você usou ${divisao.top[0].value} em ${divisao.top[0].pct}% das estratégias. Se é intencional, ótimo — só confira se a divisão está acompanhando os dias disponíveis de cada aluno.`,
    );
  }
  const emag = records.filter((r) => norm(objetivoDe(r)) === "emagrecimento");
  const semCardio = emag.filter((r) => val(r.answers.cardio_have) === "Não").length;
  if (semCardio) {
    out.push(`Em ${semCardio} de ${emag.length} estratégia(s) de emagrecimento o cardio ficou de fora — vale confirmar se foi uma escolha consciente.`);
  }
  const iniciantesAvancados = records.filter(
    (r) =>
      norm(val(r.anamnese.experiencia)) === "iniciante" &&
      TECNICAS_AVANCADAS.test([...itemsOf(r.answers.intensidade_estrategia), ...itemsOf(r.answers.intensidade_tecnicas)].join(" ")),
  ).length;
  if (iniciantesAvancados) {
    out.push(`${iniciantesAvancados} aluno(s) iniciante(s) receberam técnicas avançadas de intensidade (drop-set, rest-pause, bi-set…).`);
  }
  if (ins.porquesPct !== null && ins.total >= 2 && ins.porquesPct < 30) {
    out.push(
      `Você escreveu só ${ins.porquesPct}% dos “porquês”. Escrever em alguns casos ensina a IA o seu raciocínio — e deixa o relatório mais com a sua cara.`,
    );
  }
  if (ins.total >= 2 && ins.comVolume / ins.total < 0.5) {
    out.push(`A tabela de volume foi preenchida em ${ins.comVolume} de ${ins.total} estratégias. Com ela, o painel mostra o seu padrão de séries por grupo.`);
  }
  const alto = ins.volume.filter((v) => v.media > 20).slice(0, 2);
  for (const v of alto) {
    out.push(`${v.grupo}: média de ${String(v.media).replace(".", ",")} séries/semana — acima de 20, a recuperação costuma virar o limite.`);
  }
  return out;
}

/* --------------------- sugestão a partir do histórico --------------------- */
export interface HistorySuggestion {
  value: string;
  count: number;
  of: number;
}

/**
 * Em alunos com o mesmo objetivo, qual opção o treinador costuma escolher
 * nesta pergunta? Só sugere quando há um padrão claro (2+ vezes e maioria).
 */
export function historySuggestion(
  records: StrategyRecord[],
  anamnese: Anamnese,
  questionId: string,
  options: string[] = [],
): HistorySuggestion | null {
  const obj = norm(val(anamnese.objetivo));
  const base = obj ? records.filter((r) => norm(objetivoDe(r)) === obj) : records;
  const lists = base.map((r) => itemsOf(r.answers[questionId])).filter((l) => l.length > 0);
  const top = tally(lists, lists.length)[0];
  if (!top || top.count < 2 || top.pct < 50) return null;
  const opt = options.find((o) => norm(o) === norm(top.value));
  if (!opt) return null;
  return { value: opt, count: top.count, of: lists.length };
}

/* ------------------------- memória para a IA ------------------------- */
/** Textos do próprio treinador (edições e "porquês") para a IA imitar o tom. */
export function writingSamples(records: StrategyRecord[], styleTexts: string[] = [], max = 6): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (t: string) => {
    const s = t.replace(/\s+/g, " ").trim();
    if (s.length < 40) return;
    const k = norm(s).slice(0, 80);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(s.length > 280 ? `${s.slice(0, 277)}…` : s);
  };
  for (const t of styleTexts) add(t);
  const recentes = [...records].sort((a, b) => String(b.savedAt ?? "").localeCompare(String(a.savedAt ?? "")));
  const ids = [...whyIds(), "mensagem_final"];
  for (const r of recentes) {
    for (const id of ids) {
      for (const t of itemsOf(r.answers[id])) add(t);
    }
  }
  return out.slice(0, max);
}

/** Resumo legível das estratégias (usado pela IA e pela "memória do treinador"). */
export function insightsText(ins: HistoryInsights): string {
  if (!ins.total) return "";
  const lines: string[] = [`Estratégias analisadas: ${ins.total} (${ins.alunos} aluno(s)).`];
  if (ins.objetivos.length) lines.push(`Objetivos: ${ins.objetivos.map((c) => `${c.value} ${c.count}`).join(", ")}.`);
  if (ins.experiencias.length) lines.push(`Experiência: ${ins.experiencias.map((c) => `${c.value} ${c.count}`).join(", ")}.`);
  lines.push("Escolhas mais frequentes:");
  for (const e of ins.escolhas.slice(0, 18)) {
    lines.push(`- ${e.label}: ${e.top.slice(0, 3).map((c) => `${c.value} (${c.count}/${e.answered})`).join("; ")}`);
  }
  if (ins.porObjetivo.length) {
    lines.push("Por objetivo:");
    for (const p of ins.porObjetivo) {
      const d = p.destaques.map((x) => `${x.label}: ${x.value}`).join("; ");
      lines.push(`- ${p.objetivo} (${p.n}): ${d || "sem decisões registradas"}${p.volumeMedio ? `; volume médio ${p.volumeMedio} séries/semana` : ""}`);
    }
  }
  if (ins.volume.length) {
    lines.push(`Volume médio por grupo (séries/semana): ${ins.volume.slice(0, 10).map((v) => `${v.grupo} ${String(v.media).replace(".", ",")}`).join(", ")}.`);
  }
  if (ins.porquesPct !== null) lines.push(`"Porquês" escritos pelo próprio treinador: ${ins.porquesPct}%.`);
  if (ins.observacoes.length) {
    lines.push("Observações automáticas:");
    for (const o of ins.observacoes) lines.push(`- ${o}`);
  }
  return lines.join("\n");
}

/**
 * Memória do treinador enviada à IA: princípios que ele definiu, padrões das
 * estratégias anteriores e exemplos de como ele escreve. Vazia se não há nada.
 */
export function trainerMemoryText(opts: { insights: HistoryInsights; principios?: string; amostras?: string[] }): string {
  const parts: string[] = [];
  const principios = (opts.principios ?? "").trim();
  if (principios) parts.push(`PRINCÍPIOS DEFINIDOS PELO TREINADOR (siga sempre):\n${principios}`);
  const resumo = insightsText(opts.insights);
  if (resumo) parts.push(`PADRÕES DAS ESTRATÉGIAS ANTERIORES DO TREINADOR:\n${resumo}`);
  const amostras = (opts.amostras ?? []).filter(Boolean);
  if (amostras.length) {
    parts.push(
      `EXEMPLOS DE COMO O TREINADOR ESCREVE (imite o tom e o vocabulário, não copie):\n${amostras.map((a) => `“${a}”`).join("\n")}`,
    );
  }
  return parts.join("\n\n");
}

/* --------------------- "O que a IA sabe sobre você" --------------------- */

/** Com quantas estratégias os padrões ficam confiáveis (meta do medidor). */
export const META_ESTRATEGIAS = 20;

/** forte: a IA segue · tendencia: ponto de partida · varia: decide pelo aluno. */
export type PatternStrength = "forte" | "tendencia" | "varia";

export interface DecisionPattern {
  id: string;
  label: string;
  value: string;
  pct: number;
  count: number;
  of: number;
  forca: PatternStrength;
}

export interface MemoryOverview {
  estrategias: number;
  alunos: number;
  nivel: { label: string; pct: number };
  principios: string[];
  /** Decisões do treinador, agrupadas pela força do padrão. */
  padroes: Record<PatternStrength, DecisionPattern[]>;
  /** O que depende do aluno (objetivos, prioridades) — perfil, não decisão. */
  perfil: DecisionPattern[];
  amostras: string[];
}

/** Perguntas que descrevem o aluno, e não uma escolha de método do treinador. */
const PERFIL_IDS = new Set(["objetivo_principal", "objetivo_secundario", "objetivo_prioridade"]);

/** Força do padrão: só é "forte" com base mínima (3 estratégias) e 60%+. */
export function patternStrength(pct: number, of: number): PatternStrength {
  if (pct >= 60 && of >= 3) return "forte";
  if (pct >= 40) return "tendencia";
  return "varia";
}

function nivelDe(total: number): string {
  if (!total) return "Ainda não te conhece";
  if (total < 5) return "Começando a te conhecer";
  if (total < 15) return "Aprendendo o seu jeito";
  return "Já conhece bem o seu jeito";
}

/** Resumo visual da memória enviada à IA (o mesmo conteúdo de trainerMemoryText). */
export function memoryOverview(ins: HistoryInsights, principios = "", amostras: string[] = []): MemoryOverview {
  const padroes: Record<PatternStrength, DecisionPattern[]> = { forte: [], tendencia: [], varia: [] };
  const perfil: DecisionPattern[] = [];
  for (const e of ins.escolhas) {
    const top = e.top[0];
    if (!top || !e.answered) continue;
    const forca = patternStrength(top.pct, e.answered);
    const p = { id: e.id, label: e.label, value: top.value, pct: top.pct, count: top.count, of: e.answered, forca };
    if (PERFIL_IDS.has(e.id)) perfil.push(p);
    else padroes[forca].push(p);
  }
  return {
    estrategias: ins.total,
    alunos: ins.alunos,
    nivel: { label: nivelDe(ins.total), pct: Math.min(100, Math.round((ins.total / META_ESTRATEGIAS) * 100)) },
    principios: principios
      .split("\n")
      .map((l) => l.replace(/^\s*(?:[-•*✓]|\d+[.)])\s*/, "").trim())
      .filter(Boolean),
    padroes,
    perfil,
    amostras: amostras.filter(Boolean),
  };
}
