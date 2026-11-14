import { describe, it, expect } from "vitest";

import { careView, divisionSessions, goldenRules, phaseSteps, progressionTerms, volumeBars, volumeInsight, weekPlan } from "../plan-view";
import { makeState } from "./fixtures";

describe("a estratégia traduzida para o aluno", () => {
  it("monta a semana dia a dia com os dias marcados", () => {
    const s = makeState({ diasSemana: "4" }, { divisao_qual: "Lower / Upper / Lower / Full Body", divisao_dias: ["Quinta", "Segunda", "Terça", "Sexta"] });
    const w = weekPlan(s);
    expect(w.comDias).toBe(true);
    expect(w.dias.map((d) => d.treino)).toEqual(["Lower", "Upper", null, "Lower", "Full Body", null, null]);
    expect(w.dias[0].significado).toBe("Pernas e glúteos");
  });

  it("sem dias marcados, mostra Treino 1, 2, 3… e repete a divisão quando ela é menor que a semana", () => {
    const w = weekPlan(makeState({ diasSemana: "4" }, { divisao_qual: "Upper / Lower" }));
    expect(w.comDias).toBe(false);
    expect(w.dias.map((d) => `${d.dia}: ${d.treino}`)).toEqual(["Treino 1: Upper", "Treino 2: Lower", "Treino 3: Upper", "Treino 4: Lower"]);
    expect(divisionSessions("ABC")).toEqual(["Treino A", "Treino B", "Treino C"]);
    expect(divisionSessions("Upper / Lower + Push / Pull / Legs")).toHaveLength(5);
    expect(weekPlan(makeState()).dias).toEqual([]);
  });

  it("barras de volume destacam os prioritários e explicam os números", () => {
    const s = makeState({}, { objetivo_prioridade: ["Glúteos"] });
    s.volume = [{ grupo: "Peito", series: "6" }, { grupo: "Glúteos", series: "14", max: "18" }];
    const b = volumeBars(s);
    expect(b.map((x) => [x.grupo, x.texto, x.pct, x.prioritario])).toEqual([["Glúteos", "14 a 18", 100, true], ["Peito", "6", 33, false]]);
    expect(volumeInsight(b)).toContain("Seus glúteos recebem mais séries");
  });

  it("traduz progressão, fases e cuidados", () => {
    const s = makeState(
      { dores: "Dor lombar ao sentar", lesoes: "Nenhuma." },
      {
        progressao_como: ["Dupla progressão (repetições → carga)", "Regra minha"],
        periodizacao_fases: "Fase 1 · Adaptação (4 sem); Fase 2 · Intensificação (4 sem)",
        exercicios_proibido: "stiff pesado",
      },
    );
    expect(progressionTerms(s)[0].como).toContain("Primeiro você aumenta as repetições");
    expect(progressionTerms(s)[1]).toEqual({ nome: "Regra minha", como: "" });
    expect(phaseSteps(s).map((f) => f.esperar.slice(0, 8))).toEqual(["Aprender", "O treino"]);
    expect(careView(s)).toEqual({ contou: ["Dor lombar ao sentar"], plano: ["Por enquanto, vamos evitar: stiff pesado"] });
    expect(goldenRules(s)).toHaveLength(3);
    expect(goldenRules(s)[2]).toContain("A carga sobe");
  });
});
