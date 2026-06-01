export type TargetRadius = "city" | "state" | "national";
export type CampaignObjective =
  | "leads_form"
  | "calls"
  | "store_visits"
  | "online_sales";

export interface OnboardingData {
  companyName: string;
  segment: string;
  productService: string;
  differentials: string;
  websiteUrl: string;
  targetCity: string;
  targetRadius: TargetRadius;
  campaignObjective: CampaignObjective;
  primaryCta: string;
  monthlyBudget: number;
  additionalNotes?: string;
}

export const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  leads_form: "Leads (formulário)",
  calls: "Ligações",
  store_visits: "Visitas à loja",
  online_sales: "Vendas online",
};

export const RADIUS_LABELS: Record<TargetRadius, string> = {
  city: "Cidade",
  state: "Estado",
  national: "Nacional",
};
