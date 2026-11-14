import { describe, it, expect } from "vitest";

import {
  filledVolume,
  linesOf,
  nextChangeDate,
  phaseChangeDefaults,
  phaseChangeWhatsapp,
  phaseTimeline,
  phaseTitle,
} from "../phase-change";
import { makeState } from "./fixtures";

const P3 = "Fase 1 · Adaptação (4 sem); Fase 2 · Intensificação (4 sem); Fase 3 · Consolidação (4 sem)";
const state = () => {
  const s = makeState(
    { nome: "Carol Zorzi", tituloPlano: "Missão Musa", diasSemana: "4" },
    { periodizacao_fases: P3, divisao_qual: "ABCD", objetivo_prioridade: ["Glúteos", "Costas"] },
  );
  s.volume = [{ grupo: "Glúteos", series: "12", max: "14" }, { grupo: "Costas", series: "10" }];
  return s;
};

describe("troca de fase", () => {
  it("progressão: puxa as fases, o volume e o que continua igual da estratégia", () => {
    const pc = phaseChangeDefaults(state());
    expect([pc.deNome, pc.paraNome, pc.semanas]).toEqual(["Adaptação", "Intensificação", "4"]);
    expect(phaseTitle(pc)).toBe("Fase 2 · Intensificação");
    expect(pc.volume).toEqual([
      { grupo: "Glúteos", antes: "12 a 14", agora: "" },
      { grupo: "Costas", antes: "10", agora: "" },
    ]);
    expect(linesOf(pc.mantem)).toEqual(expect.arrayContaining(["4 treinos por semana", "A divisão dos treinos (ABCD)", "As prioridades: Glúteos, Costas"]));
    expect(phaseTimeline(state(), pc).map((f) => f.status)).toEqual(["feita", "atual", "proxima"]);
    expect(phaseTimeline(state(), { ...pc, faseNumero: 3 }).map((f) => f.status)).toEqual(["feita", "feita", "atual"]);
  });

  it("mudança de foco: força → hipertrofia traz a tabela antes/agora e o que esperar", () => {
    const pc = phaseChangeDefaults(state(), { tipo: "foco", focoDe: "Força", focoPara: "Hipertrofia" });
    expect([pc.deNome, pc.paraNome]).toEqual(["Força", "Hipertrofia"]);
    expect(pc.mudancas.find((m) => m.item === "Repetições")).toEqual({ item: "Repetições", antes: "3 a 6", agora: "8 a 12" });
    expect(pc.mudancas.find((m) => m.item === "Descanso")?.agora).toBe("60 a 90 segundos");
    expect(pc.normal).toContain("A carga cai");
    expect(pc.porque).toContain("ficou mais forte");
    // sem depender da periodização: o mapa mostra só a troca
    expect(phaseTimeline(state(), pc).map((f) => f.nome)).toEqual(["Força", "Hipertrofia"]);
    const r = phaseChangeDefaults(state(), { tipo: "foco", focoDe: "Hipertrofia", focoPara: "Resistência" });
    expect(r.mudancas.find((m) => m.item === "Repetições")?.agora).toBe("15 a 20");
  });

  it("só mostra no documento o volume que muda e calcula a próxima troca", () => {
    const pc = phaseChangeDefaults(state());
    pc.volume[0].agora = "16";
    expect(filledVolume(pc).map((v) => v.grupo)).toEqual(["Glúteos"]);
    const prox = nextChangeDate({ ...pc, inicio: "2026-11-16", semanas: "4" });
    expect([prox?.getDate(), prox?.getMonth()]).toEqual([14, 11]);
    expect(nextChangeDate({ ...pc, semanas: "" })).toBeNull();
  });

  it("versão WhatsApp traz conquistas, mudanças, técnicas explicadas e trocas", () => {
    const pc = phaseChangeDefaults(state());
    pc.conquistas = "- Fez 15 dos 16 treinos\nAgachamento: 40 kg → 55 kg";
    pc.tecnicas = ["Bi-set"];
    pc.volume[0].agora = "16";
    pc.trocas = [{ sai: "Leg press", entra: "Hack", motivo: "mais quadríceps" }, { sai: "", entra: "", motivo: "" }];
    const t = phaseChangeWhatsapp(state(), pc);
    expect(t).toContain("Carol, você fechou a fase *Adaptação* e agora começa a *Fase 2 · Intensificação*");
    expect(t).toContain("👉 Fase 2 · Intensificação _(você está aqui)_");
    expect(t).toContain("✓ Fez 15 dos 16 treinos");
    expect(t).toContain("*Bi-set*: dois exercícios do mesmo músculo");
    expect(t).toContain("• Glúteos: 12 a 14 → 16");
    expect(t).not.toContain("Costas: 10");
    expect(t).toContain("• Leg press → Hack _(mais quadríceps)_");
    expect(t).toContain("Próxima troca de fase prevista");
  });
});
