import { describe, expect, it } from "vitest";
import { makeState } from "./fixtures";
import { estrategiaParaApp, exportarParaApp, fasesDe, nomeArquivoApp } from "../export-app";
import { parseVolumeText, volumeLines, volumeTotalTexto } from "../report";

const estado = () => {
  const s = makeState(
    { nome: "Fulano Teste", tituloPlano: "Operação Teste", objetivo: "Recomposição corporal", experiencia: "Intermediário", diasSemana: "4", tempoSessao: "60", motivacao: "Alta", dores: "Tendão de Aquiles" },
    {
      objetivo_principal: "Recomposição corporal",
      objetivo_secundario: ["Reduzir gordura", "Mobilidade e flexibilidade"],
      objetivo_prioridade: ["Costas", "Peito"],
      prioridade_estrategias: ["Mais volume de séries", "Pré-exaustão (isolador antes do composto)"],
      divisao_qual: "Push/Pull/Legs/Superiores",
      divisao_porque: "Foco em tronco sem sobrecarregar a perna.",
      divisao_adaptacoes: "Pernas só em máquinas sentadas.",
      intensidade_estrategia: "Pirâmide crescente",
      volume_frequencia: "Prioritários 2–3x · demais 1–2x",
      periodizacao_fases: "Fase 1 · Adaptação (4 sem); Fase 2 · Intensificação (4 sem); Fase 3 · Consolidação (4 sem)",
      mobilidade_o_que: ["Aquecimento", "Core", "Mobilidade"],
      progressao_como: ["Dupla progressão (repetições → carga)", "Reavaliar a cada 4 semanas"],
      acompanhamento_info: ["Sono", "Dor", "Cargas"],
      filosofia_frase: "Constância inteligente",
      cardio_have: "Sim",
      cardio_detalhe: "4x por semana após a musculação",
      exercicios_proibido: "Agachamento livre",
    },
  );
  s.volume = [{ grupo: "Peitoral", series: "14", max: "18" }, { grupo: "Dorsais", series: "16" }, { grupo: "", series: "3" }];
  return s;
};

describe("volume em faixa", () => {
  it("linhas, total e percentuais pela faixa", () => {
    const s = estado();
    expect(volumeLines(s).map((l) => [l.grupo, l.series])).toEqual([["Peitoral", "14–18"], ["Dorsais", "16"]]);
    expect(volumeTotalTexto(s)).toBe("30–34");
  });
  it("lê faixas coladas como texto", () => {
    expect(parseVolumeText("Peito | 14-18 | 16%\nCostas | 16 | 16%\nOmbros  10 a 12")).toEqual([
      { grupo: "Peito", series: "14", max: "18" },
      { grupo: "Costas", series: "16" },
      { grupo: "Ombros", series: "10", max: "12" },
    ]);
  });
});

describe("exportar para o app Montinho", () => {
  it("estrutura com tudo o que foi preenchido", () => {
    const e = estrategiaParaApp(estado());
    expect(e).toMatchObject({
      versao: 1, aluno: "Fulano Teste", titulo: "Operação Teste", objetivo: "Recomposição corporal", objetivosSecundarios: "Reduzir gordura e Mobilidade e flexibilidade",
      experiencia: "Intermediário", diasPorSemana: 4, minutosPorTreino: 60, prioridades: ["Costas", "Peito"], divisao: "Push/Pull/Legs/Superiores",
      adaptacoes: "Pernas só em máquinas sentadas.", intensidade: "Pirâmide crescente", frase: "Constância inteligente", aerobico: "4x por semana após a musculação",
      restricoes: "Dores: Tendão de Aquiles", exerciciosEvitar: "Agachamento livre",
    });
    expect(e.volume).toEqual([{ rotulo: "Peitoral", series: 14, max: 18 }, { rotulo: "Dorsais", series: 16, max: null }]);
    expect(e.fases).toEqual([{ numero: 1, nome: "Adaptação", semanas: 4 }, { numero: 2, nome: "Intensificação", semanas: 4 }, { numero: 3, nome: "Consolidação", semanas: 4 }]);
    expect(e.checkinSemanal).toEqual(["Sono", "Dor", "Cargas"]);
    expect(e.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(e.encerramento).toBeTruthy();
  });
  it("estratégia vazia não inventa nada", () => {
    const e = estrategiaParaApp(makeState());
    expect(e).toMatchObject({ aluno: null, objetivo: null, diasPorSemana: null, volume: [], fases: [], divisao: null });
  });
  it("arquivo identificado e com nome do aluno", () => {
    const s = estado();
    expect(exportarParaApp(s)).toMatchObject({ formato: "montinho-strategy", versaoFormato: 1 });
    expect(nomeArquivoApp(s)).toBe("fulano-teste.montinho.json");
  });
  it("fases sem o padrão “Fase N” viram etapas numeradas", () => {
    expect(fasesDe("Adaptação (3 sem) → Força (6 sem)")).toEqual([{ numero: 1, nome: "Adaptação", semanas: 3 }, { numero: 2, nome: "Força", semanas: 6 }]);
  });
});
