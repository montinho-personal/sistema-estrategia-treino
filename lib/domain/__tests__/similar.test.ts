import { describe, it, expect } from "vitest";

import { similarStrategies, answersFromBase, similarity } from "../similar";
import type { StrategyRecord } from "../insights";

const decisoes = {
  objetivo_principal: "Hipertrofia",
  divisao_qual: "Lower / Upper / Lower / Full Body",
  volume_frequencia: "2x por semana",
  intensidade_estrategia: ["Pirâmide crescente", "Bi-set"],
  periodizacao_fases: "Fase 1 · Adaptação (4 sem); Fase 2 · Intensificação (4 sem); Fase 3 · Consolidação (4 sem)",
};

const camila: StrategyRecord = {
  nome: "Camila",
  savedAt: "2026-10-01T10:00:00Z",
  anamnese: { nome: "Camila", objetivo: "Hipertrofia", experiencia: "Intermediário", diasSemana: "4", sexo: "Feminino" },
  answers: {
    ...decisoes,
    objetivo_prioridade: ["Glúteos", "Costas"],
    divisao_porque: "A Camila treina 4x e quer glúteo.",
    mensagem_final: "Camila, vamos pra cima!",
  },
  volume: [{ grupo: "Glúteos", series: "14" }],
};
const rafael: StrategyRecord = {
  nome: "Rafael",
  savedAt: "2026-10-02T10:00:00Z",
  anamnese: { nome: "Rafael", objetivo: "Emagrecimento", experiencia: "Iniciante", diasSemana: "3", sexo: "Masculino" },
  answers: { objetivo_principal: "Emagrecimento", divisao_qual: "Full Body", volume_frequencia: "3x por semana", cardio_have: "Sim" },
};
const quaseVazia: StrategyRecord = {
  nome: "Sem decisões",
  anamnese: { objetivo: "Hipertrofia", experiencia: "Intermediário", diasSemana: "4" },
  answers: { divisao_qual: "ABC" },
};

describe("começar a partir de uma estratégia parecida", () => {
  const nova = { nome: "Bruna", objetivo: "Hipertrofia", experiencia: "Intermediário", diasSemana: "4", sexo: "Feminino", prioridadeMuscular: "glúteos" };

  it("ordena pelas mais parecidas e explica o porquê", () => {
    const m = similarStrategies([rafael, camila, quaseVazia], nova);
    expect(m.map((x) => x.record.nome)).toEqual(["Camila"]); // Rafael é de outro perfil; a outra não tem decisões
    expect(m[0].reasons).toEqual(["Hipertrofia", "Intermediário", "4 dias/semana", "prioridade: Glúteos"]);
    expect(m[0].score).toBeGreaterThanOrEqual(80);
    expect(m[0].decisoes).toBe(6);
  });

  it("reconhece o ciclo anterior do mesmo aluno", () => {
    expect(similarity(camila, { nome: "Camila", objetivo: "Hipertrofia" }).reasons[0]).toBe("mesmo aluno (ciclo anterior)");
  });

  it("copia só as decisões, mantém o que veio da anamnese e não copia textos pessoais", () => {
    const atual = { answers: { objetivo_prioridade: ["Glúteos"] }, volume: [] };
    const { answers, volume, copiadas } = answersFromBase(camila, atual);
    expect(answers.divisao_qual).toBe("Lower / Upper / Lower / Full Body");
    expect(answers.intensidade_estrategia).toEqual(["Pirâmide crescente", "Bi-set"]);
    expect(answers.objetivo_prioridade).toEqual(["Glúteos"]); // não sobrescreve
    expect(answers.divisao_porque).toBeUndefined(); // texto pessoal
    expect(answers.mensagem_final).toBeUndefined();
    expect(copiadas).toBe(5);
    expect(volume).toEqual([{ grupo: "Glúteos", series: "14" }]);
    // não altera a estratégia-base
    expect((camila.answers.intensidade_estrategia as string[]).length).toBe(2);
  });

  it("não troca uma tabela de volume já preenchida", () => {
    const { volume } = answersFromBase(camila, { answers: {}, volume: [{ grupo: "Costas", series: "10" }] });
    expect(volume).toEqual([{ grupo: "Costas", series: "10" }]);
  });
});
