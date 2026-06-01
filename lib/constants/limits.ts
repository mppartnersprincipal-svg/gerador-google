/**
 * Hard constraints do Google Ads (PRD §13).
 * Fonte única de verdade — reutilizado em validação, copywriter e export.
 */
export const GOOGLE_ADS_LIMITS = {
  HEADLINE_MAX_CHARS: 30,
  HEADLINES_PER_AD: 15,
  DESCRIPTION_MAX_CHARS: 90,
  DESCRIPTIONS_PER_AD: 4,
  DISPLAY_URL_PATH_MAX_CHARS: 15,
  DISPLAY_URL_PATH_SEGMENTS: 2,
  CALLOUT_MAX_CHARS: 25,
  SITELINK_TITLE_MAX_CHARS: 25,
  SITELINK_DESC_MAX_CHARS: 35,
  STRUCTURED_SNIPPET_VALUE_MAX_CHARS: 25,
  KEYWORDS_PER_GROUP_MIN: 5,
  KEYWORDS_PER_GROUP_MAX: 20,
  GROUPS_MIN: 3,
  GROUPS_MAX: 8,
} as const;

/** Limites de Performance Max (asset group). */
export const PMAX_LIMITS = {
  SHORT_HEADLINE_MAX_CHARS: 30,
  SHORT_HEADLINES: 5,
  LONG_HEADLINE_MAX_CHARS: 90,
  LONG_HEADLINES: 5,
  DESCRIPTION_MAX_CHARS: 90,
  DESCRIPTIONS: 5,
  BUSINESS_NAME_MAX_CHARS: 25,
} as const;

/** Palavras/expressões proibidas em anúncios Google Ads (lista base, PT-BR). */
export const FORBIDDEN_WORDS = [
  "grátis",
  "gratis",
  "garantido",
  "garantia total",
  "melhor do mundo",
  "número 1",
  "numero 1",
  "o melhor",
  "100%",
  "imperdível",
  "clique aqui",
];

/** Cabeçalhos válidos para Structured Snippets (PRD §7 — Agente 4). */
export const SNIPPET_HEADERS = [
  "Serviços",
  "Marcas",
  "Destinos",
  "Cursos",
  "Programas",
  "Modelos",
  "Tipos",
  "Comodidades",
  "Seguros",
  "Graus",
] as const;

/** DataForSEO — Brasil / Português. */
export const DATAFORSEO_LOCATION_CODE_BR = 1001767;
export const DATAFORSEO_LANGUAGE_PT = "pt";

/** Nível de uso do contador de caracteres em relação ao limite. */
export function charUsageLevel(
  length: number,
  max: number
): "ok" | "warning" | "over" {
  const ratio = length / max;
  if (ratio >= 1) return "over";
  if (ratio >= 0.8) return "warning";
  return "ok";
}
