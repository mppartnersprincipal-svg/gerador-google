"use client";

import { create } from "zustand";
import type { OnboardingData } from "@/types/onboarding";
import type { Keyword, ResearchMode } from "@/types/keywords";
import type { SiteAnalysis } from "@/types/agents";
import type { Campaign } from "@/types/campaign";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export const STEP_LABELS: Record<WizardStep, string> = {
  1: "Onboarding",
  2: "Análise do Site",
  3: "Palavras-Chave",
  4: "Geração",
  5: "Campanha",
};

interface WizardState {
  currentStep: WizardStep;
  onboarding: OnboardingData | null;
  siteAnalysis: SiteAnalysis | null;
  keywords: Keyword[];
  researchMode: ResearchMode;
  campaign: Campaign | null;

  goTo: (step: WizardStep) => void;
  next: () => void;
  back: () => void;
  setOnboarding: (data: OnboardingData) => void;
  setSiteAnalysis: (analysis: SiteAnalysis) => void;
  setKeywords: (keywords: Keyword[], mode: ResearchMode) => void;
  toggleKeyword: (term: string) => void;
  setCampaign: (campaign: Campaign) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 1,
  onboarding: null,
  siteAnalysis: null,
  keywords: [],
  researchMode: "estimated",
  campaign: null,

  goTo: (step) => set({ currentStep: step }),
  next: () =>
    set((s) => ({
      currentStep: Math.min(5, s.currentStep + 1) as WizardStep,
    })),
  back: () =>
    set((s) => ({
      currentStep: Math.max(1, s.currentStep - 1) as WizardStep,
    })),

  setOnboarding: (data) => set({ onboarding: data }),
  setSiteAnalysis: (analysis) => set({ siteAnalysis: analysis }),
  setKeywords: (keywords, mode) =>
    set({ keywords, researchMode: mode }),
  toggleKeyword: (term) =>
    set((s) => ({
      keywords: s.keywords.map((k) =>
        k.term === term ? { ...k, selected: !k.selected } : k
      ),
    })),
  setCampaign: (campaign) => set({ campaign }),
  reset: () =>
    set({
      currentStep: 1,
      onboarding: null,
      siteAnalysis: null,
      keywords: [],
      researchMode: "estimated",
      campaign: null,
    }),
}));
