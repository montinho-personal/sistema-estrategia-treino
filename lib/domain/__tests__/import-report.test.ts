import { describe, it, expect } from "vitest";

import {
  importQuestionGuide,
  importSummary,
  importedCount,
  parseReportDate,
  sanitizeImportedStrategy,
} from "../import-report";
import { PERIODIZACAO_PADRAO } from "../config/topics";

describe("importar relatório antigo", () => {
  it("mapeia as respostas para as opções atuais (sem acento, caixa ou pontuação)", () => {
    const imp = sanitizeImportedStrategy({
      anamnese: { nome: "Galo", objetivo: "recomposicao corporal", experiencia: "avançado", inventado: "x" },
      respostas: {
        objetivo_principal: "hipertrofia",
        divisao_qual: "push pull legs",
        cardio_have: "sim",
        intensidade_estrategia: ["Bi-set", "rest pause", "Isometria no pico de contração"],
        periodizacao_fases: PERIODIZACAO_PADRAO.toLowerCase(),
        pergunta_que_nao_existe: "x",
      },
    });
    expect(imp.anamnese).toEqual({ nome: "Galo", objetivo: "Recomposição corporal", experiencia: "Avançado" });
    expect(imp.answers.objetivo_principal).toBe("Hipertrofia");
    expect(imp.answers.divisao_qual).toBe("Push / Pull / Legs");
    expect(imp.answers.cardio_have).toBe("Sim");
    expect(imp.answers.intensidade_estrategia).toEqual(["Bi-set", "Rest-pause", "Isometria no pico de contração"]);
    expect(imp.answers.periodizacao_fases).toBe(PERIODIZACAO_PADRAO);
    expect(imp.answers).not.toHaveProperty("pergunta_que_nao_existe");
  });

  it("separa uma lista escrita num texto só e guarda o resto como “Outra”", () => {
    const imp = sanitizeImportedStrategy({
      respostas: { intensidade_estrategia: "Bi-set, Rest-pause e método da casa" },
    });
    expect(imp.answers.intensidade_estrategia).toEqual(["Bi-set", "Rest-pause", "método da casa"]);

    // a lista começa com uma opção: não pode virar só a primeira
    const b = sanitizeImportedStrategy({
      respostas: { intensidade_estrategia: "Pirâmide crescente, Bi-set e isometria no pico de contração" },
    });
    expect(b.answers.intensidade_estrategia).toEqual(["Pirâmide crescente", "Bi-set", "Isometria no pico de contração"]);
  });

  it("aceita opção longa citada só pelo começo", () => {
    const imp = sanitizeImportedStrategy({ respostas: { progressao_como: ["Dupla progressão"] } });
    expect(imp.answers.progressao_como).toEqual(["Dupla progressão (repetições → carga)"]);
  });

  it("escolha única fora das opções vira texto livre só quando a pergunta aceita “Outra”", () => {
    const imp = sanitizeImportedStrategy({
      anamnese: { experiencia: "Profissional" },
      respostas: { divisao_qual: "AB 2x na semana", cardio_have: "Talvez" },
    });
    expect(imp.answers.divisao_qual).toBe("AB 2x na semana");
    expect(imp.answers).not.toHaveProperty("cardio_have");
    expect(imp.anamnese).not.toHaveProperty("experiencia");
  });

  it("copia os textos e lê o volume (sem duplicar grupos)", () => {
    const imp = sanitizeImportedStrategy({
      respostas: { divisao_porque: "Porque encaixa na sua rotina.", mensagem_final: ["Bora!"] },
      volume: [
        { grupo: "Glúteos", series: "16 séries" },
        { grupo: "Costas", series: 12 },
        { grupo: "glúteos", series: 10 },
        { grupo: "Total", series: "" },
      ],
    });
    expect(imp.answers.divisao_porque).toBe("Porque encaixa na sua rotina.");
    expect(imp.answers.mensagem_final).toBe("Bora!");
    expect(imp.volume).toEqual([
      { grupo: "Glúteos", series: "16" },
      { grupo: "Costas", series: "12" },
    ]);
    expect(importedCount(imp)).toBe(4);
  });

  it("lê a data do relatório e ignora datas inválidas ou futuras", () => {
    expect(new Date(parseReportDate("2026-03-10")!).getDate()).toBe(10);
    expect(new Date(parseReportDate("10/03/2026")!).getMonth()).toBe(2);
    expect(parseReportDate("2026-02-31")).toBeNull();
    expect(parseReportDate("2999-01-01")).toBeNull();
    expect(parseReportDate("março")).toBeNull();
    expect(sanitizeImportedStrategy({}).data).toBeNull();
  });

  it("resume o que foi recuperado e o que faltou", () => {
    const imp = sanitizeImportedStrategy({
      anamnese: { nome: "Ana", tituloPlano: "Operação Bumbum na Nuca", objetivo: "Hipertrofia" },
      respostas: { objetivo_principal: "Hipertrofia", divisao_qual: "ABC", divisao_porque: "Rotina." },
    });
    const s = importSummary(imp);
    expect(s.perfil).toEqual([{ label: "Objetivo principal", value: "Hipertrofia" }]);
    expect(s.decisoes.map((d) => d.id)).toEqual(["objetivo_principal", "divisao_qual"]);
    expect(s.textos).toBe(1);
    expect(s.faltando).toContain("Periodização");
    expect(s.faltando).not.toContain("Objetivo");
  });

  it("o guia da IA lista as perguntas com as opções válidas", () => {
    const g = importQuestionGuide();
    expect(g).toContain('"divisao_qual" [escolha única]');
    expect(g).toContain("Push / Pull / Legs");
    expect(g).toContain('"adapt_emagrecimento"');
  });
});
