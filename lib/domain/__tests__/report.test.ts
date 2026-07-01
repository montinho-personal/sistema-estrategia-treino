import { describe, it, expect } from "vitest";

import {
  reportDocument, reportSections, reportClosing, reportWhatsapp, completion, studentDiagnosis,
} from "../report";
import { makeState, fillAllRequired } from "./fixtures";

describe("report / geração do relatório", () => {
  it("segue a estrutura fixa do PRD (9 seções, nesta ordem)", () => {
    const doc = reportDocument(fillAllRequired(makeState({ nome: "Ana", objetivo: "Hipertrofia" })));
    expect(doc.map((s) => s.id)).toEqual([
      "objetivo", "diagnostico", "estrategia", "divisao", "intensidade",
      "periodizacao", "mobilidade", "progressao", "papel",
    ]);
  });

  it("mensagem final é exclusiva e adaptada ao perfil", () => {
    expect(reportClosing(makeState({ objetivo: "Emagrecimento" }))).toMatch(/consist[êe]ncia/i);
    expect(reportClosing(makeState({ idade: "70" }))).toMatch(/sa[úu]de|autonomia|qualidade/i);
    expect(reportClosing(makeState({ objetivo: "Hipertrofia" }))).toMatch(/m[úu]sculo|constru/i);
    expect(reportClosing(makeState({ experiencia: "Atleta" }))).toMatch(/rendimento|performance/i);
    // se o treinador escreve uma mensagem, ela tem prioridade
    expect(reportClosing(makeState({ objetivo: "Hipertrofia" }, { mensagem_final: "Vamos, Ana!" }))).toBe("Vamos, Ana!");
  });

  it("diagnóstico ao aluno usa checklist e nunca fica vazio", () => {
    const txt = studentDiagnosis(makeState({ dores: "joelho", sono: "Bom", diasSemana: "3" }));
    expect(txt).toMatch(/✓/);
    expect(txt).toMatch(/potencial de evolução/i);
  });

  it("override de seção substitui o texto automático", () => {
    const s = fillAllRequired(makeState({ nome: "Ana" }));
    s.overrides["objetivo"] = "Texto editado à mão.";
    const secObjetivo = reportSections(s).find((x) => x.id === "objetivo");
    expect(secObjetivo?.body).toBe("Texto editado à mão.");
  });

  it("versão WhatsApp inclui abertura, seções e fechamento", () => {
    const wa = reportWhatsapp(fillAllRequired(makeState({ nome: "Ana Souza" })));
    expect(wa).toMatch(/^\*Sua estratégia de treino\*/);
    expect(wa).toMatch(/Olá, Ana/);
    expect(wa).toMatch(/Mensagem final/);
  });

  it("completude reflete respostas obrigatórias", () => {
    expect(completion(makeState({})).complete).toBe(false);
    expect(completion(fillAllRequired(makeState({}))).complete).toBe(true);
  });
});
