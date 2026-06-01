import { NextResponse } from "next/server";
import { generateExtensions } from "@/lib/agents/extensionsGenerator";
import { hasAnthropicKey } from "@/lib/integrations/anthropic";
import type { OnboardingData } from "@/types/onboarding";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (!hasAnthropicKey()) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY não configurada." },
        { status: 503 }
      );
    }
    const onboarding = (await req.json()) as OnboardingData;
    if (!onboarding?.companyName) {
      return NextResponse.json(
        { error: "Dados de onboarding incompletos." },
        { status: 400 }
      );
    }
    const extensions = await generateExtensions(onboarding);
    return NextResponse.json({ extensions });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
