"use client";

import { useState } from "react";
import { Sparkles, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/lib/store/wizardStore";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { ThemeManager, ThemeToggle } from "@/components/shared/ThemeManager";
import { StepOnboarding } from "./components/StepOnboarding";
import { StepUrlAnalysis } from "./components/StepUrlAnalysis";
import { StepKeywords } from "./components/StepKeywords";
import { StepGenerating } from "./components/StepGenerating";
import { StepOutput } from "./components/StepOutput";
import { HistoryPanel } from "./components/HistoryPanel";
import { SettingsPanel } from "./components/SettingsPanel";

type View = "wizard" | "history" | "settings";

export default function WizardPage() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const [view, setView] = useState<View>("wizard");

  return (
    <main className="min-h-screen bg-background">
      <ThemeManager />
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-4">
          <button
            className="flex items-center gap-2"
            onClick={() => setView("wizard")}
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <div className="text-left">
              <h1 className="text-lg font-bold leading-none">AdGen Pro</h1>
              <p className="text-xs text-muted-foreground">
                MP Assessoria — Campanhas Google Ads Search
              </p>
            </div>
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant={view === "history" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("history")}
            >
              <Clock className="h-4 w-4" /> Histórico
            </Button>
            <Button
              variant={view === "settings" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("settings")}
            >
              <Settings className="h-4 w-4" /> Configurações
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {view === "history" && (
          <HistoryPanel onClose={() => setView("wizard")} />
        )}
        {view === "settings" && (
          <SettingsPanel onClose={() => setView("wizard")} />
        )}
        {view === "wizard" && (
          <>
            <div className="mb-8">
              <StepIndicator current={currentStep} />
            </div>

            {currentStep === 1 && <StepOnboarding />}
            {currentStep === 2 && <StepUrlAnalysis />}
            {currentStep === 3 && <StepKeywords />}
            {currentStep === 4 && <StepGenerating />}
            {currentStep === 5 && <StepOutput />}
          </>
        )}
      </div>
    </main>
  );
}
