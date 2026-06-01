import type { Keyword } from "@/types/keywords";

export interface CostEstimate {
  /** CPC médio ponderado (R$) das keywords consideradas. */
  avgCpc: number;
  /** Quantas keywords tinham CPC para basear a estimativa. */
  withCpc: number;
  /** Cliques mensais estimados com o budget informado. */
  estimatedClicks: number;
  /** Budget mensal informado (R$). */
  monthlyBudget: number;
  /** true se nenhuma keyword tinha CPC (estimativa indisponível). */
  unavailable: boolean;
}

/**
 * Estimativa simples: cliques ≈ budget / CPC médio.
 * Usa apenas keywords com CPC conhecido (DataForSEO ou estimado pelo agente).
 */
export function estimateCost(
  keywords: Keyword[],
  monthlyBudget: number
): CostEstimate {
  const withCpcList = keywords.filter(
    (k) => typeof k.cpc === "number" && k.cpc! > 0
  );
  const withCpc = withCpcList.length;

  if (withCpc === 0) {
    return {
      avgCpc: 0,
      withCpc: 0,
      estimatedClicks: 0,
      monthlyBudget,
      unavailable: true,
    };
  }

  const avgCpc =
    withCpcList.reduce((sum, k) => sum + (k.cpc as number), 0) / withCpc;
  const estimatedClicks = avgCpc > 0 ? Math.round(monthlyBudget / avgCpc) : 0;

  return {
    avgCpc,
    withCpc,
    estimatedClicks,
    monthlyBudget,
    unavailable: false,
  };
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
