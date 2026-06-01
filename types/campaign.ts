import type { Keyword } from "./keywords";
import type { OnboardingData } from "./onboarding";
import type { SiteAnalysis, SEOTip } from "./agents";

export interface PinRecommendation {
  position: 1 | 2 | 3;
  headlineIndex: number;
}

export interface RSAd {
  headlines: string[]; // 15 items, max 30 chars each
  descriptions: string[]; // 4 items, max 90 chars each
  displayUrlPath: [string, string]; // max 15 chars each
  pinRecommendations: PinRecommendation[];
}

export interface AdGroup {
  id: string;
  name: string;
  theme: string;
  keywords: Keyword[];
  ads: RSAd[];
}

export interface Sitelink {
  title: string; // max 25 chars
  description1: string; // max 35 chars
  description2: string; // max 35 chars
  suggestedUrl: string;
}

export interface StructuredSnippet {
  header: string;
  values: string[];
}

export interface CampaignExtensions {
  callouts: string[];
  sitelinks: Sitelink[];
  structuredSnippets: StructuredSnippet[];
}

export interface PMaxAssetGroup {
  shortHeadlines: string[]; // ≤30 chars
  longHeadlines: string[]; // ≤90 chars
  descriptions: string[]; // ≤90 chars
  businessName: string; // ≤25 chars
  audienceSignal: string; // texto livre — sinal de público
  finalUrl: string;
}

export interface QualityAlert {
  tipo: "erro" | "alerta" | "info";
  campo: string;
  mensagem: string;
  sugestao: string;
}

export interface QualityReview {
  aprovado: boolean;
  score: number; // 0–100
  alertas: QualityAlert[];
}

export interface Campaign {
  id: string;
  clientName: string;
  generatedAt: string;
  onboarding: OnboardingData;
  siteAnalysis: SiteAnalysis;
  seoTips: SEOTip[];
  adGroups: AdGroup[];
  extensions?: CampaignExtensions; // Agente 4
  quality?: QualityReview; // Agente 5
  pmax?: PMaxAssetGroup; // Fase 3 — Performance Max (sob demanda)
}
