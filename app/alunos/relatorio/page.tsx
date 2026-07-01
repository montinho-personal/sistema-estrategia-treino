import { StepHeader } from "@/components/workspace/step-header";
import { ReportWorkspace } from "@/components/report/report-workspace";
import { Hydrated } from "@/components/common/hydrated";
import { PanelSkeleton } from "@/components/common/panel-skeleton";

export const metadata = { title: "Relatório" };

export default function RelatorioPage() {
  return (
    <>
      <StepHeader
        step="relatorio"
        title="Relatório"
        description="Uma apresentação profissional que responde ao aluno: qual é o objetivo, por que o treino foi montado assim e como vamos chegar lá. Revise, ajuste e gere as versões finais."
      />
      <Hydrated fallback={<PanelSkeleton rows={3} />}>
        <ReportWorkspace />
      </Hydrated>
    </>
  );
}
