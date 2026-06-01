import { NextResponse } from "next/server";
import { organizeGroups } from "@/lib/agents/keywordOrganizer";
import { hasAnthropicKey } from "@/lib/integrations/anthropic";
import type { OnboardingData } from "@/types/onboarding";
import type { SiteAnalysis } from "@/types/agents";
import type { Keyword } from "@/types/keywords";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  keywords: Keyword[];
  onboarding: OnboardingData;
  analysis: SiteAnalysis;
}

export async function POST(req: Request) {
  try {
    if (!hasAnthropicKey()) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY não configurada." },
        { status: 503 }
      );
    }
    const { keywords, onboarding, analysis } = (await req.json()) as Body;
    const selected = (keywords || []).filter((k) => k.selected);
    if (selected.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma keyword selecionada." },
        { status: 400 }
      );
    }
    const groups = await organizeGroups(selected, onboarding, analysis);
    return NextResponse.json({ groups });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
