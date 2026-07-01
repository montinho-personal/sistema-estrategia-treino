import type { RefObject } from "react";

import type { StrategyState } from "@/lib/domain/schema";
import type { Brand } from "@/lib/domain/schema/brand";
import { PREMIUM_CSS } from "@/lib/premium/premium-css";
import {
  CoverPage,
  DiagnosticoPage,
  EstrategiaPage,
  EvolucaoPage,
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
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PREMIUM_CSS }} />
      <div className="premium" ref={containerRef}>
        <CoverPage state={state} brand={brand} />
        <DiagnosticoPage state={state} brand={brand} />
        <EstrategiaPage state={state} brand={brand} />
        <EvolucaoPage state={state} brand={brand} />
        <EncerramentoPage state={state} brand={brand} />
      </div>
    </>
  );
}
