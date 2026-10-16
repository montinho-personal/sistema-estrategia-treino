import { PainelView } from "@/components/painel/painel-view";
import { Hydrated } from "@/components/common/hydrated";
import { PanelSkeleton } from "@/components/common/panel-skeleton";

export const metadata = { title: "Painel do treinador" };

export default function PainelPage() {
  return (
    <>
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Visão macro</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-[34px]">Painel do treinador</h1>
        <p className="mt-2.5 max-w-[62ch] text-muted-foreground">
          Cruza todas as estratégias que você salvou para mostrar a sua metodologia — e ensina a IA a pensar,
          decidir e escrever do seu jeito.
        </p>
      </div>
      <Hydrated fallback={<PanelSkeleton rows={3} />}>
        <PainelView />
      </Hydrated>
    </>
  );
}
