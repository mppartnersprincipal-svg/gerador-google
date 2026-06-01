import { NextResponse } from "next/server";
import { reviewCampaign } from "@/lib/agents/qualityReviewer";
import type { AdGroup, CampaignExtensions } from "@/types/campaign";

export const runtime = "nodejs";

interface Body {
  adGroups: AdGroup[];
  extensions?: CampaignExtensions;
}

export async function POST(req: Request) {
  try {
    const { adGroups, extensions } = (await req.json()) as Body;
    if (!Array.isArray(adGroups) || adGroups.length === 0) {
      return NextResponse.json(
        { error: "adGroups é obrigatório." },
        { status: 400 }
      );
    }
    const quality = reviewCampaign(adGroups, extensions);
    return NextResponse.json({ quality });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
