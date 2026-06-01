import { NextResponse } from "next/server";
import { fetchAndParseSite } from "@/lib/integrations/urlFetcher";
import { analyzeSite } from "@/lib/agents/siteAnalyzer";
import { hasAnthropicKey } from "@/lib/integrations/anthropic";
import type { OnboardingData } from "@/types/onboarding";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (!hasAnthropicKey()) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY não configurada. Defina a chave para analisar o site.",
        },
        { status: 503 }
      );
    }

    const onboarding = (await req.json()) as OnboardingData;
    if (!onboarding?.websiteUrl) {
      return NextResponse.json(
        { error: "Dados de onboarding incompletos (websiteUrl ausente)." },
        { status: 400 }
      );
    }

    const site = await fetchAndParseSite(onboarding.websiteUrl);
    const analysis = await analyzeSite(site, onboarding);

    return NextResponse.json({ analysis, fetched: { url: site.url } });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
