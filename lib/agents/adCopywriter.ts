import { callAgentJson } from "@/lib/integrations/anthropic";
import { GOOGLE_ADS_LIMITS, FORBIDDEN_WORDS } from "@/lib/constants/limits";
import type { OnboardingData } from "@/types/onboarding";
import type { RSAd, PinRecommendation } from "@/types/campaign";
import type { OrganizedGroup } from "./keywordOrganizer";

const L = GOOGLE_ADS_LIMITS;

const SYSTEM = `Você é um copywriter sênior especialista em anúncios responsivos (RSA) do Google Ads.
Gere um anúncio para o grupo informado.

Responda APENAS com JSON puro no formato:
{
  "headlines": string[${L.HEADLINES_PER_AD}],   // EXATAMENTE ${L.HEADLINES_PER_AD} títulos, cada um com NO MÁXIMO ${L.HEADLINE_MAX_CHARS} caracteres
  "descriptions": string[${L.DESCRIPTIONS_PER_AD}], // EXATAMENTE ${L.DESCRIPTIONS_PER_AD} descrições, cada uma com NO MÁXIMO ${L.DESCRIPTION_MAX_CHARS} caracteres
  "displayUrlPath": [string, string], // 2 segmentos, cada um NO MÁXIMO ${L.DISPLAY_URL_PATH_MAX_CHARS} caracteres
  "pinRecommendations": [{ "position": 1|2|3, "headlineIndex": number }]
}

Regras OBRIGATÓRIAS:
- Pelo menos 3 títulos contendo a keyword principal do grupo.
- 1 título com o CTA principal.
- 1 título com um diferencial competitivo.
- 1 título com a localização (se a campanha for local).
- Toda descrição deve conter um CTA explícito.
- NUNCA exceda os limites de caracteres (conte os caracteres de cada string).
- NÃO use palavras proibidas: ${FORBIDDEN_WORDS.join(", ")}.
- Tudo em português do Brasil.`;

/** Garante limites duros mesmo se o modelo escorregar. */
function clampHeadlines(items: string[]): string[] {
  const cleaned = (items || [])
    .map((h) => (h || "").trim())
    .filter(Boolean)
    .map((h) =>
      h.length > L.HEADLINE_MAX_CHARS ? h.slice(0, L.HEADLINE_MAX_CHARS).trim() : h
    );
  while (cleaned.length < L.HEADLINES_PER_AD) {
    cleaned.push(cleaned[cleaned.length % Math.max(1, cleaned.length)] || "Saiba mais");
  }
  return cleaned.slice(0, L.HEADLINES_PER_AD);
}

function clampDescriptions(items: string[]): string[] {
  const cleaned = (items || [])
    .map((d) => (d || "").trim())
    .filter(Boolean)
    .map((d) =>
      d.length > L.DESCRIPTION_MAX_CHARS
        ? d.slice(0, L.DESCRIPTION_MAX_CHARS).trim()
        : d
    );
  while (cleaned.length < L.DESCRIPTIONS_PER_AD) {
    cleaned.push(cleaned[0] || "Fale conosco e saiba mais.");
  }
  return cleaned.slice(0, L.DESCRIPTIONS_PER_AD);
}

function clampPath(path: unknown): [string, string] {
  const arr = Array.isArray(path) ? path : [];
  const seg = (v: unknown) =>
    String(v || "")
      .trim()
      .slice(0, L.DISPLAY_URL_PATH_MAX_CHARS);
  return [seg(arr[0]), seg(arr[1])];
}

export async function writeAd(
  group: OrganizedGroup,
  onboarding: OnboardingData
): Promise<RSAd> {
  const isLocal = onboarding.targetRadius !== "national";
  const user = `GRUPO: ${group.name} (tema: ${group.theme})
KEYWORDS DO GRUPO: ${group.keywords.map((k) => k.term).join(", ")}
EMPRESA: ${onboarding.companyName}
DIFERENCIAIS: ${onboarding.differentials}
CTA PRINCIPAL: ${onboarding.primaryCta}
LOCALIZAÇÃO: ${onboarding.targetCity}${isLocal ? " (campanha LOCAL — inclua a cidade em pelo menos 1 título)" : " (campanha nacional)"}
SITE: ${onboarding.websiteUrl}`;

  const raw = await callAgentJson<{
    headlines: string[];
    descriptions: string[];
    displayUrlPath: unknown;
    pinRecommendations: PinRecommendation[];
  }>({
    system: SYSTEM,
    user,
    maxTokens: 3000,
    temperature: 0.8,
  });

  return {
    headlines: clampHeadlines(raw.headlines),
    descriptions: clampDescriptions(raw.descriptions),
    displayUrlPath: clampPath(raw.displayUrlPath),
    pinRecommendations: Array.isArray(raw.pinRecommendations)
      ? raw.pinRecommendations.filter(
          (p) => p && [1, 2, 3].includes(p.position)
        )
      : [],
  };
}
