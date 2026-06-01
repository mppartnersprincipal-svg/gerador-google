import { NextResponse } from "next/server";
import { fetchAndParseSite } from "@/lib/integrations/urlFetcher";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL é obrigatória." },
        { status: 400 }
      );
    }
    const site = await fetchAndParseSite(url);
    return NextResponse.json(site);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
