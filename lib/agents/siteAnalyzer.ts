import { callAgentJson } from "@/lib/integrations/anthropic";
import type { FetchedSite } from "@/lib/integrations/urlFetcher";
import type { OnboardingData } from "@/types/onboarding";
import type { SiteAnalysis, SEOStatus } from "@/types/agents";

const SYSTEM = `Você é um especialista sênior em análise de copywriting e SEO on-page para campanhas de Google Ads.
Analise o conteúdo extraído do site do cliente e os dados do briefing.
Responda APENAS com um objeto JSON puro (sem markdown, sem comentários) no formato:
{
  "proposta_de_valor": string,
  "publico_alvo": string,
  "palavras_chave_semanticas": string[] (8 a 15 termos relevantes encontrados/inferidos),
  "ctas_encontrados": string[],
  "seo_audit": [{ "item": string, "status": "ok" | "warning" | "error", "recomendacao": string }],
  "resumo_copy": string (máx. 200 caracteres)
}

Para o seo_audit avalie ao menos: Meta Title, Meta Description, H1 único, CTAs, densidade de palavras-chave, prova social.
Use "ok" quando estiver adequado, "warning" quando puder melhorar, "error" quando ausente/problemático.
Escreva tudo em português do Brasil.`;

export async function analyzeSite(
  site: FetchedSite,
  onboarding: OnboardingData
): Promise<SiteAnalysis> {
  const user = `BRIEFING DO CLIENTE:
- Empresa: ${onboarding.companyName}
- Segmento: ${onboarding.segment}
- Produto/Serviço anunciado: ${onboarding.productService}
- Diferenciais: ${onboarding.differentials}
- Cidade/Região: ${onboarding.targetCity}
- Objetivo: ${onboarding.campaignObjective}
- CTA desejado: ${onboarding.primaryCta}

CONTEÚDO EXTRAÍDO DO SITE (${site.url}):
${site.structuredText}`;

  const result = await callAgentJson<SiteAnalysis>({
    system: SYSTEM,
    user,
    maxTokens: 2000,
    temperature: 0.5,
  });

  // Normaliza status inválidos vindos do modelo
  const validStatus: SEOStatus[] = ["ok", "warning", "error"];
  result.seo_audit = (result.seo_audit || []).map((tip) => ({
    item: tip.item,
    status: validStatus.includes(tip.status) ? tip.status : "warning",
    recomendacao: tip.recomendacao,
  }));
  result.palavras_chave_semanticas = result.palavras_chave_semanticas || [];
  result.ctas_encontrados = result.ctas_encontrados || site.ctas;

  return result;
}
