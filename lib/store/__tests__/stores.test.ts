import { describe, it, expect, beforeEach } from "vitest";

import { useStrategyStore } from "../strategy-store";
import { useBrandStore } from "../brand-store";
import { usePreferencesStore, toPrefList } from "../preferences-store";
import { useHistoryStore } from "../history-store";
import { useAiStore } from "../ai-store";

beforeEach(() => {
  useStrategyStore.getState().reset();
  useBrandStore.getState().resetBrand();
  usePreferencesStore.getState().clearPreferences();
  useHistoryStore.setState({ snapshots: [] });
  useAiStore.getState().clearConfig();
});

describe("strategyStore", () => {
  it("registra anamnese e respostas", () => {
    const s = useStrategyStore.getState();
    s.setAnamnese("nome", "Marina");
    s.setAnswer("objetivo_principal", "Hipertrofia");
    s.setAnswer("intensidade_tecnicas", ["RIR", "Cadência"]);
    const st = useStrategyStore.getState();
    expect(st.anamnese.nome).toBe("Marina");
    expect(st.answers.objetivo_principal).toBe("Hipertrofia");
    expect(st.answers.intensidade_tecnicas).toEqual(["RIR", "Cadência"]);
    expect(st.updatedAt).not.toBeNull();
  });

  it("override vazio remove a seção editada", () => {
    const s = useStrategyStore.getState();
    s.setOverride("objetivo", "Editado");
    expect(useStrategyStore.getState().overrides.objetivo).toBe("Editado");
    s.setOverride("objetivo", "");
    expect(useStrategyStore.getState().overrides.objetivo).toBeUndefined();
  });

  it("reset devolve o estado inicial", () => {
    useStrategyStore.getState().setAnamnese("nome", "X");
    useStrategyStore.getState().reset();
    expect(useStrategyStore.getState().anamnese).toEqual({});
    expect(useStrategyStore.getState().step).toBe("anamnese");
  });
});

describe("preferencesStore", () => {
  it("aprende e ordena preferências por frequência", () => {
    const s = usePreferencesStore.getState();
    s.learnPreference("drop_set", "Drop-set", "iniciante");
    s.learnPreference("piramide_decrescente", "Pirâmide decrescente");
    s.learnPreference("piramide_decrescente", "Pirâmide decrescente");
    const list = toPrefList(usePreferencesStore.getState().prefs);
    expect(list[0].id).toBe("piramide_decrescente");
    expect(list[0].count).toBe(2);
  });
});

describe("historyStore", () => {
  it("salva e remove snapshots da estratégia", () => {
    useStrategyStore.getState().setAnamnese("nome", "Carlos Lima");
    const snap = useHistoryStore.getState().saveSnapshot(useStrategyStore.getState());
    expect(snap.nome).toBe("Carlos Lima");
    expect(useHistoryStore.getState().snapshots).toHaveLength(1);
    useHistoryStore.getState().deleteSnapshot(snap.id);
    expect(useHistoryStore.getState().snapshots).toHaveLength(0);
  });
});

describe("brandStore & aiStore", () => {
  it("marca tem padrão do Montinho e é editável", () => {
    expect(useBrandStore.getState().brand.nome).toBe("Montinho Personal Trainer");
    useBrandStore.getState().setBrand({ nome: "Montinho", whatsapp: "119", site: "", instagram: "@x", logo: "" });
    expect(useBrandStore.getState().brand.instagram).toBe("@x");
  });

  it("ia começa desconfigurada e liga com a chave", () => {
    expect(useAiStore.getState().configured()).toBe(false);
    useAiStore.getState().setConfig({ key: "sk-ant-xxx" });
    expect(useAiStore.getState().configured()).toBe(true);
  });
});
