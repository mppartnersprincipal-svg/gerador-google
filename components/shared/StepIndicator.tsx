"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEP_LABELS, type WizardStep } from "@/lib/store/wizardStore";

const STEPS: WizardStep[] = [1, 2, 3, 4, 5];

export function StepIndicator({ current }: { current: WizardStep }) {
  return (
    <nav className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : step}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-10",
                  done ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
