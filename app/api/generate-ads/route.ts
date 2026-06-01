import { NextResponse } from "next/server";
import { writeAd } from "@/lib/agents/adCopywriter";
import { hasAnthropicKey } from "@/lib/integrations/anthropic";
import type { OnboardingData } from "@/types/onboarding";
import type { OrganizedGroup } from "@/lib/agents/keywordOrganizer";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  group: OrganizedGroup;
  onboarding: OnboardingData;
}

export async function POST(req: Request) {
  try {
    if (!hasAnthropicKey()) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY não configurada." },
        { status: 503 }
      );
    }
    const { group, onboarding } = (await req.json()) as Body;
    if (!group?.keywords?.length) {
      return NextResponse.json(
        { error: "Grupo inválido ou sem keywords." },
        { status: 400 }
      );
    }
    const ad = await writeAd(group, onboarding);
    return NextResponse.json({ ad });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
