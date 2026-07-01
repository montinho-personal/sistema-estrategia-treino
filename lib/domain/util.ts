/** Utilitários puros compartilhados pelo domínio. */

/** Um valor está "preenchido"? (array não vazio ou string não vazia). */
export function has(v: unknown): boolean {
  if (Array.isArray(v)) return v.length > 0;
  return v != null && String(v).trim() !== "";
}

/** String em minúsculas, tolerante a null/undefined. */
export function low(v: unknown): string {
  return String(v ?? "").toLowerCase();
}

/** Normaliza para string: arrays viram lista separada por vírgula. */
export function val(v: unknown): string {
  if (Array.isArray(v)) return v.join(", ");
  return v == null ? "" : String(v).trim();
}

/** Junta valores num texto único (arrays achatados por espaço) para regex. */
export function joinWords(...vals: unknown[]): string {
  return vals
    .map((x) => (Array.isArray(x) ? x.join(" ") : String(x ?? "")))
    .join(" ");
}

export function firstName(nome: unknown): string {
  return val(nome).split(/\s+/)[0] || "aluno";
}

export function lowerFirst(s: unknown): string {
  const c = val(s);
  return c ? c.charAt(0).toLowerCase() + c.slice(1) : c;
}

export function upperFirst(s: unknown): string {
  const c = val(s);
  return c ? c.charAt(0).toUpperCase() + c.slice(1) : c;
}

/** Número inteiro a partir de string de anamnese (ou 0). */
export function toInt(v: unknown): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
}
