import { StepHeader } from "@/components/workspace/step-header";
import { RevisaoView } from "@/components/revisao/revisao-view";
import { Hydrated } from "@/components/common/hydrated";
import { PanelSkeleton } from "@/components/common/panel-skeleton";

export const metadata = { title: "Revisão" };

export default function RevisaoPage() {
  return (
    <>
      <StepHeader
        step="revisao"
        title="Revisão final"
        description="Antes de gerar as versões finais, confirmamos que todas as áreas foram respondidas. Nunca geramos um relatório incompleto."
      />
      <Hydrated fallback={<PanelSkeleton rows={3} />}>
        <RevisaoView />
      </Hydrated>
    </>
  );
}
