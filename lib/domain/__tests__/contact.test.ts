import { describe, it, expect } from "vitest";

import { ageFromBirth, birthDateIso, cleanEmail, whatsappDigits } from "../contact";

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

describe("contato no arquivo do app Montinho", () => {
  it("leva nascimento, idade, e-mail e WhatsApp normalizados", async () => {
    const { estrategiaParaApp } = await import("../export-app");
    const { makeState } = await import("./fixtures");
    const e = estrategiaParaApp(
      makeState({ nome: "Carol Zorzi", dataNascimento: "10/02/1979", email: "Carol@Email.com", whatsapp: "(11) 98888-7777", sexo: "Feminino" }),
    );
    expect(e).toMatchObject({ aluno: "Carol Zorzi", dataNascimento: "1979-02-10", sexo: "Feminino", email: "carol@email.com", whatsapp: "5511988887777" });
    expect(e.idade).toBeGreaterThanOrEqual(46);
    expect(estrategiaParaApp(makeState({ nome: "X", idade: "30" }))).toMatchObject({ dataNascimento: null, idade: 30, email: null, whatsapp: null });
  });
});
