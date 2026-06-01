"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TargetRadius } from "@/types/onboarding";

export type Theme = "light" | "dark";

interface PrefsState {
  theme: Theme;
  /** Volume mínimo para filtrar keywords na pesquisa. */
  minVolume: number;
  /** Raio padrão pré-selecionado no onboarding. */
  defaultRadius: TargetRadius;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setMinVolume: (v: number) => void;
  setDefaultRadius: (r: TargetRadius) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      theme: "light",
      minVolume: 50,
      defaultRadius: "city",

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setMinVolume: (minVolume) =>
        set({ minVolume: Math.max(0, Math.floor(minVolume) || 0) }),
      setDefaultRadius: (defaultRadius) => set({ defaultRadius }),
    }),
    { name: "adgen-prefs" }
  )
);
