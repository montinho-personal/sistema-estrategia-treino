import { BrandLockup } from "@/components/brand-mark";
import { IDENTITY } from "@/lib/site-content";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="space-y-3">
            <BrandLockup />
            <p className="max-w-[34ch] text-sm text-muted-foreground">
              {IDENTITY.slogan.join(" ")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="#filosofia" className="hover:text-foreground">Filosofia</a>
            <a href="#fluxo" className="hover:text-foreground">Como funciona</a>
            <a href="#modulos" className="hover:text-foreground">Módulos</a>
          </nav>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-border/60 pt-6 text-[13px] text-muted-foreground">
          <span>© {year} Renato Nascimento · {IDENTITY.brand}</span>
          <span>Estratégias inteligentes. Resultados consistentes.</span>
        </div>
      </div>
    </footer>
  );
}
