import { describe, it, expect, beforeEach } from "vitest";

import { useStrategyStore } from "../strategy-store";
import { useHistoryStore } from "../history-store";
import { autoSaveStrategy, hasUnsavedWork, replacePreviousVersion } from "../autosave";

const st = () => useStrategyStore.getState();
const snaps = () => useHistoryStore.getState().snapshots;

beforeEach(() => {
  st().reset();
  useHistoryStore.setState({ snapshots: [] });
});

describe("salvamento automático no histórico", () => {
  it("não guarda estratégia vazia", () => {
    expect(autoSaveStrategy(st()).kind).toBe("skip");
    expect(snaps()).toHaveLength(0);
  });

  it("salva ao gerar e não duplica ao gerar de novo", () => {
    st().setAnamnese("nome", "Ana");
    st().setAnswer("divisao_qual", "ABC");
    expect(hasUnsavedWork()).toBe(true);
    expect(autoSaveStrategy(st()).kind).toBe("created");
    expect(hasUnsavedWork()).toBe(false);
    expect(autoSaveStrategy(st()).kind).toBe("unchanged");

    st().setAnswer("divisao_qual", "ABCD");
    const r = autoSaveStrategy(st());
    expect(r.kind).toBe("updated");
    expect(snaps()).toHaveLength(1);
    expect(snaps()[0].answers.divisao_qual).toBe("ABCD");
  });

  it("atualizar mantém a data original (ordem dos ciclos)", () => {
    st().setAnamnese("nome", "Ana");
    autoSaveStrategy(st());
    useHistoryStore.setState({ snapshots: [{ ...snaps()[0], savedAt: "2026-01-10T12:00:00.000Z" }] });
    st().setAnswer("divisao_qual", "ABC");
    autoSaveStrategy(st());
    expect(snaps()[0].savedAt).toBe("2026-01-10T12:00:00.000Z");
    expect(snaps()[0].updatedAt).toBeTruthy();
  });

  it("estratégia aberta do histórico nunca é sobrescrita sozinha: vira nova versão", () => {
    const old = useHistoryStore.getState().addSnapshot({
      nome: "Ana",
      savedAt: "2026-01-10T12:00:00.000Z",
      anamnese: { nome: "Ana" },
      answers: { divisao_qual: "ABC" },
      overrides: {},
    });
    st().loadSnapshot(old, old.id);
    expect(autoSaveStrategy(st()).kind).toBe("unchanged");

    st().setAnswer("divisao_qual", "Full Body");
    const r = autoSaveStrategy(st());
    expect(r.kind).toBe("version");
    expect(snaps()).toHaveLength(2);
    expect(snaps().find((s) => s.id === old.id)?.answers.divisao_qual).toBe("ABC");

    // gerar de novo atualiza a nova versão, não cria outra
    st().setAnswer("divisao_qual", "Upper / Lower");
    expect(autoSaveStrategy(st()).kind).toBe("updated");
    expect(snaps()).toHaveLength(2);

    // "Substituir a anterior": aplica na entrada antiga e remove a cópia
    if (r.kind === "version") replacePreviousVersion(st(), r);
    expect(snaps()).toHaveLength(1);
    expect(snaps()[0].id).toBe(old.id);
    expect(snaps()[0].answers.divisao_qual).toBe("Upper / Lower");
    expect(st().sourceId).toBe(old.id);
  });

  it("relatório importado entra com a data e a origem informadas", () => {
    const snap = useHistoryStore.getState().addSnapshot({
      savedAt: "2025-11-03T12:00:00.000Z",
      origem: "importado",
      anamnese: { nome: "Galo" },
      answers: { divisao_qual: "ABC" },
      overrides: {},
      volume: [{ grupo: "Costas", series: "12" }],
    });
    expect(snap.nome).toBe("Galo");
    expect(snap.origem).toBe("importado");
    expect(snap.savedAt).toBe("2025-11-03T12:00:00.000Z");
  });
});
