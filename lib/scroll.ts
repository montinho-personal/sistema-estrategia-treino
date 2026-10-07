/**
 * Rolagem que respeita os cabeçalhos fixos (menu + etapas, marcados com
 * data-sticky): o conteúdo aparece logo abaixo deles, nunca escondido.
 */

/** Base da pilha de cabeçalhos fixos, em px a partir do topo da tela. */
export function stickyOffset(): number {
  let bottom = 0;
  document.querySelectorAll<HTMLElement>("[data-sticky]").forEach((el) => {
    bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
  });
  return bottom;
}

/** Rola até o topo do elemento, logo abaixo dos cabeçalhos fixos. */
export function scrollToElement(el: HTMLElement, smooth = true): void {
  const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset() - 12;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(0, top), behavior: smooth && !reduce ? "smooth" : "auto" });
}
