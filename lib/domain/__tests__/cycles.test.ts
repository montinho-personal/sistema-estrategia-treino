import { describe, it, expect } from "vitest";

import { studentsWithCycles, compareCycles, comparisonText } from "../cycles";
import type { StrategyRecord } from "../insights";

type Rec = StrategyRecord & { id: string };

const c1: Rec = {
  id: "c1",
  savedAt: "2026-06-01T10:00:00Z",
  anamnese: { nome: "Camila Ribeiro", objetivo: "Hipertrofia", diasSemana: "3", composicao: "62 kg", dores: "" },
  answers: {
    divisao_qual: "Full Body",
    volume_frequencia: "2x por semana",
    intensidade_estrategia: ["Pirâmide crescente", "Carga fixa"],
    cardio_have: "Sim",
  },
  volume: [{ grupo: "Glúteos", series: "10" }, { grupo: "Costas", series: "10" }, { grupo: "Braços", series: "6" }],
};
const c2: Rec = {
  id: "c2",
  savedAt: "2026-09-01T10:00:00Z",
  anamnese: { nome: "Camila Ribeiro", objetivo: "Hipertrofia", diasSemana: "4", composicao: "60 kg" },
  answers: {
    divisao_qual: "Lower / Upper / Lower / Full Body",
    volume_frequencia: "2x por semana",
    intensidade_estrategia: ["Pirâmide crescente", "Bi-set"],
    progressao_como: ["Dupla progressão (repetições → carga)"],
    divisao_porque: "Agora ela consegue treinar 4x e quer mais glúteo.",
  },
  volume: [{ grupo: "Glúteos", series: "14" }, { grupo: "Costas", series: "12" }, { grupo: "Quadríceps", series: "10" }],
};
const outra: Rec = { id: "x", savedAt: "2026-07-01T10:00:00Z", anamnese: { nome: "Ana" }, answers: { divisao_qual: "ABC" } };

describe("comparar ciclos do mesmo aluno", () => {
  it("agrupa só alunos com 2+ ciclos, do mais antigo para o mais recente", () => {
    const g = studentsWithCycles([c2, outra, c1]);
    expect(g).toHaveLength(1);
    expect(g[0].nome).toBe("Camila Ribeiro");
    expect(g[0].ciclos.map((c) => c.id)).toEqual(["c1", "c2"]);
  });

  it("mostra o que mudou, o que entrou/saiu e o que se manteve", () => {
    const c = compareCycles(c1, c2);
    const by = (id: string) => c.decisoes.find((d) => d.id === id)!;
    expect(by("divisao_qual")).toMatchObject({ status: "mudou", antes: ["Full Body"], depois: ["Lower / Upper / Lower / Full Body"] });
    expect(by("volume_frequencia").status).toBe("mantido");
    expect(by("intensidade_estrategia")).toMatchObject({ status: "mudou", entrou: ["Bi-set"], saiu: ["Carga fixa"] });
    expect(by("progressao_como").status).toBe("novo");
    expect(by("cardio_have").status).toBe("removido");
    expect(c.mantidas).toBe(1);
    expect(c.mudaram).toBe(4);
    expect(c.dias).toBe(92);
  });

  it("compara perfil e volume por grupo", () => {
    const c = compareCycles(c1, c2);
    expect(c.perfil.find((p) => p.id === "diasSemana")).toMatchObject({ antes: "3", depois: "4", mudou: true });
    expect(c.perfil.find((p) => p.id === "objetivo")?.mudou).toBe(false);
    expect(c.volume.find((v) => v.grupo === "Glúteos")).toMatchObject({ antes: 10, depois: 14, delta: 4 });
    expect(c.volume.find((v) => v.grupo === "Quadríceps")).toMatchObject({ antes: null, depois: 10, delta: null });
    expect(c.volume.find((v) => v.grupo === "Braços")).toMatchObject({ antes: 6, depois: null });
    expect([c.totalAntes, c.totalDepois]).toEqual([26, 36]);
  });

  it("texto para a IA traz mudanças, volume e os motivos do novo ciclo", () => {
    const t = comparisonText(compareCycles(c1, c2), c2);
    expect(t).toMatch(/Dias disponíveis por semana: 3 → 4/);
    expect(t).toMatch(/Full Body → Lower \/ Upper \/ Lower \/ Full Body/);
    expect(t).toMatch(/Volume semanal: 26 → 36 séries \(Glúteos \+4, Costas \+2\)/);
    expect(t).toMatch(/Agora ela consegue treinar 4x/);
  });
});
