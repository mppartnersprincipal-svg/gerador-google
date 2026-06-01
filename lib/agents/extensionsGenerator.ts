import { callAgentJson } from "@/lib/integrations/anthropic";
import {
  GOOGLE_ADS_LIMITS,
  FORBIDDEN_WORDS,
  SNIPPET_HEADERS,
} from "@/lib/constants/limits";
import type { OnboardingData } from "@/types/onboarding";
import type {
  CampaignExtensions,
  Sitelink,
  StructuredSnippet,
} from "@/types/campaign";

const L = GOOGLE_ADS_LIMITS;

const SYSTEM = `Você é um especialista em extensões de anúncios do Google Ads.
Gere extensões para a campanha com base nos dados da empresa.

Responda APENAS com JSON puro no formato:
{
  "callouts": string[],            // 6 a 10 frases de destaque, cada uma NO MÁXIMO ${L.CALLOUT_MAX_CHARS} caracteres
  "sitelinks": [                   // 4 a 6 sitelinks
    { "titulo": string, "desc1": string, "desc2": string, "url_sugerida": string }
  ],
  "structured_snippets": [         // 1 a 2 snippets
    { "cabecalho": string, "valores": string[] }
  ]
}

Regras OBRIGATÓRIAS:
- Callout: máx. ${L.CALLOUT_MAX_CHARS} caracteres.
- Sitelink: título máx. ${L.SITELINK_TITLE_MAX_CHARS}; desc1 e desc2 máx. ${L.SITELINK_DESC_MAX_CHARS} cada.
- Snippet: cada valor máx. ${L.STRUCTURED_SNIPPET_VALUE_MAX_CHARS} caracteres.
- O "cabecalho" do snippet DEVE ser um destes: ${SNIPPET_HEADERS.join(", ")}.
- NÃO use palavras proibidas: ${FORBIDDEN_WORDS.join(", ")}.
- url_sugerida deve ser um caminho relativo plausível (ex: /servicos, /contato).
- Tudo em português do Brasil.`;

interface RawSitelink {
  titulo: string;
  desc1: string;
  desc2: string;
  url_sugerida: string;
}
interface RawSnippet {
  cabecalho: string;
  valores: string[];
}
interface RawExtensions {
  callouts: string[];
  sitelinks: RawSitelink[];
  structured_snippets: RawSnippet[];
}

const cut = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

export async function generateExtensions(
  onboarding: OnboardingData
): Promise<CampaignExtensions> {
  const user = `EMPRESA: ${onboarding.companyName}
SEGMENTO: ${onboarding.segment}
PRODUTO/SERVIÇO: ${onboarding.productService}
DIFERENCIAIS: ${onboarding.differentials}
OBJETIVO: ${onboarding.campaignObjective}
CIDADE: ${onboarding.targetCity}
SITE: ${onboarding.websiteUrl}`;

  const raw = await callAgentJson<RawExtensions>({
    system: SYSTEM,
    user,
    maxTokens: 1500,
    temperature: 0.7,
  });

  const callouts = (raw.callouts || [])
    .map((c) => cut(c, L.CALLOUT_MAX_CHARS))
    .filter(Boolean)
    .slice(0, 10);

  const sitelinks: Sitelink[] = (raw.sitelinks || [])
    .filter((s) => s?.titulo)
    .slice(0, 6)
    .map((s) => ({
      title: cut(s.titulo, L.SITELINK_TITLE_MAX_CHARS),
      description1: cut(s.desc1, L.SITELINK_DESC_MAX_CHARS),
      description2: cut(s.desc2, L.SITELINK_DESC_MAX_CHARS),
      suggestedUrl: cut(s.url_sugerida, 80) || "/",
    }));

  const validHeaders = new Set<string>(SNIPPET_HEADERS);
  const structuredSnippets: StructuredSnippet[] = (
    raw.structured_snippets || []
  )
    .filter((s) => s?.cabecalho && validHeaders.has(s.cabecalho))
    .slice(0, 2)
    .map((s) => ({
      header: s.cabecalho,
      values: (s.valores || [])
        .map((v) => cut(v, L.STRUCTURED_SNIPPET_VALUE_MAX_CHARS))
        .filter(Boolean),
    }))
    .filter((s) => s.values.length > 0);

  return { callouts, sitelinks, structuredSnippets };
}
