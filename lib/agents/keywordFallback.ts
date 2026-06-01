import type Anthropic from "@anthropic-ai/sdk";
import {
  getAnthropic,
  CLAUDE_MODEL,
  extractJson,
} from "@/lib/integrations/anthropic";
import type { OnboardingData } from "@/types/onboarding";
import type { SiteAnalysis } from "@/types/agents";
import type { Keyword, MatchType } from "@/types/keywords";

const SYSTEM = `Você é um especialista em pesquisa de palavras-chave para Google Ads (Rede de Pesquisa) no Brasil.
Use a busca na web para encontrar termos realmente buscados pelo público no nicho informado.
Combine os resultados com a análise semântica fornecida.

Ao final, responda com um ARRAY JSON puro (sem markdown) de 20 a 40 objetos no formato:
[{ "term": string, "matchType": "exact" | "phrase" | "broad", "volume": number, "competition": number }]
- "volume" é uma ESTIMATIVA mensal de buscas no Brasil (inteiro plausível, sem dados reais).
- "competition" é um número entre 0 e 1.
- Misture intenção transacional e informacional, priorize termos locais quando houver cidade.
- Tudo em português do Brasil. NÃO inclua texto fora do array JSON final.`;

function normalizeMatch(m: string): MatchType {
  if (m === "exact" || m === "phrase" || m === "broad") return m;
  return "broad";
}

interface RawKw {
  term: string;
  matchType: string;
  volume?: number;
  competition?: number;
}

export async function researchKeywordsFallback(
  onboarding: OnboardingData,
  analysis: SiteAnalysis
): Promise<Keyword[]> {
  const anthropic = getAnthropic();

  const user = `NICHO/SEGMENTO: ${onboarding.segment}
PRODUTO/SERVIÇO: ${onboarding.productService}
CIDADE/REGIÃO: ${onboarding.targetCity} (raio: ${onboarding.targetRadius})
DIFERENCIAIS: ${onboarding.differentials}

ANÁLISE SEMÂNTICA DO SITE:
- Proposta de valor: ${analysis.proposta_de_valor}
- Público-alvo: ${analysis.publico_alvo}
- Palavras-chave semânticas detectadas: ${analysis.palavras_chave_semanticas.join(", ")}

Pesquise os termos mais buscados relacionados e gere a lista estimada.`;

  const baseParams = {
    model: CLAUDE_MODEL,
    max_tokens: 3000,
    temperature: 0.6,
    system: SYSTEM,
    messages: [{ role: "user" as const, content: user }],
  };

  let response;
  try {
    // Tenta com busca na web (dados mais realistas)
    response = await anthropic.messages.create({
      ...baseParams,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        } as unknown as Anthropic.Tool,
      ],
    });
  } catch {
    // Conta sem web search habilitado: degrada para geração sem ferramenta
    response = await anthropic.messages.create(baseParams);
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  let raw: RawKw[];
  try {
    raw = JSON.parse(extractJson(text)) as RawKw[];
  } catch {
    // Degrada graciosamente: deriva das keywords semânticas
    raw = analysis.palavras_chave_semanticas.map((term) => ({
      term,
      matchType: "phrase",
    }));
  }

  const seen = new Set<string>();
  return raw
    .filter((k) => k.term && !seen.has(k.term.toLowerCase()))
    .map((k) => {
      seen.add(k.term.toLowerCase());
      const kw: Keyword = {
        term: k.term,
        matchType: normalizeMatch(k.matchType),
        volume: typeof k.volume === "number" ? k.volume : undefined,
        competition:
          typeof k.competition === "number" ? k.competition : undefined,
        isEstimated: true,
        selected: true,
      };
      return kw;
    });
}
