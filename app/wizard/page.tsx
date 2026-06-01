"use client";

import { Sparkles } from "lucide-react";
import { useWizardStore } from "@/lib/store/wizardStore";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { StepOnboarding } from "./components/StepOnboarding";
import { StepUrlAnalysis } from "./components/StepUrlAnalysis";
import { StepKeywords } from "./components/StepKeywords";
import { StepGenerating } from "./components/StepGenerating";
import { StepOutput } from "./components/StepOutput";

export default function WizardPage() {
  const currentStep = useWizardStore((s) => s.currentStep);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-lg font-bold leading-none">AdGen Pro</h1>
            <p className="text-xs text-muted-foreground">
              MP Assessoria — Campanhas Google Ads Search
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-8">
          <StepIndicator current={currentStep} />
        </div>

        {currentStep === 1 && <StepOnboarding />}
        {currentStep === 2 && <StepUrlAnalysis />}
        {currentStep === 3 && <StepKeywords />}
        {currentStep === 4 && <StepGenerating />}
        {currentStep === 5 && <StepOutput />}
      </div>
    </main>
  );
}
