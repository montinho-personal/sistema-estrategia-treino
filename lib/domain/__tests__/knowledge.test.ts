import { describe, it, expect } from "vitest";

import { matchKnowledge, explainKnowledge, knowledgeForTopic, kbById, allKnowledge } from "../knowledge";
import { makeState } from "./fixtures";

describe("knowledge / biblioteca inteligente", () => {
  it("reconhece estratégias pelo texto", () => {
    expect(matchKnowledge("Vamos usar Upper Lower 4x").map((e) => e.id)).toContain("upper_lower");
    expect(matchKnowledge("Pirâmide decrescente").map((e) => e.id)).toContain("piramide_decrescente");
  });

  it("adapta a explicação por perfil do aluno", () => {
    const drop = kbById("drop_set")!;
    expect(explainKnowledge(drop, makeState({ idade: "68" })).profile).toBe("idoso");
    expect(explainKnowledge(drop, makeState({ objetivo: "Emagrecimento" })).profile).toBe("emagrecimento");
    expect(explainKnowledge(drop, makeState({})).profile).toBeNull();
  });

  it("relaciona entradas às respostas de um tópico", () => {
    const state = makeState({}, { divisao_qual: "Upper Lower, 4x" });
    expect(knowledgeForTopic(state, "divisao").map((e) => e.id)).toContain("upper_lower");
  });

  it("tem uma base de conhecimento não trivial", () => {
    expect(allKnowledge().length).toBeGreaterThanOrEqual(25);
  });
});
