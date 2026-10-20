import { val } from "./util";

/**
 * Dados de contato e nascimento do aluno: normalização para a ferramenta e
 * para o aplicativo de treino (datas em AAAA-MM-DD, WhatsApp só com dígitos).
 */

/** Data de nascimento → AAAA-MM-DD (aceita DD/MM/AAAA, DD-MM-AAAA, DD.MM.AA e AAAA-MM-DD). */
export function birthDateIso(v: unknown): string | null {
  const s = val(v);
  let y = 0, m = 0, d = 0;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const br = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
  if (iso) [y, m, d] = [+iso[1], +iso[2], +iso[3]];
  else if (br) {
    [d, m, y] = [+br[1], +br[2], +br[3]];
    if (br[3].length === 2) y += y > (new Date().getFullYear() % 100) ? 1900 : 2000;
  } else return null;
  const date = new Date(y, m - 1, d);
  if (y < 1900 || date.getMonth() !== m - 1 || date.getDate() !== d || date > new Date()) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Idade em anos completos a partir da data de nascimento (null se inválida). */
export function ageFromBirth(v: unknown, hoje = new Date()): number | null {
  const iso = birthDateIso(v);
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  let idade = hoje.getFullYear() - y;
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) idade--;
  return idade >= 0 && idade < 120 ? idade : null;
}

/** WhatsApp só com dígitos e DDI 55 quando faltar (ex.: 5511999999999). */
export function whatsappDigits(v: unknown): string | null {
  let n = val(v).replace(/\D/g, "");
  if (!n) return null;
  if (n.length === 10 || n.length === 11) n = `55${n}`;
  return n.length >= 12 && n.length <= 13 ? n : null;
}

/** E-mail limpo e em minúsculas (null se não parecer um e-mail). */
export function cleanEmail(v: unknown): string | null {
  const e = val(v).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}
