"use client";

import { useState, useCallback, useEffect } from "react";
import type { Theme } from "@/types";

const STORAGE_KEY = "fchieze-theme-override";

// The theme shown when the visitor hasn't picked one.
const DEFAULT_THEME: Theme = "dawn";

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

function resolveTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored ?? DEFAULT_THEME;
}

export function useTheme() {
  // Start with the default theme — a stable value for SSR + hydration.
  // Any saved override is applied in the first useEffect (client-only).
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [isOverride, setIsOverride] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = resolveTheme();
    const hasOverride = !!localStorage.getItem(STORAGE_KEY);
    setThemeState(t);
    setIsOverride(hasOverride);
    setMounted(true);
    applyTheme(t);
  }, []);

  const setTheme = useCallback((t: Theme, override = true) => {
    setThemeState(t);
    applyTheme(t);
    if (override) {
      localStorage.setItem(STORAGE_KEY, t);
      setIsOverride(true);
    }
  }, []);

  const resetToAuto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsOverride(false);
    setThemeState(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
  }, []);

  return { theme, setTheme, resetToAuto, isOverride, mounted };
}
