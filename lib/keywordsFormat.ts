import type { Keyword } from "@/types/keywords";

/**
 * Formata keywords no padrão de match type do Google Ads, uma por linha:
 * exata → [termo], frase → "termo", ampla → termo.
 * Pronto para colar no Google Ads / Editor.
 */
export function formatKeywordsForCopy(keywords: Keyword[]): string {
  return keywords
    .map((k) =>
      k.matchType === "exact"
        ? `[${k.term}]`
        : k.matchType === "phrase"
          ? `"${k.term}"`
          : k.term
    )
    .join("\n");
}
