"use client";

import { Megaphone } from "lucide-react";
import { CharCounter } from "@/components/shared/CharCounter";
import { CopyButton } from "@/components/shared/CopyButton";
import { EditableLine } from "@/components/shared/EditableLine";
import { GOOGLE_ADS_LIMITS } from "@/lib/constants/limits";
import type { RSAd } from "@/types/campaign";

const L = GOOGLE_ADS_LIMITS;

export function AdCard({
  ad,
  index,
  editable,
  onChange,
}: {
  ad: RSAd;
  index: number;
  editable?: boolean;
  onChange?: (ad: RSAd) => void;
}) {
  const pinByHeadline = new Map(
    ad.pinRecommendations.map((p) => [p.headlineIndex, p.position])
  );

  const setHeadline = (i: number, v: string) =>
    onChange?.({
      ...ad,
      headlines: ad.headlines.map((h, j) => (j === i ? v : h)),
    });

  const setDescription = (i: number, v: string) =>
    onChange?.({
      ...ad,
      descriptions: ad.descriptions.map((d, j) => (j === i ? v : d)),
    });

  const setPath = (i: 0 | 1, v: string) =>
    onChange?.({
      ...ad,
      displayUrlPath: (i === 0
        ? [v, ad.displayUrlPath[1]]
        : [ad.displayUrlPath[0], v]) as [string, string],
    });

  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <Megaphone className="h-4 w-4" />
        Anúncio RSA {index + 1}
      </div>

      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Títulos ({ad.headlines.length})
        </p>
        <CopyButton
          getText={() => ad.headlines.join("\n")}
          label="Copiar títulos"
        />
      </div>
      <ul className="mb-4 space-y-1">
        {ad.headlines.map((h, i) =>
          editable ? (
            <li key={i}>
              <EditableLine
                value={h}
                max={L.HEADLINE_MAX_CHARS}
                onChange={(v) => setHeadline(i, v)}
              />
            </li>
          ) : (
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
          )
        )}
      </ul>

      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Descrições ({ad.descriptions.length})
        </p>
        <CopyButton
          getText={() => ad.descriptions.join("\n")}
          label="Copiar descrições"
        />
      </div>
      <ul className="mb-4 space-y-1">
        {ad.descriptions.map((d, i) =>
          editable ? (
            <li key={i}>
              <EditableLine
                value={d}
                max={L.DESCRIPTION_MAX_CHARS}
                onChange={(v) => setDescription(i, v)}
              />
            </li>
          ) : (
            <li
              key={i}
              className="flex items-center justify-between gap-2 border-b border-border/50 py-1 last:border-0"
            >
              <span className="text-sm">{d}</span>
              <CharCounter length={d.length} max={L.DESCRIPTION_MAX_CHARS} />
            </li>
          )
        )}
      </ul>

      {editable ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">URL de exibição: /</span>
          <input
            value={ad.displayUrlPath[0]}
            maxLength={L.DISPLAY_URL_PATH_MAX_CHARS}
            onChange={(e) => setPath(0, e.target.value)}
            className="w-24 rounded-sm border-b border-dashed border-border bg-transparent px-1 py-0.5 font-mono text-xs outline-none focus:border-primary"
          />
          <span className="text-xs text-muted-foreground">/</span>
          <input
            value={ad.displayUrlPath[1]}
            maxLength={L.DISPLAY_URL_PATH_MAX_CHARS}
            onChange={(e) => setPath(1, e.target.value)}
            className="w-24 rounded-sm border-b border-dashed border-border bg-transparent px-1 py-0.5 font-mono text-xs outline-none focus:border-primary"
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          URL de exibição:{" "}
          <span className="font-mono">
            /{ad.displayUrlPath[0]}/{ad.displayUrlPath[1]}
          </span>
        </p>
      )}
    </div>
  );
}
