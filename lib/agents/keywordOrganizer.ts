import { callAgentJson } from "@/lib/integrations/anthropic";
import { GOOGLE_ADS_LIMITS } from "@/lib/constants/limits";
import type { OnboardingData } from "@/types/onboarding";
import type { SiteAnalysis } from "@/types/agents";
import type { Keyword, MatchType } from "@/types/keywords";

const SYSTEM = `Você é um especialista em estrutura de campanhas Google Ads (Rede de Pesquisa).
Organize as palavras-chave fornecidas em grupos de anúncio coerentes.

Responda APENAS com JSON puro no formato:
{
  "grupos": [
    {
      "nome": string,
      "tema": string,
      "keywords": [{ "termo": string, "match_type": "exact" | "phrase" | "broad" }]
    }
  ]
}

Regras OBRIGATÓRIAS:
- Mínimo ${GOOGLE_ADS_LIMITS.GROUPS_MIN}, máximo ${GOOGLE_ADS_LIMITS.GROUPS_MAX} grupos.
- Máximo ${GOOGLE_ADS_LIMITS.KEYWORDS_PER_GROUP_MAX} keywords por grupo.
- Agrupe por intenção de busca / tema (ex: transacional vs informacional).
- NUNCA repita a mesma keyword em dois grupos.
- Nomeie os grupos com clareza (ex: "Implante Dentário", "Ortodontia Goiânia").
- Use apenas as keywords fornecidas. Tudo em português do Brasil.`;

interface RawGroup {
  nome: string;
  tema: string;
  keywords: { termo: string; match_type: string }[];
}

export interface OrganizedGroup {
  name: string;
  theme: string;
  keywords: Keyword[];
}

function normalizeMatch(m: string, fallback: MatchType): MatchType {
  if (m === "exact" || m === "phrase" || m === "broad") return m;
  return fallback;
}

export async function organizeGroups(
  selectedKeywords: Keyword[],
  onboarding: OnboardingData,
  analysis: SiteAnalysis
): Promise<OrganizedGroup[]> {
  const kwIndex = new Map(
    selectedKeywords.map((k) => [k.term.toLowerCase(), k])
  );

  const user = `EMPRESA: ${onboarding.companyName} — ${onboarding.segment}
CIDADE: ${onboarding.targetCity}
PRODUTO/SERVIÇO: ${onboarding.productService}
PÚBLICO-ALVO: ${analysis.publico_alvo}

KEYWORDS SELECIONADAS (${selectedKeywords.length}):
${selectedKeywords.map((k) => `- ${k.term} [${k.matchType}]`).join("\n")}`;

  const result = await callAgentJson<{ grupos: RawGroup[] }>({
    system: SYSTEM,
    user,
    maxTokens: 2000,
    temperature: 0.4,
  });

  const used = new Set<string>();
  const groups: OrganizedGroup[] = (result.grupos || [])
    .slice(0, GOOGLE_ADS_LIMITS.GROUPS_MAX)
    .map((g) => {
      const keywords: Keyword[] = [];
      for (const kw of g.keywords || []) {
        const key = kw.termo?.toLowerCase();
        if (!key || used.has(key)) continue; // sem duplicatas entre grupos
        used.add(key);
        const original = kwIndex.get(key);
        keywords.push({
          term: kw.termo,
          matchType: normalizeMatch(
            kw.match_type,
            original?.matchType ?? "phrase"
          ),
          volume: original?.volume,
          cpc: original?.cpc,
          competition: original?.competition,
          isEstimated: original?.isEstimated ?? true,
          selected: true,
        });
        if (keywords.length >= GOOGLE_ADS_LIMITS.KEYWORDS_PER_GROUP_MAX) break;
      }
      return { name: g.nome, theme: g.tema, keywords };
    })
    .filter((g) => g.keywords.length > 0);

  return groups;
}
