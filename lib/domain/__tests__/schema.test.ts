import { describe, it, expect } from "vitest";

import { StrategyStateSchema, createStrategyState, BrandSchema } from "../schema";

describe("schema / validação Zod", () => {
  it("StrategyState aplica defaults ao objeto vazio", () => {
    const parsed = StrategyStateSchema.parse({});
    expect(parsed.step).toBe("anamnese");
    expect(parsed.anamnese).toEqual({});
    expect(parsed.answers).toEqual({});
    expect(parsed.currentQ).toBeNull();
  });

  it("createStrategyState devolve um estado inicial válido", () => {
    expect(() => StrategyStateSchema.parse(createStrategyState())).not.toThrow();
  });

  it("Brand tem o nome padrão do Montinho", () => {
    expect(BrandSchema.parse({}).nome).toBe("Montinho Personal Trainer");
  });

  it("respostas aceitam texto e múltipla escolha", () => {
    const parsed = StrategyStateSchema.parse({
      answers: { objetivo_principal: "Hipertrofia", intensidade_tecnicas: ["RIR", "Cadência"] },
    });
    expect(parsed.answers.intensidade_tecnicas).toEqual(["RIR", "Cadência"]);
  });
});
