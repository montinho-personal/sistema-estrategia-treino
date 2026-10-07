import { TOPICS, ANAMNESE_RULES, SEM_PRIORIDADE, PRIORIDADE_ESTRATEGIAS } from "./config";
import { FREQUENCIA_PRIORITARIOS } from "./config/option-details";
import { requiredMissing } from "./interview";
import { personalLead } from "./voice";
import { knowledgeForTopic, explainKnowledge, kbById } from "./knowledge";
import type { StrategyState, VolumeRow } from "./schema";
import { has, val, low, firstName, lowerFirst, upperFirst, toInt } from "./util";

export interface ReportSection {
  id: string;
  title: string;
  body: string;
}

function sentence(s: unknown): string {
  const c = val(s);
  if (!c) return "";
  return /[.!?:]$/.test(c) ? c : `${c}.`;
}
function joinP(parts: string[]): string {
  return parts.filter(has).join("\n\n");
}

/** Itens de uma resposta (lista de opções ou texto único). */
function items(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return has(v) ? [val(v)] : [];
}
/** "a, b e c" — itens em minúscula inicial, para caber numa frase. */
function humanList(list: string[]): string {
  const xs = list.map((x) => lowerFirst(x));
  return xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`;
}
/** Lista de verificação ("✓ item") — vira lista no PDF e no WhatsApp. */
function checklist(list: string[]): string {
  return list.map((x) => `✓ ${x}`).join("\n");
}
function kb(state: StrategyState, topicId: string, max = 2): string[] {
  return knowledgeForTopic(state, topicId)
    .slice(0, max)
    .map((e) => explainKnowledge(e, state).text);
}

/* ---- Diagnóstico técnico (para o treinador) ---- */
export interface Diagnosis {
  perfil: [string, string][];
  atencao: string[];
  oportunidades: string[];
}

export function diagnosis(state: StrategyState): Diagnosis {
  const a = state.anamnese;
  const out: Diagnosis = { perfil: [], atencao: [], oportunidades: [] };

  if (has(a.objetivo)) out.perfil.push(["Objetivo", val(a.objetivo)]);
  if (has(a.experiencia)) out.perfil.push(["Experiência", val(a.experiencia)]);
  if (has(a.idade)) out.perfil.push(["Idade", `${a.idade} anos`]);
  if (has(a.modalidade)) out.perfil.push(["Modalidade", val(a.modalidade)]);
  if (has(a.diasSemana)) {
    let t = `${a.diasSemana} dia(s)/semana`;
    if (has(a.tempoSessao)) t += ` · ${a.tempoSessao} min/sessão`;
    out.perfil.push(["Disponibilidade", t]);
  }
  if (has(a.composicao)) out.perfil.push(["Composição", val(a.composicao)]);

  for (const rule of ANAMNESE_RULES) {
    const m = rule(a);
    if (m) out.atencao.push(m);
  }

  if (["alta", "moderada"].includes(low(a.motivacao)))
    out.oportunidades.push("Motivação favorável — bom momento para construir constância.");
  const dias = toInt(a.diasSemana);
  if (dias && dias >= 4)
    out.oportunidades.push("Boa disponibilidade semanal, o que amplia as opções de organização do treino.");
  if (["bom", "ótimo", "otimo"].includes(low(a.sono)))
    out.oportunidades.push("Sono em bom nível favorece a recuperação e a progressão.");
  if (["boa", "acompanhamento com nutricionista"].includes(low(a.alimentacao)))
    out.oportunidades.push("Alimentação alinhada tende a acelerar os resultados do treino.");

  return out;
}

/* ---- Diagnóstico para o aluno (resume, nunca assusta, mostra solução) ---- */
export interface StudentDiagnosis {
  fortes: string[];
  atencao: string[];
}

export function studentDiagnosisData(state: StrategyState): StudentDiagnosis {
  const a = state.anamnese;
  const fortes: string[] = [];
  const atencao: string[] = [];
  const sono = low(a.sono), estresse = low(a.estresse);
  const motiv = low(a.motivacao), alim = low(a.alimentacao);
  const dias = toInt(a.diasSemana), idade = toInt(a.idade);

  if (["bom", "ótimo", "otimo"].includes(sono)) fortes.push("seu sono está em dia, o que ajuda muito na recuperação");
  if (["alta", "moderada"].includes(motiv)) fortes.push("você chega motivado, e isso conta muito no resultado");
  if (dias && dias >= 4) fortes.push("você tem uma boa disponibilidade na semana");
  if (["boa", "acompanhamento com nutricionista"].includes(alim)) fortes.push("sua alimentação já está alinhada com o objetivo");
  if (has(a.experiencia) && low(a.experiencia) !== "iniciante") fortes.push("você já tem experiência de treino, o que acelera a evolução");

  if (has(a.dores) || has(a.lesoes)) atencao.push("você comentou um incômodo, então vamos caprichar no aquecimento, na técnica e na escolha dos exercícios para você treinar com segurança");
  if (dias && dias <= 3) atencao.push("como o tempo na semana é mais curto, organizei o treino para render bastante em cada sessão");
  if (sono === "ruim" || estresse === "alto") atencao.push("nos dias de sono ou rotina mais puxados, vamos ajustar o esforço para respeitar sua recuperação");
  if (idade && idade >= 60) atencao.push("vamos priorizar a segurança das articulações e uma evolução gradual e sólida");

  return { fortes, atencao };
}

export function studentDiagnosis(state: StrategyState): string {
  const { fortes, atencao } = studentDiagnosisData(state);
  const body: string[] = [];
  if (fortes.length) {
    body.push("Você já tem pontos muito a seu favor:");
    body.push(fortes.map((f) => `✓ ${upperFirst(f)}`).join("\n"));
  }
  if (atencao.length) {
    body.push("E há alguns detalhes que vamos cuidar juntos:");
    body.push(atencao.map((t) => `• ${upperFirst(t)}`).join("\n"));
  }
  body.push("No geral, seu potencial de evolução é grande. Com consistência e o plano certo, os resultados vêm.");
  return body.join("\n\n");
}

function comoAjuda(objetivo: unknown): string {
  const o = low(objetivo);
  if (o === "hipertrofia") return "A musculação é o principal caminho para construir massa muscular de forma consistente e visível.";
  if (o === "recomposição corporal") return "A musculação é o que permite ganhar músculo enquanto você perde gordura — ela é o coração da recomposição corporal.";
  if (o === "emagrecimento") return "A musculação acelera seu metabolismo e preserva seus músculos enquanto você perde gordura — é o que garante um emagrecimento com qualidade.";
  if (o === "performance" || o === "competição") return "A musculação constrói a base de força e resistência que a sua modalidade exige.";
  if (o === "saúde e qualidade de vida") return "A musculação melhora sua disposição, sua postura e sua saúde no dia a dia.";
  if (o === "reabilitação") return "A musculação, bem dosada, fortalece a região com segurança e devolve confiança aos seus movimentos.";
  return "A musculação é a base para você alcançar esse objetivo com consistência.";
}

const TECH_MAP: Record<string, string> = {
  Falha: "falha", RIR: "rir", RPE: "rpe", Cadência: "cadencia",
  "Tempo sob tensão": "tempo_sob_tensao", Isometria: "isometria",
  "Drop-set": "drop_set", "Rest-pause": "rest_pause", Cluster: "cluster",
};

/** Frequência por grupo em linguagem de aluno. */
function frequenciaFrase(freq: string): string {
  if (/^\dx por semana$/.test(freq)) return `Cada grupo muscular será treinado ${freq}.`;
  if (freq === FREQUENCIA_PRIORITARIOS) return "Os grupos prioritários serão treinados 2 a 3 vezes por semana, e os demais, 1 a 2 vezes.";
  return sentence(`Frequência de treino por grupo: ${freq}`);
}

/* =============================== seções =============================== */
function objetivoSection(state: StrategyState): ReportSection {
  const A = state.answers, a = state.anamnese;
  const p: string[] = [];
  if (has(A.objetivo_principal)) p.push(sentence(`${personalLead("objetivo")} ${val(A.objetivo_principal)}`));
  if (has(A.objetivo_secundario)) p.push(`Como objetivo secundário, também vamos trabalhar ${sentence(humanList(items(A.objetivo_secundario)))}`);
  const prioridade = items(A.objetivo_prioridade);
  const grupos = prioridade.filter((g) => g !== SEM_PRIORIDADE);
  if (grupos.length) {
    p.push(`Com atenção especial para ${sentence(humanList(grupos))}`);
    const taticas = items(A.prioridade_estrategias);
    if (taticas.length) {
      p.push("Para dar prioridade a esses grupos, vou usar estas estratégias:");
      p.push(checklist(taticas.map((t) => (PRIORIDADE_ESTRATEGIAS[t] ? `${t} — ${PRIORIDADE_ESTRATEGIAS[t]}` : t))));
    }
  } else if (prioridade.includes(SEM_PRIORIDADE)) {
    p.push("Neste ciclo, vamos desenvolver todos os grupos musculares em equilíbrio, sem uma prioridade específica.");
  }
  if (has(A.objetivo_prazo)) p.push(`A previsão para esta etapa é de ${sentence(A.objetivo_prazo)}`);
  if (has(A.objetivo_porque)) p.push(`Escolhi esse foco porque ${sentence(lowerFirst(A.objetivo_porque))}`);
  p.push(comoAjuda(a.objetivo));
  return { id: "objetivo", title: "Seu objetivo", body: joinP(p) };
}

function diagnosticoSection(state: StrategyState): ReportSection {
  return { id: "diagnostico", title: "Seu diagnóstico", body: studentDiagnosis(state) };
}

function estrategiaSection(state: StrategyState): ReportSection {
  const A = state.answers;
  const p: string[] = [];
  if (has(A.filosofia_frase)) p.push(sentence(`${personalLead("filosofia")} “${val(A.filosofia_frase)}”`));
  p.push("Cada escolha do seu treino tem um motivo — nada aqui é por acaso. Abaixo eu te explico a lógica de cada parte.");
  if (Array.isArray(A.exercicios_logica) && A.exercicios_logica.length) {
    p.push(personalLead("exercicios") ?? "Na seleção dos seus exercícios, segui esta lógica:");
    p.push(checklist(items(A.exercicios_logica)));
    if (has(A.exercicios_obrigatorio)) p.push(sentence(`Os exercícios-chave do seu plano são: ${val(A.exercicios_obrigatorio)}`));
    if (has(A.exercicios_proibido)) p.push(sentence(`E vamos evitar ${val(A.exercicios_proibido)}`));
  } else {
    const ex: string[] = [];
    if (has(A.exercicios_logica)) ex.push(`Na seleção dos exercícios, ${lowerFirst(val(A.exercicios_logica))}`);
    if (has(A.exercicios_prioridade)) ex.push(`com prioridade para ${val(A.exercicios_prioridade)}`);
    if (has(A.exercicios_proibido)) ex.push(`e evitando ${val(A.exercicios_proibido)}`);
    if (ex.length) p.push(sentence(ex.join(", ")));
  }
  if (has(A.adapt_dor)) p.push(sentence(A.adapt_dor));
  if (has(A.adapt_reab)) p.push(sentence(A.adapt_reab));
  if (val(A.cardio_have) === "Sim" || has(A.cardio_detalhe)) {
    const det = Array.isArray(A.cardio_detalhe) ? humanList(items(A.cardio_detalhe)) : lowerFirst(val(A.cardio_detalhe));
    const c = `Sobre o trabalho aeróbico, ${det || "ele entra de forma estratégica no seu plano"}`;
    p.push(sentence(c));
    if (has(A.adapt_emagrecimento)) p.push(sentence(A.adapt_emagrecimento));
  }
  return { id: "estrategia", title: "Nossa estratégia", body: joinP(p) };
}

function divisaoSection(state: StrategyState): ReportSection {
  const A = state.answers, a = state.anamnese;
  const p: string[] = [];
  if (has(A.divisao_qual)) p.push(sentence(`${personalLead("divisao")} ${val(A.divisao_qual)}`));
  if (has(A.divisao_porque)) p.push(`Escolhi essa divisão porque ${sentence(lowerFirst(A.divisao_porque))}`);
  if (has(A.divisao_vantagens)) p.push(`Na prática, ela te dá ${sentence(lowerFirst(A.divisao_vantagens))}`);
  if (has(A.divisao_adaptacoes)) p.push(sentence(A.divisao_adaptacoes));
  if (has(a.objetivo)) p.push(`Isso conversa direto com o seu objetivo de ${low(a.objetivo)}.`);
  const freq = val(A.volume_frequencia);
  if (freq) p.push(frequenciaFrase(freq));
  const vprog = items(A.volume_progressao);
  if (vprog.length) {
    p.push("Ao longo do ciclo, o volume de séries vai evoluir assim:");
    p.push(checklist(vprog));
  }
  if (has(A.volume_porque)) p.push(`Defini esse volume porque ${sentence(lowerFirst(A.volume_porque))}`);
  for (const t of kb(state, "divisao", 1)) p.push(t);
  return { id: "divisao", title: "Como seus treinos estão divididos", body: joinP(p) };
}

function intensidadeSection(state: StrategyState): ReportSection {
  const A = state.answers;
  const p: string[] = [];
  if (has(A.intensidade_estrategia)) p.push(sentence(`${personalLead("intensidade")} ${val(A.intensidade_estrategia)}`));
  if (has(A.intensidade_porque)) p.push(`Optei por isso porque ${sentence(lowerFirst(A.intensidade_porque))}`);
  if (has(A.intensidade_reps)) p.push(`Sua faixa de repetições será ${sentence(A.intensidade_reps)}`);
  const tecnicas = Array.isArray(A.intensidade_tecnicas) ? A.intensidade_tecnicas : [];
  for (const t of tecnicas.slice(0, 5)) {
    const e = kbById(TECH_MAP[t]);
    if (e) p.push(explainKnowledge(e, state).text);
  }
  for (const t of kb(state, "intensidade", 1)) p.push(t);
  return { id: "intensidade", title: "A intensidade dos seus treinos", body: joinP(p) };
}

function periodizacaoSection(state: StrategyState): ReportSection {
  const A = state.answers;
  const p: string[] = [];
  if (has(A.periodizacao_fases)) p.push(sentence(`${personalLead("periodizacao")} ${val(A.periodizacao_fases)}`));
  if (has(A.periodizacao_porque)) p.push(`Decidi evoluir assim porque ${sentence(lowerFirst(A.periodizacao_porque))}`);
  p.push("Na prática, isso significa que seu treino não fica parado no tempo: ele evolui junto com você, fase após fase.");
  return { id: "periodizacao", title: "Como você vai evoluir ao longo do tempo", body: joinP(p) };
}

function mobilidadeSection(state: StrategyState): ReportSection {
  const A = state.answers, a = state.anamnese;
  const p: string[] = [];
  const itens = Array.isArray(A.mobilidade_o_que) ? A.mobilidade_o_que : [];
  if (itens.length) p.push(sentence(`${personalLead("mobilidade")} ${itens.join(", ")}`));
  if (has(A.mobilidade_porque)) p.push(`Isso é importante porque ${sentence(lowerFirst(A.mobilidade_porque))}`);
  if (has(A.adapt_idoso)) p.push(sentence(A.adapt_idoso));
  if (has(a.dores) || has(a.lesoes)) p.push("No seu caso, essa preparação é ainda mais importante para proteger a região que você comentou e treinar sem dor.");
  if (p.length) p.push("São poucos minutos antes do treino que fazem toda a diferença na qualidade e na segurança da sua sessão.");
  return { id: "mobilidade", title: "Aquecimento e preparação", body: joinP(p) };
}

function progressaoSection(state: StrategyState): ReportSection {
  const A = state.answers;
  const p: string[] = [];
  if (Array.isArray(A.progressao_como) && A.progressao_como.length) {
    p.push(personalLead("progressao") ?? "A progressão vai seguir estas regras:");
    p.push(checklist(items(A.progressao_como)));
  } else if (has(A.progressao_como)) {
    p.push(sentence(`${personalLead("progressao")} ${val(A.progressao_como)}`));
  }
  if (has(A.progressao_porque)) p.push(`Pensei assim porque ${sentence(lowerFirst(A.progressao_porque))}`);
  p.push("O combinado é simples: a gente só avança quando você domina a etapa atual. Assim sua evolução é segura e constante, e você sempre sabe qual é o próximo passo.");
  return { id: "progressao", title: "As regras da sua progressão", body: joinP(p) };
}

function papelSection(state: StrategyState): ReportSection {
  const A = state.answers;
  const itens = Array.isArray(A.acompanhamento_info) ? A.acompanhamento_info : [];
  const p: string[] = [];
  p.push("Os resultados vêm de um trabalho em equipe. A minha parte é montar e ajustar a sua estratégia; a sua é treinar com constância e me manter informado.");
  if (itens.length) {
    p.push("Toda semana, o que eu preciso que você me envie:");
    p.push(itens.map((i) => `✓ ${i}`).join("\n"));
  }
  if (has(A.acompanhamento_porque)) p.push(`Peço essas informações porque ${sentence(lowerFirst(A.acompanhamento_porque))}`);
  p.push("Com esses dados em mãos, consigo ajustar seu treino no tempo certo e manter sua evolução sempre no rumo.");
  return { id: "papel", title: "Seu papel no processo", body: joinP(p) };
}

/* ---- Documento completo (ordem fixa) ---- */
export function reportDocument(state: StrategyState): ReportSection[] {
  return [
    objetivoSection(state), diagnosticoSection(state), estrategiaSection(state),
    divisaoSection(state), intensidadeSection(state), periodizacaoSection(state),
    mobilidadeSection(state), progressaoSection(state), papelSection(state),
  ];
}

export function reportSections(state: StrategyState): ReportSection[] {
  return reportDocument(state)
    .map((s) => {
      const ov = state.overrides[s.id];
      return { id: s.id, title: s.title, body: ov != null ? ov : s.body };
    })
    .filter((s) => has(s.body));
}

/* ---- Abertura ---- */
export function reportIntro(state: StrategyState): string {
  const a = state.anamnese, A = state.answers;
  const nome = firstName(a.nome);
  const obj = has(a.objetivo) ? low(a.objetivo) : "seus objetivos";
  let base =
    `Olá, ${nome}! Preparei esta estratégia especialmente para você, a partir de ` +
    `tudo o que conversamos. Aqui eu não quero só te passar um treino — quero te explicar o ` +
    `porquê de cada escolha, para você treinar com clareza e confiança rumo a ${obj}.`;
  if (has(A.filosofia_frase)) base += `\n\nEm uma frase, é isto: “${val(A.filosofia_frase)}”.`;
  return base;
}

/* ---- Mensagem final: exclusiva, adaptada ao perfil ---- */
export function reportClosing(state: StrategyState): string {
  const A = state.answers, a = state.anamnese;
  const nome = firstName(a.nome);
  if (has(A.mensagem_final)) return val(A.mensagem_final);
  const o = low(a.objetivo);
  const idade = toInt(a.idade);
  const exp = low(a.experiencia);
  if (exp === "atleta" || o === "performance" || o === "competição")
    return "Cada detalhe deste plano foi pensado para elevar o seu rendimento. Confie no processo, execute com qualidade, e vamos buscar juntos a sua melhor performance.";
  if (o === "recomposição corporal")
    return "Recompor o corpo é construir músculo e perder gordura ao mesmo tempo — e isso pede constância, não pressa. A balança pode mudar devagar, mas o espelho e as medidas vão mostrar a evolução. Confie no processo que eu ajusto tudo com você no caminho.";
  if (o === "emagrecimento")
    return "Emagrecer com saúde é sobre consistência, não pressa. Não precisa ser perfeito — precisa ser constante. Faça a sua parte nos treinos e no dia a dia, que os resultados vão aparecer, e eu estarei com você em cada etapa.";
  if (idade && idade >= 60)
    return "Mais do que estética, aqui a gente treina pela sua saúde, sua autonomia e sua qualidade de vida. Vamos com calma e firmeza: cada treino é um investimento no seu bem-estar por muitos anos.";
  if (o === "hipertrofia")
    return "Construir músculo é um trabalho de paciência e consistência. Cada treino bem feito é um tijolo nessa construção. Confie no plano, capriche na execução, e o seu físico vai responder.";
  if (o === "reabilitação")
    return "Nosso foco agora é te devolver movimento com segurança e confiança. Sem pressa e sem dor: cada passo é uma vitória. Estarei aqui te acompanhando de perto em toda a recuperação.";
  return `Este plano foi feito sob medida para você, ${nome}. Faça a sua parte com constância que eu faço a minha, ajustando tudo ao longo do caminho. Vamos juntos nessa.`;
}

/* ---- Progresso / completude ---- */
export interface Completion {
  done: number;
  total: number;
  topics: number;
  pct: number;
  complete: boolean;
}

export function completion(state: StrategyState): Completion {
  const missing = requiredMissing(state).length;
  let reqPerTopic = 0;
  for (const t of TOPICS) reqPerTopic += t.mainQ ? 1 : 0;
  const done = reqPerTopic - missing;
  return {
    done,
    total: reqPerTopic,
    topics: TOPICS.length,
    pct: reqPerTopic ? Math.round((done / reqPerTopic) * 100) : 0,
    complete: missing === 0,
  };
}

/* ---- Volume semanal de séries ---- */
/** Linhas de volume preenchidas (grupo + séries informados). */
export function volumeRows(state: StrategyState): VolumeRow[] {
  return state.volume.filter((r) => has(r.grupo) && has(r.series));
}

/** Total de séries por semana (soma dos valores numéricos), ou null se não houver. */
export function volumeTotal(state: StrategyState): number | null {
  let sum = 0;
  let any = false;
  for (const r of volumeRows(state)) {
    const n = toInt(r.series);
    if (n != null) {
      sum += n;
      any = true;
    }
  }
  return any ? sum : null;
}

/** Lê uma tabela de volume colada como texto (grupo + séries, ignora %/totais). */
export function parseVolumeText(text: string): VolumeRow[] {
  const rows: VolumeRow[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^[─\-—_=|\s]+$/.test(line)) continue; // linhas separadoras
    if (/grupo\s*muscular|s[ée]ries?\s*tota|%\s*do\s*total|^total\b/i.test(line)) continue; // cabeçalhos/totais
    const cells = line.split(/\s*\|\s*|\t+|\s{2,}/).map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const grupo = cells[0];
    let series = "";
    for (let i = 1; i < cells.length; i++) {
      if (/%/.test(cells[i])) continue; // ignora percentuais
      const m = cells[i].match(/\d+/);
      if (m) { series = m[0]; break; }
    }
    if (grupo && series) rows.push({ grupo, series });
  }
  return rows;
}

/** Mescla linhas importadas nas existentes (por grupo; atualiza séries se já existe). */
export function mergeVolume(existing: VolumeRow[], incoming: VolumeRow[]): VolumeRow[] {
  const out = existing.map((r) => ({ ...r }));
  for (const inc of incoming) {
    const key = inc.grupo.trim().toLowerCase();
    const idx = out.findIndex((r) => r.grupo.trim().toLowerCase() === key);
    if (idx >= 0) out[idx] = { ...out[idx], series: inc.series };
    else out.push({ grupo: inc.grupo, series: inc.series });
  }
  return out;
}

export interface VolumeLine {
  grupo: string;
  series: string;
  /** Participação no total de séries (%), ou null se não calculável. */
  pct: number | null;
}

/** Linhas de volume com o percentual de cada grupo no total semanal. */
export function volumeLines(state: StrategyState): VolumeLine[] {
  const total = volumeTotal(state);
  return volumeRows(state).map((r) => {
    const n = toInt(r.series);
    const pct = total && n != null ? Math.round((n / total) * 100) : null;
    return { grupo: r.grupo, series: r.series, pct };
  });
}

/* ---- Formatação de texto rico (parágrafos, subtítulos, listas) ---- */
export type RichBlock =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "list"; items: string[] };

/**
 * Divide o corpo de uma seção em blocos legíveis. Cada linha vira um parágrafo
 * (independente de a quebra ser simples ou dupla); linhas com ✓/•/- viram lista;
 * linhas totalmente em **negrito** (ou com #) viram subtítulos.
 */
export function parseRichBlocks(body: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  let list: string[] | null = null;
  const flush = () => {
    if (list) {
      blocks.push({ type: "list", items: list });
      list = null;
    }
  };
  for (const raw of (body ?? "").split(/\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^[✓•\-]\s+/.test(line)) {
      (list ??= []).push(line.replace(/^[✓•\-]\s+/, ""));
      continue;
    }
    flush();
    const h = line.match(/^\*\*(.+?)\*\*[:：]?$/) ?? line.match(/^#{1,6}\s+(.+?)[:：]?$/);
    if (h) {
      blocks.push({ type: "heading", text: h[1].trim() });
      continue;
    }
    blocks.push({ type: "para", text: line });
  }
  flush();
  return blocks;
}

export interface InlineSegment {
  bold: boolean;
  text: string;
}

/** Quebra um texto em segmentos, marcando trechos em **negrito**. */
export function inlineSegments(text: string): InlineSegment[] {
  const parts: InlineSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ bold: false, text: text.slice(last, m.index) });
    parts.push({ bold: true, text: m[1] });
    last = re.lastIndex;
  }
  if (last < text.length) parts.push({ bold: false, text: text.slice(last) });
  return parts.length ? parts : [{ bold: false, text }];
}

/** Converte **negrito** (markdown) para *negrito* (formato do WhatsApp). */
function toWhatsappText(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "*$1*");
}

/* ---- Versão WhatsApp (títulos + emojis discretos) ---- */
const WA_EMOJI: Record<string, string> = {
  objetivo: "🎯", diagnostico: "🩺", estrategia: "🧠", divisao: "🗓️",
  intensidade: "🔥", periodizacao: "📈", mobilidade: "🤸", progressao: "📊", papel: "✅",
};

export function reportWhatsapp(state: StrategyState): string {
  const titulo = val(state.anamnese.tituloPlano);
  const header = titulo ? `📋 *${titulo}*` : "*Sua estratégia de treino* 💪";
  const lines: string[] = [header, "", toWhatsappText(reportIntro(state))];
  for (const s of reportSections(state)) {
    lines.push("");
    lines.push(`*${WA_EMOJI[s.id] ? `${WA_EMOJI[s.id]} ` : ""}${s.title}*`);
    lines.push(toWhatsappText(s.body));
  }
  const vlines = volumeLines(state);
  if (vlines.length > 0) {
    lines.push("", "*📊 Volume semanal de séries*");
    for (const r of vlines) {
      lines.push(`• ${r.grupo}: ${r.series}${r.pct != null ? ` (${r.pct}%)` : ""}`);
    }
    const tot = volumeTotal(state);
    if (tot != null) lines.push(`_Total: ${tot} séries/semana_`);
  }
  lines.push("", "*Mensagem final*", toWhatsappText(reportClosing(state)), "", "_Vamos juntos! — Montinho Personal Trainer_");
  return lines.join("\n");
}
