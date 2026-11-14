import { PhaseWorkspace } from "@/components/fase/phase-workspace";
import { Hydrated } from "@/components/common/hydrated";
import { PanelSkeleton } from "@/components/common/panel-skeleton";

export const metadata = { title: "Troca de fase" };

export default function FasePage() {
  return (
    <>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Continuação do protocolo</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-[34px]">Troca de fase</h1>
        <p className="mt-2.5 max-w-[62ch] text-muted-foreground">
          O documento que o aluno recebe quando a fase muda: o que ele conquistou, por que o treino muda agora, o que
          muda e o que esperar. Preencha, confira e envie em PDF ou pelo WhatsApp.
        </p>
      </div>
      <Hydrated fallback={<PanelSkeleton rows={3} />}>
        <PhaseWorkspace />
      </Hydrated>
    </>
  );
}
