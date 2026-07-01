import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StepHeader, ActionBar } from "@/components/workspace/step-header";
import { AnamneseForm } from "@/components/anamnese/anamnese-form";
import { Hydrated } from "@/components/common/hydrated";
import { PanelSkeleton } from "@/components/common/panel-skeleton";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Anamnese" };

export default function AnamnesePage() {
  return (
    <>
      <StepHeader
        step="anamnese"
        title="Anamnese do aluno"
        description="Preencha o que você já sabe sobre o aluno. Tudo é salvo automaticamente neste navegador. A partir daqui, a entrevista se adapta a este perfil."
      />
      <Hydrated fallback={<PanelSkeleton rows={3} />}>
        <AnamneseForm />
      </Hydrated>
      <ActionBar>
        <p className="text-sm text-muted-foreground">
          Você pode voltar e ajustar a qualquer momento.
        </p>
        <span className="flex-1" />
        <Button asChild size="lg">
          <Link href="/alunos/diagnostico">
            Analisar anamnese <ArrowRight className="size-4" />
          </Link>
        </Button>
      </ActionBar>
    </>
  );
}
