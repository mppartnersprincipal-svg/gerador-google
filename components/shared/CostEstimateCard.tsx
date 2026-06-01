"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { estimateCost, formatBRL } from "@/lib/costEstimate";
import type { Keyword } from "@/types/keywords";

export function CostEstimateCard({
  keywords,
  monthlyBudget,
}: {
  keywords: Keyword[];
  monthlyBudget: number;
}) {
  const est = estimateCost(keywords, monthlyBudget);

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" />
          Estimativa de custo
        </div>

        {est.unavailable ? (
          <p className="text-sm text-muted-foreground">
            Sem dados de CPC — configure o DataForSEO para estimativas de custo.
          </p>
        ) : (
          <>
            <Metric label="Budget mensal" value={formatBRL(est.monthlyBudget)} />
            <Metric label="CPC médio" value={formatBRL(est.avgCpc)} />
            <Metric
              label="Cliques/mês (est.)"
              value={`~${est.estimatedClicks.toLocaleString("pt-BR")}`}
            />
            <span className="text-xs text-muted-foreground">
              baseado em {est.withCpc} keyword(s) com CPC
            </span>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
