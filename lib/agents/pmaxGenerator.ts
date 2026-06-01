import { callAgentJson } from "@/lib/integrations/anthropic";
import { PMAX_LIMITS, FORBIDDEN_WORDS } from "@/lib/constants/limits";
import type { OnboardingData } from "@/types/onboarding";
import type { PMaxAssetGroup } from "@/types/campaign";
import type { SiteAnalysis } from "@/types/agents";

const P = PMAX_LIMITS;

const SYSTEM = `Você é um especialista em campanhas Performance Max do Google Ads.
Gere os textos (assets) de um único asset group com base nos dados da empresa.

Responda APENAS com JSON puro no formato:
{
  "shortHeadlines": string[${P.SHORT_HEADLINES}],  // ${P.SHORT_HEADLINES} títulos curtos, cada um NO MÁXIMO ${P.SHORT_HEADLINE_MAX_CHARS} caracteres
  "longHeadlines": string[${P.LONG_HEADLINES}],    // ${P.LONG_HEADLINES} títulos longos, cada um NO MÁXIMO ${P.LONG_HEADLINE_MAX_CHARS} caracteres
  "descriptions": string[${P.DESCRIPTIONS}],       // ${P.DESCRIPTIONS} descrições, cada uma NO MÁXIMO ${P.DESCRIPTION_MAX_CHARS} caracteres
  "businessName": string,                          // nome do anunciante, NO MÁXIMO ${P.BUSINESS_NAME_MAX_CHARS} caracteres
  "audienceSignal": string                         // descrição do sinal de público (interesses, dados demográficos, intenção)
}

Regras OBRIGATÓRIAS:
- Respeite os limites de caracteres de cada campo.
- Inclua CTA e diferenciais; varie os ângulos das mensagens.
- NÃO use palavras proibidas: ${FORBIDDEN_WORDS.join(", ")}.
- Tudo em português do Brasil.`;

interface RawPMax {
  shortHeadlines: string[];
  longHeadlines: string[];
  descriptions: string[];
  businessName: string;
  audienceSignal: string;
}

const cut = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

function fill(items: string[] | undefined, count: number, max: number): string[] {
  const cleaned = (items || [])
    .map((s) => cut(s, max))
    .filter(Boolean)
    .slice(0, count);
  while (cleaned.length < count) cleaned.push(cleaned[0] || "Saiba mais");
  return cleaned;
}

export async function generatePMax(
  onboarding: OnboardingData,
  analysis?: SiteAnalysis
): Promise<PMaxAssetGroup> {
  const user = `EMPRESA: ${onboarding.companyName}
SEGMENTO: ${onboarding.segment}
PRODUTO/SERVIÇO: ${onboarding.productService}
DIFERENCIAIS: ${onboarding.differentials}
CTA PRINCIPAL: ${onboarding.primaryCta}
OBJETIVO: ${onboarding.campaignObjective}
CIDADE: ${onboarding.targetCity}
SITE: ${onboarding.websiteUrl}
${analysis ? `PÚBLICO-ALVO (inferido): ${analysis.publico_alvo}` : ""}`;

  const raw = await callAgentJson<RawPMax>({
    system: SYSTEM,
    user,
    maxTokens: 2000,
    temperature: 0.8,
  });

  return {
    shortHeadlines: fill(
      raw.shortHeadlines,
      P.SHORT_HEADLINES,
      P.SHORT_HEADLINE_MAX_CHARS
    ),
    longHeadlines: fill(
      raw.longHeadlines,
      P.LONG_HEADLINES,
      P.LONG_HEADLINE_MAX_CHARS
    ),
    descriptions: fill(raw.descriptions, P.DESCRIPTIONS, P.DESCRIPTION_MAX_CHARS),
    businessName:
      cut(raw.businessName, P.BUSINESS_NAME_MAX_CHARS) ||
      cut(onboarding.companyName, P.BUSINESS_NAME_MAX_CHARS),
    audienceSignal: cut(raw.audienceSignal, 300),
    finalUrl: onboarding.websiteUrl,
  };
}
