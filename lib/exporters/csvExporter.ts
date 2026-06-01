import { GOOGLE_ADS_LIMITS } from "@/lib/constants/limits";
import type { Campaign } from "@/types/campaign";
import type { MatchType } from "@/types/keywords";

/**
 * Exportador CSV no formato do Google Ads Editor (import em massa).
 * Substitui o "subir via Google Ads API" — gera um arquivo local que o
 * usuário importa diretamente no Editor (Account > Import).
 *
 * Cada linha é uma keyword OU um anúncio RSA; colunas não usadas ficam vazias
 * (o Editor ignora colunas vazias por linha).
 */

const L = GOOGLE_ADS_LIMITS;

const CRITERION_TYPE: Record<MatchType, string> = {
  exact: "Exact",
  phrase: "Phrase",
  broad: "Broad",
};

function esc(value: string | number | undefined): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildHeader(): string[] {
  const cols = ["Campaign", "Ad Group", "Keyword", "Criterion Type", "Ad type"];
  for (let i = 1; i <= L.HEADLINES_PER_AD; i++) cols.push(`Headline ${i}`);
  for (let i = 1; i <= L.DESCRIPTIONS_PER_AD; i++) cols.push(`Description ${i}`);
  cols.push("Path 1", "Path 2", "Final URL");
  return cols;
}

export function buildCampaignCsv(campaign: Campaign): string {
  const header = buildHeader();
  const campaignName = `${campaign.clientName} — Pesquisa`;
  const finalUrl = campaign.onboarding.websiteUrl;
  const rows: string[] = [header.map(esc).join(",")];

  const blank = (n: number) => Array(n).fill("");

  for (const group of campaign.adGroups) {
    // Linhas de keyword
    for (const k of group.keywords) {
      const row = [
        campaignName,
        group.name,
        k.term,
        CRITERION_TYPE[k.matchType],
        "", // Ad type
        ...blank(L.HEADLINES_PER_AD + L.DESCRIPTIONS_PER_AD),
        "", // Path 1
        "", // Path 2
        "", // Final URL
      ];
      rows.push(row.map(esc).join(","));
    }

    // Linhas de anúncio RSA
    for (const ad of group.ads) {
      const headlines = Array.from(
        { length: L.HEADLINES_PER_AD },
        (_, i) => ad.headlines[i] ?? ""
      );
      const descriptions = Array.from(
        { length: L.DESCRIPTIONS_PER_AD },
        (_, i) => ad.descriptions[i] ?? ""
      );
      const row = [
        campaignName,
        group.name,
        "", // Keyword
        "", // Criterion Type
        "Responsive search ad",
        ...headlines,
        ...descriptions,
        ad.displayUrlPath[0] ?? "",
        ad.displayUrlPath[1] ?? "",
        finalUrl,
      ];
      rows.push(row.map(esc).join(","));
    }
  }

  // BOM para acentuação correta no Excel/Editor
  return "﻿" + rows.join("\r\n");
}
