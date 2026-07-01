import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BrandLockup } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Workspace" };

export default function AlunosPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <BrandLockup />
      <Badge variant="gold" className="mt-8">
        Em construção
      </Badge>
      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        O workspace está sendo portado
      </h1>
      <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
        A fundação da plataforma está pronta. Nas próximas fases, o fluxo
        completo — anamnese, diagnóstico, entrevista inteligente, memória
        estratégica e a entrega premium — chega aqui.
      </p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/">
          <ArrowLeft className="size-4" /> Voltar à página inicial
        </Link>
      </Button>
    </div>
  );
}
