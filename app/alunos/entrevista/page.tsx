import { StepHeader } from "@/components/workspace/step-header";
import { InterviewWorkspace } from "@/components/interview/interview-workspace";
import { Hydrated } from "@/components/common/hydrated";
import { PanelSkeleton } from "@/components/common/panel-skeleton";

export const metadata = { title: "Entrevista" };

export default function EntrevistaPage() {
  return (
    <>
      <StepHeader
        step="entrevista"
        title="Entrevista"
        description="Uma decisão essencial por tópico — rápido e direto. Quer detalhar o porquê? É só abrir “Aprofundar”; o que ficar em branco, a IA e a Biblioteca preenchem no relatório."
      />
      <Hydrated fallback={<PanelSkeleton rows={2} />}>
        <InterviewWorkspace />
      </Hydrated>
    </>
  );
}
