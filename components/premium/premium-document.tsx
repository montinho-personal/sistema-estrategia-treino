import type { RefObject } from "react";

import type { StrategyState } from "@/lib/domain/schema";
import type { Brand } from "@/lib/domain/schema/brand";
import { reportSections } from "@/lib/domain";
import { PREMIUM_CSS } from "@/lib/premium/premium-css";
import {
  CoverPage,
  ResumoPage,
  PartidaPage,
  MontagemPage,
  JornadaPage,
  DetalhamentoPage,
  EncerramentoPage,
} from "./premium-pages";

export function PremiumDocument({
  state,
  brand,
  containerRef,
  anexo = false,
}: {
  state: StrategyState;
  brand: Brand;
  containerRef?: RefObject<HTMLDivElement | null>;
  /** Inclui no fim a estratégia em texto corrido (o mesmo conteúdo da versão WhatsApp). */
  anexo?: boolean;
}) {
  const showDetail = anexo && reportSections(state).length > 0;
  const total = showDetail ? 7 : 6;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PREMIUM_CSS }} />
      <div className="premium" ref={containerRef}>
        <CoverPage state={state} brand={brand} />
        <ResumoPage state={state} brand={brand} n={2} total={total} />
        <PartidaPage state={state} brand={brand} n={3} total={total} />
        <MontagemPage state={state} brand={brand} n={4} total={total} />
        <JornadaPage state={state} brand={brand} n={5} total={total} />
        <EncerramentoPage state={state} brand={brand} n={6} total={total} />
        {showDetail && <DetalhamentoPage state={state} brand={brand} n={7} total={total} />}
      </div>
    </>
  );
}
