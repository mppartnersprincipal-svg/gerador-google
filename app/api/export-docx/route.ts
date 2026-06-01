import { buildCampaignDocx } from "@/lib/exporters/docxExporter";
import type { Campaign } from "@/types/campaign";

export const runtime = "nodejs";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function POST(req: Request) {
  try {
    const campaign = (await req.json()) as Campaign;
    if (!campaign?.adGroups?.length) {
      return new Response(
        JSON.stringify({ error: "Campanha inválida." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const buffer = await buildCampaignDocx(campaign);
    const filename = `campanha-${slugify(campaign.clientName) || "google-ads"}.docx`;

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
