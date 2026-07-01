import { describe, it, expect } from "vitest";

import { buildMemory, areaStatus, suggestions } from "../memory";
import { makeState, fillAllRequired } from "./fixtures";

describe("memory / memória estratégica", () => {
  it("constrói as 11 seções na estrutura do PRD, com emojis", () => {
    const mem = buildMemory(makeState({ nome: "Marina", idade: "34" }));
    expect(mem).toHaveLength(11);
    expect(mem.map((s) => s.title)).toEqual([
      "Aluno", "Objetivo", "Filosofia", "Divisão", "Intensidade",
      "Periodização", "Exercícios", "Mobilidade", "Cardio", "Progressão", "Feedback",
    ]);
    expect(mem[0].emoji).toBe("👤");
    expect(mem[0].rows.find((r) => r[0] === "Nome")?.[1]).toBe("Marina");
  });

  it("status das áreas: pendente → concluída conforme respostas", () => {
    const empty = areaStatus(makeState({}));
    expect(empty.every((a) => a.status === "pending")).toBe(true);
    const full = areaStatus(fillAllRequired(makeState({})));
    expect(full.every((a) => a.status === "done")).toBe(true);
  });

  it("sugere lacunas sem obrigar (máx. 3)", () => {
    const s = suggestions(makeState({ dores: "ombro" }, {}));
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(3);
    expect(s.some((x) => /progress/i.test(x))).toBe(true);
  });
});
