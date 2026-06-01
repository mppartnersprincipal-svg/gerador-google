import { NextResponse } from "next/server";
import { generatePMax } from "@/lib/agents/pmaxGenerator";
import { hasAnthropicKey } from "@/lib/integrations/anthropic";
import type { OnboardingData } from "@/types/onboarding";
import type { SiteAnalysis } from "@/types/agents";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  onboarding: OnboardingData;
  analysis?: SiteAnalysis;
}

export async function POST(req: Request) {
  try {
    if (!hasAnthropicKey()) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY não configurada." },
        { status: 503 }
      );
    }
    const { onboarding, analysis } = (await req.json()) as Body;
    if (!onboarding?.companyName) {
      return NextResponse.json(
        { error: "Dados de onboarding incompletos." },
        { status: 400 }
      );
    }
    const pmax = await generatePMax(onboarding, analysis);
    return NextResponse.json({ pmax });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
