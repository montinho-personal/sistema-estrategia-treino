import { describe, it, expect } from "vitest";

import { prioridadeFromText, anamnesePrefill, missingPrefill, isFromAnamnese } from "../prefill";
import { SEM_PRIORIDADE } from "../config";
import { makeState } from "./fixtures";

describe("pré-preenchimento pela anamnese", () => {
  it("lê grupos musculares escritos livremente", () => {
    expect(prioridadeFromText("Glúteos e posterior")).toEqual(["Posterior de coxa", "Glúteos"]);
    expect(prioridadeFromText("quer o bumbum na nuca e costas largas")).toEqual(["Costas", "Glúteos"]);
    expect(prioridadeFromText("membros inferiores")).toEqual(["Quadríceps", "Posterior de coxa", "Glúteos"]);
    expect(prioridadeFromText("Bíceps, tríceps e abdômen")).toEqual(["Braços", "Abdômen / Core"]);
    expect(prioridadeFromText("nenhuma, equilíbrio geral")).toEqual([SEM_PRIORIDADE]);
    expect(prioridadeFromText("")).toEqual([]);
    // texto não reconhecido entra como "Outra", para o treinador revisar
    expect(prioridadeFromText("deltoide lateral e serrátil")).toEqual(["Ombros"]);
    expect(prioridadeFromText("serrátil")).toEqual(["serrátil"]);
  });

  it("mapeia o objetivo da anamnese para a opção da entrevista", () => {
    expect(anamnesePrefill(makeState({ objetivo: "Hipertrofia" })).objetivo_principal).toBe("Hipertrofia");
    expect(anamnesePrefill(makeState({ objetivo: "Performance" })).objetivo_principal).toBe("Força e performance");
    expect(anamnesePrefill(makeState({ objetivo: "Competição" })).objetivo_principal).toBe("Preparação para competição");
  });

  it("nunca sobrescreve o que o treinador já respondeu (nem respostas apagadas)", () => {
    const anam = { objetivo: "Hipertrofia", prioridadeMuscular: "glúteos" };
    expect(missingPrefill(makeState(anam))).toEqual({ objetivo_principal: "Hipertrofia", objetivo_prioridade: ["Glúteos"] });
    expect(missingPrefill(makeState(anam, { objetivo_principal: "Emagrecimento" }))).not.toHaveProperty("objetivo_principal");
    expect(missingPrefill(makeState(anam, { objetivo_prioridade: [] }))).not.toHaveProperty("objetivo_prioridade");
  });

  it("sabe se a resposta atual ainda é a da anamnese", () => {
    const anam = { prioridadeMuscular: "costas" };
    expect(isFromAnamnese(makeState(anam, { objetivo_prioridade: ["Costas"] }), "objetivo_prioridade")).toBe(true);
    expect(isFromAnamnese(makeState(anam, { objetivo_prioridade: ["Costas", "Peito"] }), "objetivo_prioridade")).toBe(false);
  });
});

describe("recomposição corporal", () => {
  it("vem marcada na entrevista e ativa volume + gasto energético", async () => {
    const { plan } = await import("../interview");
    const { reportClosing } = await import("../report");
    const s = makeState({ objetivo: "Recomposição corporal" });
    expect(anamnesePrefill(s).objetivo_principal).toBe("Recomposição corporal");
    const ids = plan(s).map((it) => it.q.id);
    expect(ids).toContain("volume_frequencia");
    expect(ids).toContain("adapt_emagrecimento");
    expect(reportClosing(s)).toMatch(/recompor/i);
  });
});
