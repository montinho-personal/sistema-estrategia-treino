import { describe, it, expect } from "vitest";

import { plan, requiredMissing, consistency, neighbor, firstIdOfTopic, questionsForTopic } from "../interview";
import { TOPICS } from "../config";
import { makeState, fillAllRequired } from "./fixtures";

describe("interview / plano adaptativo", () => {
  it("injeta perguntas adaptativas conforme a anamnese (cada entrevista é diferente)", () => {
    const base = plan(makeState({})).length;
    const comDor = plan(makeState({ dores: "lombar", objetivo: "Emagrecimento" }));
    const ids = comDor.map((it) => it.q.id);
    expect(comDor.length).toBeGreaterThan(base);
    expect(ids).toContain("adapt_dor");
    expect(ids).toContain("adapt_emagrecimento");
  });

  it("respeita condições (cardio_detalhe só aparece se cardio_have = Sim)", () => {
    const cardioTopic = TOPICS.find((t) => t.id === "cardio")!;
    const semCardio = questionsForTopic(cardioTopic, makeState({}, { cardio_have: "Não" }));
    const comCardio = questionsForTopic(cardioTopic, makeState({}, { cardio_have: "Sim" }));
    expect(semCardio.map((q) => q.id)).not.toContain("cardio_detalhe");
    expect(comCardio.map((q) => q.id)).toContain("cardio_detalhe");
  });

  it("checklist final: nunca completo enquanto faltar obrigatória", () => {
    const empty = makeState({});
    expect(requiredMissing(empty).length).toBeGreaterThan(0);
    const full = fillAllRequired(makeState({}));
    expect(requiredMissing(full).length).toBe(0);
  });

  it("auditoria de consistência dispara nos conflitos e respeita 'manter'", () => {
    const state = makeState(
      { objetivo: "Hipertrofia", experiencia: "Iniciante", dores: "joelho" },
      { intensidade_estrategia: "Carga fixa", intensidade_porque: "vamos priorizar força máxima", intensidade_tecnicas: ["Falha"] },
    );
    const ids = consistency(state).map((c) => c.id);
    expect(ids).toContain("c_obj_forca");
    expect(ids).toContain("c_dor_intensidade");
    state.acknowledged["c_obj_forca"] = true;
    expect(consistency(state).map((c) => c.id)).not.toContain("c_obj_forca");
  });

  it("navegação por id encontra vizinhos e o início de um tópico", () => {
    const state = makeState({});
    const first = firstIdOfTopic(state, "objetivo");
    expect(first).toBe("objetivo_principal");
    expect(neighbor(state, first!, 1)).not.toBeNull();
    expect(neighbor(state, first!, -1)).toBeNull();
  });
});
