import { describe, it, expect } from "vitest";

import { hasContent, sameStrategy } from "../snapshot";

describe("conteúdo da estratégia", () => {
  it("ignora campos vazios e a ordem das chaves", () => {
    const a = { anamnese: { nome: "Ana", idade: "30" }, answers: { x: "1", y: ["a"] }, overrides: {}, volume: [] };
    const b = { anamnese: { idade: "30", nome: "Ana ", sexo: "" }, answers: { y: ["a"], x: "1", z: [] }, overrides: {} };
    expect(sameStrategy(a, b)).toBe(true);
  });

  it("percebe mudanças em respostas, volume e textos editados", () => {
    const base = { anamnese: { nome: "Ana" }, answers: { x: "1" }, volume: [{ grupo: "Peito", series: "12" }] };
    expect(sameStrategy(base, { ...base, answers: { x: "2" } })).toBe(false);
    expect(sameStrategy(base, { ...base, volume: [{ grupo: "Peito", series: "14" }] })).toBe(false);
    expect(sameStrategy(base, { ...base, overrides: { divisao: "Texto novo" } })).toBe(false);
  });

  it("só considera algo a guardar quando há nome ou alguma resposta", () => {
    expect(hasContent({ anamnese: {}, answers: {} })).toBe(false);
    expect(hasContent({ anamnese: { nome: " " }, answers: { x: [] } })).toBe(false);
    expect(hasContent({ anamnese: { nome: "Ana" } })).toBe(true);
    expect(hasContent({ answers: { x: "1" } })).toBe(true);
  });
});
