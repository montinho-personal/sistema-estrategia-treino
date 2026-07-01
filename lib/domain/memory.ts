import { TOPICS, ADAPTIVE } from "./config";
import { requiredMissing, questionsForTopic } from "./interview";
import type { StrategyState } from "./schema";
import type { AnswerValue } from "./schema/answers";
import { has, low, val } from "./util";

export interface MemorySection {
  emoji: string;
  title: string;
  editStep?: "anamnese";
  editTopic?: string;
  rows: [string, string][];
}

export type AreaStatusValue = "done" | "progress" | "pending";
export interface AreaStatus {
  id: string;
  n: number;
  name: string;
  status: AreaStatusValue;
}

function inArr(v: AnswerValue | undefined, name: string): string {
  return Array.isArray(v) && v.includes(name) ? "Sim" : "";
}
function anyIn(v: AnswerValue | undefined, names: string[]): string {
  return names.some((n) => inArr(v, n) === "Sim") ? "Sim" : "";
}
function join(...vals: unknown[]): string {
  return vals.map(val).filter(has).join(" · ");
}

/** Estrutura completa da memória, na ordem e nas seções do PRD. */
export function buildMemory(state: StrategyState): MemorySection[] {
  const a = state.anamnese;
  const x = state.answers;
  const tec = x.intensidade_tecnicas;
  const mob = x.mobilidade_o_que;
  const fb = x.acompanhamento_info;

  return [
    { emoji: "👤", title: "Aluno", editStep: "anamnese", rows: [
      ["Nome", val(a.nome)], ["Idade", a.idade ? `${a.idade} anos` : ""], ["Sexo", val(a.sexo)],
      ["Experiência", val(a.experiencia)], ["Objetivo", val(a.objetivo)],
      ["Disponibilidade", a.diasSemana ? `${a.diasSemana} dia(s)/semana` : ""],
      ["Tempo por treino", a.tempoSessao ? `${a.tempoSessao} min` : ""], ["Modalidade", val(a.modalidade)],
    ] },
    { emoji: "🎯", title: "Objetivo", editTopic: "objetivo", rows: [
      ["Objetivo principal", val(x.objetivo_principal)], ["Objetivos secundários", val(x.objetivo_secundario)],
      ["Prioridades musculares", val(x.objetivo_prioridade)], ["Prazo", val(x.objetivo_prazo)],
      ["Motivo", val(x.objetivo_porque)],
    ] },
    { emoji: "🧠", title: "Filosofia", editTopic: "filosofia", rows: [
      ["Frase principal da estratégia", val(x.filosofia_frase)],
    ] },
    { emoji: "🏋", title: "Divisão", editTopic: "divisao", rows: [
      ["Divisão e distribuição", val(x.divisao_qual)], ["Justificativa", val(x.divisao_porque)],
      ["Vantagens", val(x.divisao_vantagens)], ["Adaptações", val(x.divisao_adaptacoes)],
    ] },
    { emoji: "🔥", title: "Intensidade", editTopic: "intensidade", rows: [
      ["Estratégia escolhida", val(x.intensidade_estrategia)], ["Faixa de repetições", val(x.intensidade_reps)],
      ["Falha", inArr(tec, "Falha")], ["RIR", inArr(tec, "RIR")], ["RPE", inArr(tec, "RPE")],
      ["Cadência", inArr(tec, "Cadência")], ["Tempo sob tensão", inArr(tec, "Tempo sob tensão")],
      ["Isometrias", inArr(tec, "Isometria")], ["Técnicas avançadas", anyIn(tec, ["Drop-set", "Rest-pause", "Cluster"])],
      ["Volume semanal", val(x.adapt_hipertrofia)], ["Motivo da escolha", val(x.intensidade_porque)],
    ] },
    { emoji: "📈", title: "Periodização", editTopic: "periodizacao", rows: [
      ["Fases, objetivos e duração", val(x.periodizacao_fases)], ["Justificativa", val(x.periodizacao_porque)],
    ] },
    { emoji: "🦵", title: "Exercícios", editTopic: "exercicios", rows: [
      ["Lógica de seleção", val(x.exercicios_logica)], ["Prioridades", val(x.exercicios_prioridade)],
      ["Obrigatórios", val(x.exercicios_obrigatorio)], ["Proibidos", val(x.exercicios_proibido)],
      ["Adaptações / segurança", join(x.adapt_dor, x.adapt_reab)], ["Motivo", val(x.exercicios_porque)],
    ] },
    { emoji: "🤸", title: "Mobilidade", editTopic: "mobilidade", rows: [
      ["Aquecimento", inArr(mob, "Aquecimento")], ["Mobilidade", inArr(mob, "Mobilidade")],
      ["Alongamentos", inArr(mob, "Alongamentos")], ["Ativação", inArr(mob, "Ativação")],
      ["Core", inArr(mob, "Core")], ["Estabilidade", inArr(mob, "Estabilidade")],
      ["Segurança (idoso)", val(x.adapt_idoso)], ["Motivo", val(x.mobilidade_porque)],
    ] },
    { emoji: "🏃", title: "Cardio", editTopic: "cardio", rows: [
      ["Haverá cardio", val(x.cardio_have)], ["Objetivo, frequência e intensidade", val(x.cardio_detalhe)],
      ["Gasto energético", val(x.adapt_emagrecimento)], ["Motivo", val(x.cardio_porque)],
    ] },
    { emoji: "📊", title: "Progressão", editTopic: "progressao", rows: [
      ["Como progredir (carga, volume, critérios, técnicas futuras)", val(x.progressao_como)],
      ["Justificativa", val(x.progressao_porque)],
    ] },
    { emoji: "📲", title: "Feedback", editTopic: "acompanhamento", rows: [
      ["Peso", inArr(fb, "Peso")], ["Fotos", inArr(fb, "Fotos")], ["Sono", inArr(fb, "Sono")],
      ["Dor", inArr(fb, "Dor")], ["Cargas", inArr(fb, "Cargas")], ["Recuperação", inArr(fb, "Recuperação")],
      ["Fadiga", inArr(fb, "Fadiga")], ["Medidas", inArr(fb, "Medidas")], ["Execução", inArr(fb, "Execução")],
      ["Por que acompanhar", val(x.acompanhamento_porque)], ["Mensagem final", val(x.mensagem_final)],
    ] },
  ];
}

