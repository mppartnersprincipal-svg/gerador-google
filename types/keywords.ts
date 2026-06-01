export type MatchType = "exact" | "phrase" | "broad";

export interface Keyword {
  term: string;
  matchType: MatchType;
  volume?: number;
  cpc?: number;
  competition?: number; // 0–1
  isEstimated: boolean;
  selected: boolean;
}

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  exact: "Exata",
  phrase: "Frase",
  broad: "Ampla",
};

export type ResearchMode = "real" | "estimated";
