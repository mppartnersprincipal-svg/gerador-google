"use client";

import { Layers, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CharCounter } from "@/components/shared/CharCounter";
import { EditableLine } from "@/components/shared/EditableLine";
import { PMAX_LIMITS } from "@/lib/constants/limits";
import type { PMaxAssetGroup } from "@/types/campaign";

const P = PMAX_LIMITS;

function AssetList({
  title,
  items,
  max,
  editable,
  onItemChange,
}: {
  title: string;
  items: string[];
  max: number;
  editable?: boolean;
  onItemChange?: (i: number, v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
        {title} ({items.length})
      </p>
      <ul className="space-y-1">
        {items.map((t, i) =>
          editable ? (
            <li key={i}>
              <EditableLine
                value={t}
                max={max}
                onChange={(v) => onItemChange?.(i, v)}
              />
            </li>
          ) : (
            <li
              key={i}
              className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-0"
            >
              <span className="text-sm">{t}</span>
              <CharCounter length={t.length} max={max} />
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export function PMaxSection({
  pmax,
  editable,
  onChange,
  onRegenerate,
  regenerating,
}: {
  pmax: PMaxAssetGroup;
  editable?: boolean;
  onChange?: (pmax: PMaxAssetGroup) => void;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  const setList = (
    key: "shortHeadlines" | "longHeadlines" | "descriptions",
    i: number,
    v: string
  ) =>
    onChange?.({
      ...pmax,
      [key]: pmax[key].map((x, j) => (j === i ? v : x)),
    });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Performance Max — Asset Group
        </CardTitle>
        {editable && onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={regenerating}
            title="Regerar o asset group de Performance Max com a IA"
          >
            {regenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regerar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <AssetList
          title="Títulos curtos"
          items={pmax.shortHeadlines}
          max={P.SHORT_HEADLINE_MAX_CHARS}
          editable={editable}
          onItemChange={(i, v) => setList("shortHeadlines", i, v)}
        />
        <AssetList
          title="Títulos longos"
          items={pmax.longHeadlines}
          max={P.LONG_HEADLINE_MAX_CHARS}
          editable={editable}
          onItemChange={(i, v) => setList("longHeadlines", i, v)}
        />
        <AssetList
          title="Descrições"
          items={pmax.descriptions}
          max={P.DESCRIPTION_MAX_CHARS}
          editable={editable}
          onItemChange={(i, v) => setList("descriptions", i, v)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Nome do anunciante</p>
              {editable ? (
                <EditableLine
                  value={pmax.businessName}
                  max={P.BUSINESS_NAME_MAX_CHARS}
                  onChange={(v) => onChange?.({ ...pmax, businessName: v })}
                />
              ) : (
                <p className="text-sm font-medium">{pmax.businessName}</p>
              )}
            </div>
            {!editable && (
              <CharCounter
                length={pmax.businessName.length}
                max={P.BUSINESS_NAME_MAX_CHARS}
              />
            )}
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">URL final</p>
            {editable ? (
              <input
                value={pmax.finalUrl}
                onChange={(e) => onChange?.({ ...pmax, finalUrl: e.target.value })}
                className="w-full rounded-sm border-b border-dashed border-border bg-transparent px-1 py-0.5 font-mono text-sm outline-none focus:border-primary"
              />
            ) : (
              <p className="truncate font-mono text-sm">{pmax.finalUrl}</p>
            )}
          </div>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Sinal de público</p>
          {editable ? (
            <textarea
              value={pmax.audienceSignal}
              rows={2}
              onChange={(e) =>
                onChange?.({ ...pmax, audienceSignal: e.target.value })
              }
              className="w-full resize-y rounded-sm border border-dashed border-border bg-transparent px-1 py-0.5 text-sm outline-none focus:border-primary"
            />
          ) : (
            <p className="text-sm">{pmax.audienceSignal}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
