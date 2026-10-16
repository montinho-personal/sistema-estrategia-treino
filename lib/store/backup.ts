import type { Preference } from "@/lib/domain/voice";
import { useDnaStore, type StyleSample } from "./dna-store";
import { HISTORY_LIMIT, useHistoryStore, type StrategySnapshot } from "./history-store";
import { usePreferencesStore } from "./preferences-store";

/**
 * Backup do aprendizado: histórico de estratégias, princípios, amostras de
 * escrita e preferências. Os dados vivem só no navegador — o backup é o jeito
 * de levá-los de um aparelho para outro (ex.: do PC para o celular).
 */
const APP = "montinho-training-strategy";

interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  history: StrategySnapshot[];
  dna: { principles: string; samples: StyleSample[] };
  prefs: Record<string, Preference>;
}

export function exportBackup(): void {
  const dna = useDnaStore.getState();
  const data: BackupFile = {
    app: APP,
    version: 1,
    exportedAt: new Date().toISOString(),
    history: useHistoryStore.getState().snapshots,
    dna: { principles: dna.principles, samples: dna.samples },
    prefs: usePreferencesStore.getState().prefs,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `montinho-backup-${data.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Mescla um backup com os dados deste aparelho (nunca apaga o que já existe). */
export function importBackup(json: string): { added: number } {
  let data: Partial<BackupFile>;
  try {
    data = JSON.parse(json) as Partial<BackupFile>;
  } catch {
    throw new Error("O arquivo não é um backup válido.");
  }
  if (data.app !== APP || !Array.isArray(data.history)) {
    throw new Error("Este arquivo não é um backup do Montinho Training Strategy.");
  }

  const current = useHistoryStore.getState().snapshots;
  const ids = new Set(current.map((s) => s.id));
  const novos = data.history.filter((s) => s && s.id && !ids.has(s.id));
  const snapshots = [...current, ...novos]
    .sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)))
    .slice(0, HISTORY_LIMIT);
  useHistoryStore.setState({ snapshots });

  const dna = useDnaStore.getState();
  const vindo = String(data.dna?.principles ?? "").trim();
  const atual = dna.principles.trim();
  const principles = !atual ? vindo : !vindo || atual.includes(vindo) ? atual : `${atual}\n\n${vindo}`;
  const textos = new Set(dna.samples.map((s) => s.t));
  const samples = [...dna.samples, ...(data.dna?.samples ?? []).filter((s) => s?.t && !textos.has(s.t))]
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, 20);
  useDnaStore.setState({ principles, samples });

  const prefs = { ...usePreferencesStore.getState().prefs };
  for (const [id, p] of Object.entries(data.prefs ?? {})) {
    const cur = prefs[id];
    prefs[id] = cur ? { ...cur, count: Math.max(cur.count ?? 0, p.count ?? 0) } : p;
  }
  usePreferencesStore.setState({ prefs });

  return { added: novos.length };
}
