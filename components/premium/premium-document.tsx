import type { RefObject } from "react";

import type { StrategyState } from "@/lib/domain/schema";
import type { Brand } from "@/lib/domain/schema/brand";
import { reportSections } from "@/lib/domain";
import { PREMIUM_CSS } from "@/lib/premium/premium-css";
import {
  CoverPage,
  DiagnosticoPage,
  EstrategiaPage,
  EvolucaoPage,
  DetalhamentoPage,
  EncerramentoPage,
} from "./premium-pages";

export function PremiumDocument({
  state,
  brand,
  containerRef,
}: {
  state: StrategyState;
  brand: Brand;
  containerRef?: RefObject<HTMLDivElement | null>;
}) {
  const showDetail = reportSections(state).length > 0;
  const total = showDetail ? 6 : 5;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PREMIUM_CSS }} />
      <div className="premium" ref={containerRef}>
        <CoverPage state={state} brand={brand} />
        <DiagnosticoPage state={state} brand={brand} n={2} total={total} />
        <EstrategiaPage state={state} brand={brand} n={3} total={total} />
        <EvolucaoPage state={state} brand={brand} n={4} total={total} />
        {showDetail && <DetalhamentoPage state={state} brand={brand} n={5} total={total} />}
        <EncerramentoPage state={state} brand={brand} n={showDetail ? 6 : 5} total={total} />
      </div>
    </>
  );
}
