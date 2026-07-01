import Link from "next/link";

import { BrandLockup } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#filosofia", label: "Filosofia" },
  { href: "#fluxo", label: "Como funciona" },
  { href: "#modulos", label: "Módulos" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-transparent bg-bg/70 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <Link href="/" aria-label="Montinho Training Strategy">
          <BrandLockup />
        </Link>
        <div className="flex items-center gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link href="/alunos">Abrir workspace</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
