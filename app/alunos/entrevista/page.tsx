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
        description="Uma conversa, uma pergunta por vez. Cada resposta vira uma seção do relatório — e o sistema pergunta o porquê para explicar ao aluno."
      />
      <Hydrated fallback={<PanelSkeleton rows={2} />}>
        <InterviewWorkspace />
      </Hydrated>
    </>
  );
}