/** Status de cada área para o painel "Estratégia em construção". */
export function areaStatus(state: StrategyState, currentTopicId?: string): AreaStatus[] {
  const missByTopic = new Map<string, number>();
  for (const m of requiredMissing(state)) {
    missByTopic.set(m.topic.id, (missByTopic.get(m.topic.id) ?? 0) + 1);
  }
  return TOPICS.map((t) => {
    const done = !missByTopic.get(t.id);
    const anyAnswered = questionsForTopic(t, state).some((q) => has(state.answers[q.id]));
    const status: AreaStatusValue = done
      ? "done"
      : t.id === currentTopicId || anyAnswered
        ? "progress"
        : "pending";
    return { id: t.id, n: t.n, name: t.name, status };
  });
}

/** Sugestões oportunas (nunca obrigatórias). */
export function suggestions(state: StrategyState): string[] {
  const a = state.anamnese;
  const x = state.answers;
  const out: string[] = [];

  if (!has(x.progressao_como)) out.push("Ainda não definimos a estratégia de progressão para este aluno.");
  if ((has(a.dores) || has(a.lesoes)) && !has(x.adapt_dor) && !has(x.exercicios_proibido))
    out.push("Ainda não existe nenhuma adaptação para a limitação relatada na anamnese.");
  if (!has(x.periodizacao_fases)) out.push("Que tal estruturar as fases da periodização deste ciclo?");
  if (low(a.objetivo) === "emagrecimento" && x.cardio_have !== "Sim" && !has(x.cardio_detalhe))
    out.push("O foco é emagrecimento — vale definir a estratégia de cardio e gasto energético.");

  return out.slice(0, 3);
}

/** Perfis adaptativos ativos (usado no diagnóstico para explicar a entrevista). */
export function activeAdaptations(state: StrategyState) {
  return ADAPTIVE.filter((aq) => aq.when(state.anamnese));
}
