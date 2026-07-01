import { StepPlaceholder } from "@/components/workspace/step-placeholder";

export const metadata = { title: "Relatório" };

export default function RelatorioPage() {
  return (
    <StepPlaceholder
      step="relatorio"
      title="Relatório"
      description="Apresentação profissional editável, com preview idêntico à exportação (PDF, WhatsApp e HTML)."
      phase="Fase 7"
    />
  );
}
