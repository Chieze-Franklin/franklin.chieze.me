"use client";

import { createContext, useContext } from "react";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/types";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme, override?: boolean) => void;
  resetToAuto: () => void;
  isOverride: boolean;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useTheme();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
}
