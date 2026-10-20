import { ADAPTIVE, TOPICS } from "./config";
import { ageFromBirth, birthDateIso, cleanEmail, whatsappDigits } from "./contact";
import type { StrategyState } from "./schema";
import { has, toInt, val } from "./util";

/**
 * Pacote da estratégia para o aplicativo de treino do Montinho: dados do
 * aluno (com contato) + as decisões do plano, num JSON estável e documentado.
 * Formato "montinho-estrategia" v1 — o app lê este arquivo para montar o treino.
 */
export const APP_EXPORT_FORMAT = "montinho-estrategia";
export const APP_EXPORT_VERSION = 1;

const lista = (v: unknown): string[] =>
  (Array.isArray(v) ? v : has(v) ? [v] : []).map((x) => val(x)).filter(Boolean);
const texto = (v: unknown): string | null => (has(v) ? val(v) : null);

export function appExport(state: StrategyState, geradoEm = new Date()) {
  const a = state.anamnese;
  const x = state.answers;
  const idade = ageFromBirth(a.dataNascimento) ?? (toInt(a.idade) || null);

  const decisoes: { id: string; tema: string; pergunta: string; resposta: string | string[] }[] = [];
  for (const t of TOPICS) {
    for (const q of [...t.questions, ...ADAPTIVE.filter((ad) => ad.topic === t.id)]) {
      const v = x[q.id];
      if (!has(v)) continue;
      decisoes.push({ id: q.id, tema: t.name, pergunta: q.label ?? q.prompt, resposta: Array.isArray(v) ? v : val(v) });
    }
  }

  return {
    formato: APP_EXPORT_FORMAT,
    versao: APP_EXPORT_VERSION,
    geradoEm: geradoEm.toISOString(),
    aluno: {
      nome: texto(a.nome),
      dataNascimento: birthDateIso(a.dataNascimento),
      idade,
      sexo: texto(a.sexo),
      email: cleanEmail(a.email),
      whatsapp: whatsappDigits(a.whatsapp),
      modalidade: texto(a.modalidade),
    },
    plano: {
      titulo: texto(a.tituloPlano),
      objetivo: texto(x.objetivo_principal) ?? texto(a.objetivo),
      experiencia: texto(a.experiencia),
      diasPorSemana: toInt(a.diasSemana) || null,
      minutosPorSessao: toInt(a.tempoSessao) || null,
      prioridadeMuscular: lista(x.objetivo_prioridade),
      estrategiasDePrioridade: lista(x.prioridade_estrategias),
      divisao: texto(x.divisao_qual),
      frequenciaPorGrupo: texto(x.volume_frequencia),
      volumeSemanal: state.volume
        .filter((r) => has(r.grupo) && toInt(r.series) > 0)
        .map((r) => ({ grupo: val(r.grupo), series: toInt(r.series) })),
      intensidade: lista(x.intensidade_estrategia),
      faixaDeRepeticoes: texto(x.intensidade_reps),
      periodizacao: texto(x.periodizacao_fases),
      aquecimento: lista(x.mobilidade_o_que),
      selecaoDeExercicios: lista(x.exercicios_logica),
      exerciciosChave: texto(x.exercicios_obrigatorio),
      exerciciosAEvitar: texto(x.exercicios_proibido),
      cardio: x.cardio_have === "Não" ? [] : lista(x.cardio_detalhe),
      progressao: lista(x.progressao_como),
    },
    cuidados: {
      dores: texto(a.dores),
      lesoes: texto(a.lesoes),
      limitacoes: texto(a.limitacoes),
    },
    decisoes,
  };
}

export type AppExport = ReturnType<typeof appExport>;
