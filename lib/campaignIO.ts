import type { Campaign } from "@/types/campaign";

/**
 * Valida e desserializa uma campanha exportada em JSON (para reabrir/otimizar).
 * Local-only — substitui a persistência em Supabase por arquivo do usuário.
 */
export function parseCampaignJson(text: string): Campaign {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Arquivo JSON inválido.");
  }

  const c = data as Partial<Campaign>;
  if (
    !c ||
    typeof c.clientName !== "string" ||
    !Array.isArray(c.adGroups) ||
    !c.onboarding
  ) {
    throw new Error(
      "JSON não parece uma campanha do AdGen Pro (faltam clientName/adGroups/onboarding)."
    );
  }

  // Normaliza para reotimização: novo id e timestamp.
  return {
    ...(c as Campaign),
    id: `camp-${Date.now()}`,
    generatedAt: new Date().toISOString(),
  };
}

export function campaignToJson(campaign: Campaign): string {
  return JSON.stringify(campaign, null, 2);
}
