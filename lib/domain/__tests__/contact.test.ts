import { describe, it, expect } from "vitest";

import { ageFromBirth, birthDateIso, cleanEmail, whatsappDigits } from "../contact";
import { appExport, APP_EXPORT_FORMAT } from "../app-export";
import { makeState } from "./fixtures";

describe("dados de contato do aluno", () => {
  it("normaliza a data de nascimento e calcula a idade", () => {
    expect(birthDateIso("05/03/1990")).toBe("1990-03-05");
    expect(birthDateIso("5-3-1990")).toBe("1990-03-05");
    expect(birthDateIso("1990-03-05")).toBe("1990-03-05");
    expect(birthDateIso("31/02/1990")).toBeNull();
    expect(birthDateIso("março")).toBeNull();
    const hoje = new Date(2026, 9, 20);
    expect(ageFromBirth("21/10/1990", hoje)).toBe(35); // aniversário amanhã
    expect(ageFromBirth("20/10/1990", hoje)).toBe(36);
  });

  it("deixa o WhatsApp só com dígitos e DDI 55", () => {
    expect(whatsappDigits("(11) 99999-8888")).toBe("5511999998888");
    expect(whatsappDigits("+55 11 99999-8888")).toBe("5511999998888");
    expect(whatsappDigits("1234")).toBeNull();
  });

  it("valida o e-mail", () => {
    expect(cleanEmail(" Carol@Email.com ")).toBe("carol@email.com");
    expect(cleanEmail("carol@")).toBeNull();
  });
});

describe("pacote para o aplicativo", () => {
  it("leva aluno, contato e decisões do plano", () => {
    const s = makeState(
      { nome: "Carol Zorzi", dataNascimento: "10/02/1979", email: "carol@email.com", whatsapp: "(11) 98888-7777", tituloPlano: "Missão Musa", diasSemana: "4", tempoSessao: "60" },
      { divisao_qual: "ABC", intensidade_estrategia: ["Bi-set", "Rest-pause"], cardio_have: "Não", cardio_detalhe: ["Esteira"] },
    );
    s.volume = [{ grupo: "Glúteos", series: "16" }, { grupo: "", series: "4" }];
    const x = appExport(s, new Date("2026-10-20T12:00:00Z"));
    expect(x.formato).toBe(APP_EXPORT_FORMAT);
    expect(x.aluno).toMatchObject({ nome: "Carol Zorzi", dataNascimento: "1979-02-10", email: "carol@email.com", whatsapp: "5511988887777" });
    expect(x.aluno.idade).toBeGreaterThanOrEqual(46);
    expect(x.plano).toMatchObject({ titulo: "Missão Musa", diasPorSemana: 4, minutosPorSessao: 60, divisao: "ABC", intensidade: ["Bi-set", "Rest-pause"], cardio: [] });
    expect(x.plano.volumeSemanal).toEqual([{ grupo: "Glúteos", series: 16 }]);
    expect(x.decisoes.find((d) => d.id === "divisao_qual")).toMatchObject({ tema: "Divisão do treinamento", resposta: "ABC" });
  });
});
