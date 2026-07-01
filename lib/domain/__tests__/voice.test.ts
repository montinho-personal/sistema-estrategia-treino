import { describe, it, expect } from "vitest";

import { simplify, checkVoice, personalLead, dna } from "../voice";
import { makeState } from "./fixtures";

describe("voice / DNA do Montinho", () => {
  it("traduz jargão técnico para linguagem simples", () => {
    const out = simplify("Vamos focar na hipertrofia e no estresse metabólico com boa cadência.");
    expect(out).not.toMatch(/hipertrofia/i);
    expect(out).not.toMatch(/estresse metabólico/i);
    expect(out).toMatch(/ganho de massa muscular/i);
    expect(out).toMatch(/ritmo do movimento/i);
  });

  it("aponta jargão, frase genérica e falta de tom pessoal", () => {
    const issues = checkVoice("A densidade de treino será alta. Você consegue!");
    const text = issues.map((i) => i.text).join(" ");
    expect(text).toMatch(/técnicos/i);
    expect(text).toMatch(/genérica/i);
    expect(text).toMatch(/tom pessoal/i);
  });

  it("fornece aberturas em primeira pessoa por tópico", () => {
    expect(personalLead("objetivo")).toMatch(/nosso foco/i);
    expect(personalLead("mensagem")).toBe("");
    expect(personalLead("inexistente")).toBeNull();
  });

  it("calcula insights do DNA a partir de preferências e histórico", () => {
    const state = makeState({}, { periodizacao_fases: "Fase 1 adaptação", objetivo_porque: "x", divisao_porque: "y", intensidade_porque: "z" });
    const result = dna(state, {
      prefs: [{ id: "piramide_decrescente", title: "Pirâmide decrescente", count: 2 }],
      historyAnswers: [],
      styleSamples: 0,
    });
    expect(result.insights.some((i) => /pirâmide decrescente/i.test(i))).toBe(true);
    expect(result.insights.some((i) => /adaptação/i.test(i))).toBe(true);
    expect(result.insights.some((i) => /motivo de cada decisão/i.test(i))).toBe(true);
  });
});
