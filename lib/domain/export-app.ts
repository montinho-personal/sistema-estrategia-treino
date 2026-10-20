/**
 * Exportação para o app Montinho (prescrição e acompanhamento do aluno).
 *
 * Gera um arquivo de dados (JSON) com a estratégia já estruturada — objetivo,
 * divisão, prioridades, metas de volume em faixa, fases, preparação,
 * progressão, acompanhamento e textos. O app importa esse arquivo no cadastro
 * do aluno e monta os dias da semana por músculo com essas metas.
 * Nada é inventado: campo não preenchido vai vazio (null / lista vazia).
 */
import { prioridadeGrupos } from "./config";
import { ageFromBirth, birthDateIso, cleanEmail, whatsappDigits } from "./contact";
import { faixaDe, reportClosing, studentDiagnosisData, volumeRows } from "./report";
import type { StrategyState } from "./schema";
import { has, upperFirst, val } from "./util";

const inteiro = (v: unknown): number | null => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const FORMATO_APP = "montinho-strategy" as const;
export const VERSAO_APP = 1 as const;

export interface FaseApp { numero: number; nome: string; semanas: number | null }
export interface VolumeApp { rotulo: string; series: number; max: number | null }

export interface EstrategiaApp {
  versao: 1;
  aluno: string | null;
  /** Cadastro do aluno no app (null quando não preenchido na anamnese). */
  dataNascimento: string | null; // AAAA-MM-DD
  idade: number | null;
  sexo: string | null;
  email: string | null;
  whatsapp: string | null; // só dígitos, com DDI 55
  titulo: string | null;
  data: string | null;
  objetivo: string | null;
  objetivosSecundarios: string | null;
  experiencia: string | null;
  diasPorSemana: number | null;
  minutosPorTreino: number | null;
  prioridades: string[];
  comoPriorizar: string[];
  divisao: string | null;
  justificativaDivisao: string | null;
  adaptacoes: string | null;
  intensidade: string | null;
  volume: VolumeApp[];
  volumeTotal: number | null;
  frequencia: string | null;
  fases: FaseApp[];
  preparacao: string[];
  preparacaoMotivo: string | null;
  progressao: string[];
  checkinSemanal: string[];
  pontosFortes: string[];
  pontosAtencao: string[];
  frase: string | null;
  logicaExercicios: string[];
  aerobico: string | null;
  encerramento: string | null;
  /** Só no arquivo (o PDF não traz): para o personal, no app. */
  restricoes: string | null;
  exerciciosObrigatorios: string | null;
  exerciciosEvitar: string | null;
}

export interface ExportApp {
  formato: typeof FORMATO_APP;
  versaoFormato: typeof VERSAO_APP;
  geradoEm: string;
  estrategia: EstrategiaApp;
}

const txt = (v: unknown): string | null => (has(v) ? val(v) : null);
const itens = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : has(v) ? val(v).split(/\s*[,;\n]\s*/).filter(Boolean) : [];
const lista = (v: unknown): string | null => {
  const xs = itens(v);
  if (!xs.length) return null;
  return xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`;
};

/** "Fase 1 · Adaptação (4 sem); Fase 2 · …" → fases numeradas. */
export function fasesDe(v: unknown): FaseApp[] {
  const texto = val(v);
  if (!texto) return [];
  const out: FaseApp[] = [];
  for (const m of texto.matchAll(/Fase\s*(\d+)\s*[·:-]?\s*([^(;\n→]+?)\s*(?:\((\d+)\s*sem[^)]*\))?\s*(?=;|→|\n|$|Fase\s*\d)/gi)) {
    out.push({ numero: Number(m[1]), nome: m[2].trim(), semanas: m[3] ? Number(m[3]) : null });
  }
  if (out.length) return out;
  return texto
    .split(/;|→|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s, i) => {
      const sem = /\((\d+)\s*sem/i.exec(s);
      return { numero: i + 1, nome: s.replace(/\s*\(.*?\)\s*/g, "").trim(), semanas: sem ? Number(sem[1]) : null };
    });
}

const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function estrategiaParaApp(state: StrategyState): EstrategiaApp {
  const a = state.anamnese as Record<string, unknown>;
  const x = state.answers as Record<string, unknown>;
  const volume: VolumeApp[] = [];
  for (const r of volumeRows(state)) {
    const f = faixaDe(r);
    if (f) volume.push({ rotulo: r.grupo.trim(), series: f.min, max: f.max > f.min ? f.max : null });
  }
  const diag = studentDiagnosisData(state);
  const restricoes = [txt(a.dores) && `Dores: ${val(a.dores)}`, txt(a.lesoes) && `Lesões: ${val(a.lesoes)}`].filter(Boolean).join(" · ");
  return {
    versao: 1,
    aluno: txt(a.nome),
    dataNascimento: birthDateIso(a.dataNascimento),
    idade: ageFromBirth(a.dataNascimento) ?? inteiro(a.idade),
    sexo: txt(a.sexo),
    email: cleanEmail(a.email),
    whatsapp: whatsappDigits(a.whatsapp),
    titulo: txt(a.tituloPlano),
    data: hojeISO(),
    objetivo: txt(x.objetivo_principal) ?? txt(a.objetivo),
    objetivosSecundarios: lista(x.objetivo_secundario),
    experiencia: txt(a.experiencia),
    diasPorSemana: inteiro(a.diasSemana),
    minutosPorTreino: inteiro(a.tempoSessao),
    prioridades: prioridadeGrupos(state.answers),
    comoPriorizar: itens(x.prioridade_estrategias),
    divisao: txt(x.divisao_qual),
    justificativaDivisao: txt(x.divisao_porque),
    adaptacoes: txt(x.divisao_adaptacoes),
    intensidade: txt(x.intensidade_estrategia),
    volume,
    volumeTotal: volume.length ? volume.reduce((s, v) => s + v.series, 0) : null,
    frequencia: txt(x.volume_frequencia),
    fases: fasesDe(x.periodizacao_fases),
    preparacao: itens(x.mobilidade_o_que),
    preparacaoMotivo: txt(x.mobilidade_porque),
    progressao: itens(x.progressao_como),
    checkinSemanal: itens(x.acompanhamento_info),
    pontosFortes: diag.fortes.map(upperFirst),
    pontosAtencao: diag.atencao.map(upperFirst),
    frase: txt(x.filosofia_frase)?.replace(/^[“"]|[”"]\.?$/g, "") ?? null,
    logicaExercicios: itens(x.exercicios_logica),
    aerobico: val(x.cardio_have) === "Não" ? null : txt(x.cardio_detalhe),
    encerramento: txt(reportClosing(state)),
    restricoes: restricoes || null,
    exerciciosObrigatorios: txt(x.exercicios_obrigatorio),
    exerciciosEvitar: txt(x.exercicios_proibido),
  };
}

export function exportarParaApp(state: StrategyState): ExportApp {
  return { formato: FORMATO_APP, versaoFormato: VERSAO_APP, geradoEm: new Date().toISOString(), estrategia: estrategiaParaApp(state) };
}

/** Nome do arquivo: "fulano-de-tal.montinho.json". */
export function nomeArquivoApp(state: StrategyState): string {
  const base = (val((state.anamnese as Record<string, unknown>).nome) || "estrategia")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${base || "estrategia"}.montinho.json`;
}
