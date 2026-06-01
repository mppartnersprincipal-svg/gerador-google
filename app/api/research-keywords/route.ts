import { NextResponse } from "next/server";
import {
  researchKeywords,
  hasDataForSeoCredentials,
} from "@/lib/integrations/dataforseo";
import { researchKeywordsFallback } from "@/lib/agents/keywordFallback";
import { hasAnthropicKey } from "@/lib/integrations/anthropic";
import type { OnboardingData } from "@/types/onboarding";
import type { SiteAnalysis } from "@/types/agents";
import type { Keyword, ResearchMode } from "@/types/keywords";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  onboarding: OnboardingData;
  analysis: SiteAnalysis;
  minVolume?: number;
}

export async function POST(req: Request) {
  try {
    const { onboarding, analysis, minVolume = 50 } = (await req.json()) as Body;

    if (!onboarding || !analysis) {
      return NextResponse.json(
        { error: "onboarding e analysis são obrigatórios." },
        { status: 400 }
      );
    }

    // Seeds: keywords semânticas + produto/serviço + termo + cidade
    const seeds = Array.from(
      new Set(
        [
          ...analysis.palavras_chave_semanticas,
          onboarding.productService,
          `${onboarding.segment} ${onboarding.targetCity}`,
        ]
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      )
    );

    let keywords: Keyword[] | null = null;
    let mode: ResearchMode = "estimated";

    if (hasDataForSeoCredentials()) {
      keywords = await researchKeywords(seeds, minVolume);
      if (keywords && keywords.length > 0) mode = "real";
    }

    if (!keywords || keywords.length === 0) {
      if (!hasAnthropicKey()) {
        return NextResponse.json(
          {
            error:
              "Sem DataForSEO e sem ANTHROPIC_API_KEY — não é possível pesquisar keywords.",
          },
          { status: 503 }
        );
      }
      keywords = await researchKeywordsFallback(onboarding, analysis);
      mode = "estimated";
    }

    return NextResponse.json({ keywords, mode });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
