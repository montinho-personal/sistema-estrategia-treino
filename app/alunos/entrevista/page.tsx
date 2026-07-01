import { StepPlaceholder } from "@/components/workspace/step-placeholder";

export const metadata = { title: "Entrevista" };

export default function EntrevistaPage() {
  return (
    <StepPlaceholder
      step="entrevista"
      title="Entrevista"
      description="Uma conversa, uma pergunta por vez, com o dashboard 'Estratégia em construção' e o relatório em tempo real."
      phase="Fase 5"
    />
  );
}
