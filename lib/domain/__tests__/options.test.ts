import { describe, it, expect } from "vitest";

import { reportDocument, completion } from "../report";
import { essentialItems, requiredMissing, questionsForTopic } from "../interview";
import { TOPICS, SEM_PRIORIDADE } from "../config";
import { makeState } from "./fixtures";

describe("entrevista mínima com opções", () => {
  it("navega só a pergunta essencial de cada tópico", () => {
    const ess = essentialItems(makeState({}));
    expect(ess).toHaveLength(TOPICS.length);
    expect(ess.map((it) => it.q.id)).toEqual(TOPICS.map((t) => t.mainQ));
  });

  it("contador do relatório considera só as essenciais", () => {
    const vazio = completion(makeState({}));
    expect(vazio.total).toBe(TOPICS.length);
    expect(vazio.done).toBe(0);
    expect(requiredMissing(makeState({}, { objetivo_principal: "Hipertrofia" }))).toHaveLength(TOPICS.length - 1);
  });

  it("estratégias de priorização só aparecem com grupos prioritários", () => {
    const topic = TOPICS.find((t) => t.id === "prioridade")!;
    const ids = (ans: Record<string, string | string[]>) => questionsForTopic(topic, makeState({}, ans)).map((q) => q.id);
    expect(ids({})).not.toContain("prioridade_estrategias");
    expect(ids({ objetivo_prioridade: [SEM_PRIORIDADE] })).not.toContain("prioridade_estrategias");
    expect(ids({ objetivo_prioridade: ["Glúteos"] })).toContain("prioridade_estrategias");
  });

  it("relatório explica ao aluno os grupos e as estratégias escolhidas", () => {
    const s = makeState({}, {
      objetivo_principal: "Hipertrofia",
      objetivo_prioridade: ["Costas", "Glúteos"],
      prioridade_estrategias: ["Mais volume de séries", "Pré-exaustão (isolador antes do composto)", "Bi-set no glúteo"],
      progressao_como: ["Dupla progressão (repetições → carga)", "Reavaliar a cada 4 semanas"],
    });
    const doc = reportDocument(s);
    const obj = doc.find((x) => x.id === "objetivo")!.body;
    expect(obj).toMatch(/costas e glúteos/);
    expect(obj).toMatch(/✓ Mais volume de séries — mais séries por semana/);
    expect(obj).toMatch(/✓ Pré-exaustão .* cadeira extensora/);
    expect(obj).toMatch(/✓ Bi-set no glúteo$/m); // texto livre ("Outra") também entra
    const prog = doc.find((x) => x.id === "progressao")!.body;
    expect(prog).toMatch(/✓ Dupla progressão/);
  });

  it("'sem prioridade' vira uma frase de equilíbrio, não uma lista", () => {
    const obj = reportDocument(makeState({}, { objetivo_prioridade: [SEM_PRIORIDADE] }))
      .find((x) => x.id === "objetivo")!.body;
    expect(obj).toMatch(/equilíbrio/);
    expect(obj).not.toMatch(/atenção especial/);
  });

  it("respostas antigas em texto continuam funcionando", () => {
    const obj = reportDocument(makeState({}, { objetivo_prioridade: "Ombros e dorsais", progressao_como: "Progressão dupla" }));
    expect(obj.find((x) => x.id === "objetivo")!.body).toMatch(/ombros e dorsais/i);
    expect(obj.find((x) => x.id === "progressao")!.body).toMatch(/Progressão dupla/);
  });
});
