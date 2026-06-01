import axios from "axios";
import {
  DATAFORSEO_LOCATION_CODE_BR,
  DATAFORSEO_LANGUAGE_PT,
} from "@/lib/constants/limits";
import type { Keyword, MatchType } from "@/types/keywords";

const BASE_URL = "https://api.dataforseo.com/v3";

export function hasDataForSeoCredentials(): boolean {
  return Boolean(
    process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD
  );
}

function authHeader(): string {
  const token = Buffer.from(
    `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
  ).toString("base64");
  return `Basic ${token}`;
}

/** Atribui match type por volume/concorrência (heurística simples). */
function inferMatchType(volume: number, competition: number): MatchType {
  if (volume >= 1000) return "phrase";
  if (competition >= 0.66) return "exact";
  return "broad";
}

interface DfsKeywordResult {
  keyword: string;
  search_volume: number | null;
  cpc: number | null;
  competition: number | null; // 0–1
}

/**
 * Expande seeds via keywords_for_keywords. Retorna null se sem credenciais.
 */
export async function researchKeywords(
  seeds: string[],
  minVolume = 50
): Promise<Keyword[] | null> {
  if (!hasDataForSeoCredentials()) return null;

  const res = await axios.post(
    `${BASE_URL}/keywords_data/google_ads/keywords_for_keywords/live`,
    [
      {
        keywords: seeds.slice(0, 20),
        language_code: DATAFORSEO_LANGUAGE_PT,
        location_code: DATAFORSEO_LOCATION_CODE_BR,
        limit: 100,
      },
    ],
    {
      headers: {
        Authorization: authHeader(),
        "Content-Type": "application/json",
      },
      timeout: 60000,
    }
  );

  const items: DfsKeywordResult[] =
    res.data?.tasks?.[0]?.result ?? [];

  const keywords: Keyword[] = items
    .filter((it) => (it.search_volume ?? 0) >= minVolume)
    .map((it) => {
      const volume = it.search_volume ?? 0;
      const competition = it.competition ?? 0;
      return {
        term: it.keyword,
        matchType: inferMatchType(volume, competition),
        volume,
        cpc: it.cpc ?? undefined,
        competition,
        isEstimated: false,
        selected: true,
      };
    });

  // Dedup por termo
  const seen = new Set<string>();
  return keywords.filter((k) => {
    const key = k.term.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
