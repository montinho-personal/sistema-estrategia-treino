import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

import { StepHeader, ActionBar } from "@/components/workspace/step-header";
import { DiagnosticoView } from "@/components/diagnostico/diagnostico-view";
import { Hydrated } from "@/components/common/hydrated";
import { PanelSkeleton } from "@/components/common/panel-skeleton";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Diagnóstico" };

export default function DiagnosticoPage() {
  return (
    <>
      <StepHeader
        step="diagnostico"
        title="Diagnóstico"
        description="Um retrato organizado do aluno, a partir da anamnese. Ainda não há estratégia — este resumo guia a entrevista, que se adapta ao que aparece aqui."
      />
      <Hydrated fallback={<PanelSkeleton rows={2} />}>
        <DiagnosticoView />
      </Hydrated>
      <ActionBar>
        <Button asChild variant="ghost">
          <Link href="/alunos/anamnese">
            <ArrowLeft className="size-4" /> Anamnese
          </Link>
        </Button>
        <span className="flex-1" />
        <Button asChild size="lg">
          <Link href="/alunos/entrevista">
            Iniciar entrevista <ArrowRight className="size-4" />
          </Link>
        </Button>
      </ActionBar>
    </>
  );
}
