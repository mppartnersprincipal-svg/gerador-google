"use client";

import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CharCounter } from "@/components/shared/CharCounter";
import { PMAX_LIMITS } from "@/lib/constants/limits";
import type { PMaxAssetGroup } from "@/types/campaign";

const P = PMAX_LIMITS;

function AssetList({
  title,
  items,
  max,
}: {
  title: string;
  items: string[];
  max: number;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
        {title} ({items.length})
      </p>
      <ul className="space-y-1">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-0"
          >
            <span className="text-sm">{t}</span>
            <CharCounter length={t.length} max={max} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PMaxSection({ pmax }: { pmax: PMaxAssetGroup }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Performance Max — Asset Group
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AssetList
          title="Títulos curtos"
          items={pmax.shortHeadlines}
          max={P.SHORT_HEADLINE_MAX_CHARS}
        />
        <AssetList
          title="Títulos longos"
          items={pmax.longHeadlines}
          max={P.LONG_HEADLINE_MAX_CHARS}
        />
        <AssetList
          title="Descrições"
          items={pmax.descriptions}
          max={P.DESCRIPTION_MAX_CHARS}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-3">
            <div>
              <p className="text-xs text-muted-foreground">Nome do anunciante</p>
              <p className="text-sm font-medium">{pmax.businessName}</p>
            </div>
            <CharCounter
              length={pmax.businessName.length}
              max={P.BUSINESS_NAME_MAX_CHARS}
            />
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">URL final</p>
            <p className="truncate font-mono text-sm">{pmax.finalUrl}</p>
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Sinal de público</p>
          <p className="text-sm">{pmax.audienceSignal}</p>
        </div>
      </CardContent>
    </Card>
  );
}
