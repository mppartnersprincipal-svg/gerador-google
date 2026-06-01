"use client";

import { Megaphone } from "lucide-react";
import { CharCounter } from "@/components/shared/CharCounter";
import { GOOGLE_ADS_LIMITS } from "@/lib/constants/limits";
import type { RSAd } from "@/types/campaign";

const L = GOOGLE_ADS_LIMITS;

export function AdCard({ ad, index }: { ad: RSAd; index: number }) {
  const pinByHeadline = new Map(
    ad.pinRecommendations.map((p) => [p.headlineIndex, p.position])
  );

  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <Megaphone className="h-4 w-4" />
        Anúncio RSA {index + 1}
      </div>

      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
        Títulos ({ad.headlines.length})
      </p>
      <ul className="mb-4 space-y-1">
        {ad.headlines.map((h, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-0"
          >
            <span className="text-sm">
              {h}
              {pinByHeadline.has(i) && (
                <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  pin {pinByHeadline.get(i)}
                </span>
              )}
            </span>
            <CharCounter length={h.length} max={L.HEADLINE_MAX_CHARS} />
          </li>
        ))}
      </ul>

      <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">
        Descrições ({ad.descriptions.length})
      </p>
      <ul className="mb-4 space-y-1">
        {ad.descriptions.map((d, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-0"
          >
            <span className="text-sm">{d}</span>
            <CharCounter length={d.length} max={L.DESCRIPTION_MAX_CHARS} />
          </li>
        ))}
      </ul>

      <p className="text-xs text-muted-foreground">
        URL de exibição:{" "}
        <span className="font-mono">
          /{ad.displayUrlPath[0]}/{ad.displayUrlPath[1]}
        </span>
      </p>
    </div>
  );
}
