import { describe, it, expect } from "vitest";

import {
  analyzeHistory,
  historySuggestion,
  trainerMemoryText,
  writingSamples,
  insightsText,
  memoryOverview,
  patternStrength,
  type StrategyRecord,
} from "../insights";

const rec = (
  nome: string,
  objetivo: string,
  answers: StrategyRecord["answers"],
  extra: Partial<StrategyRecord> = {},
): StrategyRecord => ({ nome, savedAt: `2026-10-0${nome.length % 9 + 1}T10:00:00Z`, anamnese: { nome, objetivo }, answers, ...extra });

const HIST: StrategyRecord[] = [
  rec("Ana", "Hipertrofia", { divisao_qual: "Upper / Lower", intensidade_estrategia: ["Pirâmide crescente", "Bi-set"], cardio_have: "Não" }, {
    volume: [{ grupo: "Glúteos", series: "14" }, { grupo: "Costas", series: "10" }],
  }),
  rec("Bia", "Hipertrofia", { divisao_qual: "Upper / Lower", intensidade_estrategia: ["Pirâmide crescente"], divisao_porque: "Porque ela treina 4x e precisa de frequência 2x nos prioritários." }, {
    volume: [{ grupo: "Glúteos", series: "18" }],
  }),
  rec("Caio", "Hipertrofia", { divisao_qual: "Full Body", intensidade_estrategia: ["Dupla progressão"] }),
  rec("Duda", "Emagrecimento", { divisao_qual: "Full Body", cardio_have: "Não" }),
];

describe("painel do treinador / cruzamento das estratégias", () => {
  it("conta estratégias, alunos e as escolhas mais frequentes", () => {
    const ins = analyzeHistory(HIST);
    expect(ins.total).toBe(4);
    expect(ins.alunos).toBe(4);
    expect(ins.objetivos[0]).toMatchObject({ value: "Hipertrofia", count: 3, pct: 75 });
    const div = ins.escolhas.find((e) => e.id === "divisao_qual")!;
    expect(div.answered).toBe(4);
    expect(div.top.map((c) => [c.value, c.count])).toEqual([["Full Body", 2], ["Upper / Lower", 2]]);
    const int = ins.escolhas.find((e) => e.id === "intensidade_estrategia")!;
    expect(int.top[0]).toMatchObject({ value: "Pirâmide crescente", count: 2 });
  });

  it("mostra o padrão por objetivo e o volume médio por grupo", () => {
    const ins = analyzeHistory(HIST);
    const hip = ins.porObjetivo.find((p) => p.objetivo === "Hipertrofia")!;
    expect(hip.n).toBe(3);
    expect(hip.destaques.find((d) => d.label === "Divisão")).toMatchObject({ value: "Upper / Lower", count: 2, of: 3 });
    expect(ins.volume[0]).toMatchObject({ grupo: "Glúteos", media: 16, n: 2 });
    expect(ins.volumeTotalMedio).toBe(21); // (24 + 18) / 2
    expect(ins.comVolume).toBe(2);
  });

  it("aponta incoerências: emagrecimento sem cardio", () => {
    const ins = analyzeHistory(HIST);
    expect(ins.observacoes.join(" ")).toMatch(/1 de 1 estratégia\(s\) de emagrecimento o cardio ficou de fora/);
  });

  it("sugere 'você costuma' só quando há padrão claro no mesmo objetivo", () => {
    const opts = ["Full Body", "Upper / Lower"];
    expect(historySuggestion(HIST, { objetivo: "Hipertrofia" }, "divisao_qual", opts)).toEqual({ value: "Upper / Lower", count: 2, of: 3 });
    // emagrecimento tem só 1 estratégia: sem padrão ainda
    expect(historySuggestion(HIST, { objetivo: "Emagrecimento" }, "divisao_qual", opts)).toBeNull();
    // a opção precisa existir na pergunta
    expect(historySuggestion(HIST, { objetivo: "Hipertrofia" }, "divisao_qual", ["ABC"])).toBeNull();
  });

  it("memória para a IA inclui princípios, padrões e exemplos da escrita", () => {
    const ins = analyzeHistory(HIST);
    const amostras = writingSamples(HIST, ["Texto que o Renato editou no relatório, do jeito dele de falar."]);
    expect(amostras[0]).toMatch(/Renato editou/);
    expect(amostras.some((a) => /frequência 2x/.test(a))).toBe(true);
    const mem = trainerMemoryText({ insights: ins, principios: "Iniciante não treina até a falha.", amostras });
    expect(mem).toMatch(/PRINCÍPIOS DEFINIDOS PELO TREINADOR[\s\S]*Iniciante não treina até a falha/);
    expect(mem).toMatch(/Divisão do treinamento: .*Upper \/ Lower \(2\/4\)/);
    expect(mem).toMatch(/EXEMPLOS DE COMO O TREINADOR ESCREVE/);
  });

  it("sem histórico nem princípios, a memória fica vazia", () => {
    const vazio = analyzeHistory([]);
    expect(vazio.total).toBe(0);
    expect(insightsText(vazio)).toBe("");
    expect(trainerMemoryText({ insights: vazio })).toBe("");
  });
});

describe("o que a IA sabe sobre você (resumo visual)", () => {
  const r = (answers: Record<string, string | string[]>): StrategyRecord => ({ anamnese: { nome: "x" }, answers });

  it("classifica a força de cada padrão", () => {
    expect(patternStrength(75, 8)).toBe("forte");
    expect(patternStrength(100, 2)).toBe("tendencia"); // pouca base: ainda não é padrão forte
    expect(patternStrength(45, 10)).toBe("tendencia");
    expect(patternStrength(25, 8)).toBe("varia");
  });

  it("agrupa as decisões e lê princípios e nível", () => {
    const ins = analyzeHistory([
      r({ divisao_qual: "ABC", cardio_have: "Sim", objetivo_principal: "Hipertrofia" }),
      r({ divisao_qual: "ABC", cardio_have: "Não" }),
      r({ divisao_qual: "ABC", cardio_have: "Sim" }),
      r({ divisao_qual: "Full Body", cardio_have: "Não" }),
    ]);
    const m = memoryOverview(ins, "- Sempre começo com adaptação\n\n• Iniciante não vai à falha\n", ["Texto de exemplo"]);
    expect(m.padroes.forte.map((p) => [p.id, p.value, p.pct])).toEqual([["divisao_qual", "ABC", 75]]);
    expect(m.padroes.tendencia.map((p) => p.id)).toEqual(["cardio_have"]);
    // objetivo é do aluno, não uma decisão de método: vai para o perfil
    expect(m.perfil.map((p) => [p.id, p.value])).toEqual([["objetivo_principal", "Hipertrofia"]]);
    expect(Object.values(m.padroes).flat().some((p) => p.id === "objetivo_principal")).toBe(false);
    expect(m.principios).toEqual(["Sempre começo com adaptação", "Iniciante não vai à falha"]);
    expect(m.nivel).toEqual({ label: "Começando a te conhecer", pct: 20 });
    expect(m.amostras).toHaveLength(1);
  });
});
