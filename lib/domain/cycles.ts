import type { Anamnese } from "./schema/anamnese";
import { ANAMNESE_SECTIONS, TOPICS } from "./config";
import { decisionQuestions, type StrategyRecord } from "./insights";
import { val } from "./util";

/**
 * Comparar ciclos do mesmo aluno: o que mudou no perfil, nas decisões e no
 * volume entre duas estratégias salvas do mesmo aluno.
 */

function norm(s: unknown): string {
  return String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function itemsOf(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  const s = typeof v === "string" ? v.trim() : "";
  return s ? [s] : [];
}

/** Nome do aluno de uma estratégia salva (chave para agrupar os ciclos). */
export function alunoDe(r: StrategyRecord): string {
  return val(r.anamnese?.nome) || val(r.nome) || "";
}

export interface StudentCycles<T extends StrategyRecord> {
  key: string;
  nome: string;
  /** Do ciclo mais antigo para o mais recente. */
  ciclos: T[];
}

/** Alunos com 2 ou mais estratégias salvas (ciclos), do mais recente para o mais antigo. */
export function studentsWithCycles<T extends StrategyRecord>(records: T[]): StudentCycles<T>[] {
  const map = new Map<string, T[]>();
  for (const r of records) {
    const key = norm(alunoDe(r));
    if (!key || key === "aluno sem nome") continue;
    map.set(key, [...(map.get(key) ?? []), r]);
  }
  return [...map.entries()]
    .filter(([, list]) => list.length >= 2)
    .map(([key, list]) => {
      const ciclos = [...list].sort((a, b) => String(a.savedAt ?? "").localeCompare(String(b.savedAt ?? "")));
      return { key, nome: alunoDe(ciclos[ciclos.length - 1]), ciclos };
    })
    .sort((a, b) =>
      String(b.ciclos[b.ciclos.length - 1].savedAt ?? "").localeCompare(String(a.ciclos[a.ciclos.length - 1].savedAt ?? "")),
    );
}

export interface FieldDiff {
  id: string;
  label: string;
  antes: string;
  depois: string;
  mudou: boolean;
}

export type DecisionStatus = "mantido" | "mudou" | "novo" | "removido";

export interface DecisionDiff {
  id: string;
  label: string;
  antes: string[];
  depois: string[];
  status: DecisionStatus;
  /** Em múltipla escolha: o que entrou e o que saiu. */
  entrou: string[];
  saiu: string[];
}

export interface VolumeDiff {
  grupo: string;
  antes: number | null;
  depois: number | null;
  delta: number | null;
}

export interface CycleComparison {
  perfil: FieldDiff[];
  decisoes: DecisionDiff[];
  volume: VolumeDiff[];
  totalAntes: number | null;
  totalDepois: number | null;
  mudaram: number;
  mantidas: number;
  /** Dias entre os dois ciclos (null se faltar data). */
  dias: number | null;
}

/** Campos da anamnese que fazem sentido comparar entre ciclos. */
const PERFIL_IDS = [
  "objetivo", "prioridadeMuscular", "experiencia", "diasSemana", "tempoSessao",
  "composicao", "dores", "lesoes", "limitacoes", "mobilidade", "sono", "estresse", "motivacao",
] as const;

const labelAnamnese = (id: string) =>
  ANAMNESE_SECTIONS.flatMap((s) => s.fields).find((f) => f.id === id)?.label ?? id;

function seriesMap(r: StrategyRecord): Map<string, { grupo: string; series: number }> {
  const m = new Map<string, { grupo: string; series: number }>();
  for (const row of r.volume ?? []) {
    const n = parseInt(String(row.series), 10);
    const g = String(row.grupo ?? "").trim();
    if (!g || !Number.isFinite(n) || n <= 0) continue;
    const k = norm(g);
    const cur = m.get(k);
    m.set(k, { grupo: g, series: (cur?.series ?? 0) + n });
  }
  return m;
}

const soma = (m: Map<string, { series: number }>) =>
  m.size ? [...m.values()].reduce((a, b) => a + b.series, 0) : null;

/** Compara o ciclo "antes" (a) com o ciclo "depois" (b). */
export function compareCycles(a: StrategyRecord, b: StrategyRecord): CycleComparison {
  const perfil: FieldDiff[] = [];
  for (const id of PERFIL_IDS) {
    const antes = val((a.anamnese as Anamnese)?.[id]);
    const depois = val((b.anamnese as Anamnese)?.[id]);
    if (!antes && !depois) continue;
    perfil.push({ id, label: labelAnamnese(id), antes, depois, mudou: norm(antes) !== norm(depois) });
  }

  const decisoes: DecisionDiff[] = [];
  for (const q of decisionQuestions()) {
    const antes = itemsOf(a.answers?.[q.id]);
    const depois = itemsOf(b.answers?.[q.id]);
    if (!antes.length && !depois.length) continue;
    const nA = antes.map(norm), nD = depois.map(norm);
    const entrou = depois.filter((x) => !nA.includes(norm(x)));
    const saiu = antes.filter((x) => !nD.includes(norm(x)));
    const status: DecisionStatus = !antes.length ? "novo" : !depois.length ? "removido" : entrou.length || saiu.length ? "mudou" : "mantido";
    decisoes.push({ id: q.id, label: q.label, antes, depois, status, entrou, saiu });
  }

  const vA = seriesMap(a), vB = seriesMap(b);
  const grupos = new Set([...vA.keys(), ...vB.keys()]);
  const volume: VolumeDiff[] = [...grupos]
    .map((k) => {
      const antes = vA.get(k)?.series ?? null;
      const depois = vB.get(k)?.series ?? null;
      return {
        grupo: vB.get(k)?.grupo ?? vA.get(k)!.grupo,
        antes,
        depois,
        delta: antes !== null && depois !== null ? depois - antes : null,
      };
    })
    .sort((x, y) => (y.depois ?? -1) - (x.depois ?? -1) || (y.antes ?? -1) - (x.antes ?? -1));

  const tA = Date.parse(String(a.savedAt ?? "")), tB = Date.parse(String(b.savedAt ?? ""));
  return {
    perfil,
    decisoes,
    volume,
    totalAntes: soma(vA),
    totalDepois: soma(vB),
    mudaram: decisoes.filter((d) => d.status !== "mantido").length,
    mantidas: decisoes.filter((d) => d.status === "mantido").length,
    dias: Number.isFinite(tA) && Number.isFinite(tB) ? Math.round(Math.abs(tB - tA) / 86_400_000) : null,
  };
}

const lista = (xs: string[]) => xs.join(", ") || "—";

/** Texto da comparação (para a IA escrever a mensagem do novo ciclo). */
export function comparisonText(c: CycleComparison, depois: StrategyRecord): string {
  const lines: string[] = [];
  if (c.dias !== null) lines.push(`Intervalo entre os ciclos: ${c.dias} dias.`);
  const perfil = c.perfil.filter((p) => p.mudou);
  if (perfil.length) {
    lines.push("Mudanças no perfil do aluno:");
    for (const p of perfil) lines.push(`- ${p.label}: ${p.antes || "—"} → ${p.depois || "—"}`);
  }
  lines.push("Decisões do treino:");
  for (const d of c.decisoes) {
    if (d.status === "mantido") lines.push(`- ${d.label}: mantido (${lista(d.depois)})`);
    else if (d.status === "mudou") lines.push(`- ${d.label}: ${lista(d.antes)} → ${lista(d.depois)}`);
    else if (d.status === "novo") lines.push(`- ${d.label}: novo (${lista(d.depois)})`);
    else lines.push(`- ${d.label}: retirado (antes: ${lista(d.antes)})`);
  }
  const vol = c.volume.filter((v) => v.delta !== null && v.delta !== 0);
  if (vol.length || (c.totalAntes !== null && c.totalDepois !== null)) {
    lines.push(
      `Volume semanal: ${c.totalAntes ?? "—"} → ${c.totalDepois ?? "—"} séries` +
        (vol.length ? ` (${vol.map((v) => `${v.grupo} ${v.delta! > 0 ? "+" : ""}${v.delta}`).join(", ")})` : "") + ".",
    );
  }
  const porques = TOPICS.flatMap((t) => t.questions.filter((q) => q.why))
    .map((q) => val(depois.answers?.[q.id]))
    .filter(Boolean);
  if (porques.length) {
    lines.push("Motivos escritos pelo treinador no novo ciclo:");
    for (const p of porques.slice(0, 6)) lines.push(`- ${p}`);
  }
  return lines.join("\n");
}
