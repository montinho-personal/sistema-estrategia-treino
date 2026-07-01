import { TOPICS, ANAMNESE_RULES } from "./config";
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

/* =============================== seções =============================== */
function objetivoSection(state: StrategyState): ReportSection {
  const A = state.answers, a = state.anamnese;
  const p: string[] = [];
  if (has(A.objetivo_principal)) p.push(sentence(`${personalLead("objetivo")} ${val(A.objetivo_principal)}`));
  if (has(A.objetivo_secundario)) p.push(`Como objetivo secundário, também vamos trabalhar ${sentence(A.objetivo_secundario)}`);
  if (has(A.objetivo_prioridade)) p.push(`Com atenção especial para ${sentence(A.objetivo_prioridade)}`);
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
  const ex: string[] = [];
  if (has(A.exercicios_logica)) ex.push(`Na seleção dos exercícios, ${lowerFirst(val(A.exercicios_logica))}`);
  if (has(A.exercicios_prioridade)) ex.push(`com prioridade para ${val(A.exercicios_prioridade)}`);
  if (has(A.exercicios_proibido)) ex.push(`e evitando ${val(A.exercicios_proibido)}`);
  if (ex.length) p.push(sentence(ex.join(", ")));
  if (has(A.adapt_dor)) p.push(sentence(A.adapt_dor));
  if (has(A.adapt_reab)) p.push(sentence(A.adapt_reab));
  if (val(A.cardio_have) === "Sim" || has(A.cardio_detalhe)) {
    const c = `Sobre o trabalho aeróbico, ${has(A.cardio_detalhe) ? lowerFirst(val(A.cardio_detalhe)) : "ele entra de forma estratégica no seu plano"}`;
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
  if (has(A.progressao_como)) p.push(sentence(`${personalLead("progressao")} ${val(A.progressao_como)}`));
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
  for (const t of TOPICS) reqPerTopic += (t.mainQ ? 1 : 0) + (t.whyQ ? 1 : 0);
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

/* ---- Versão WhatsApp (títulos + emojis discretos) ---- */
const WA_EMOJI: Record<string, string> = {
  objetivo: "🎯", diagnostico: "🩺", estrategia: "🧠", divisao: "🗓️",
  intensidade: "🔥", periodizacao: "📈", mobilidade: "🤸", progressao: "📊", papel: "✅",
};

export function reportWhatsapp(state: StrategyState): string {
  const lines: string[] = ["*Sua estratégia de treino* 💪", "", reportIntro(state).replace(/\n{2,}/g, "\n")];
  for (const s of reportSections(state)) {
    lines.push("");
    lines.push(`*${WA_EMOJI[s.id] ? `${WA_EMOJI[s.id]} ` : ""}${s.title}*`);
    lines.push(s.body.replace(/\n{2,}/g, "\n"));
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
  lines.push("", "*Mensagem final*", reportClosing(state), "", "_Vamos juntos! — Montinho Personal Trainer_");
  return lines.join("\n");
}
