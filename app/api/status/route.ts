import { NextResponse } from "next/server";
import { hasAnthropicKey } from "@/lib/integrations/anthropic";
import { hasDataForSeoCredentials } from "@/lib/integrations/dataforseo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // lê process.env a cada request (não cachear no build)

export async function GET() {
  return NextResponse.json({
    anthropic: hasAnthropicKey(),
    dataforseo: hasDataForSeoCredentials(),
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "AdGen Pro",
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
  });
}
