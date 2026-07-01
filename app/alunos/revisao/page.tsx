import { StepPlaceholder } from "@/components/workspace/step-placeholder";

export const metadata = { title: "Revisão" };

export default function RevisaoPage() {
  return (
    <StepPlaceholder
      step="revisao"
      title="Revisão final"
      description="Checklist por área antes de gerar o relatório — nunca geramos um documento incompleto."
      phase="Fase 5"
    />
  );
}
