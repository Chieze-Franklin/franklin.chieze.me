"use client";

import { useState, useCallback, useEffect } from "react";
import type { Theme } from "@/types";
import { getThemeFromHour } from "@/lib/theme";

const STORAGE_KEY = "fchieze-theme-override";

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
}

function resolveTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored ?? getThemeFromHour(new Date().getHours());
}

export function useTheme() {
  // Always start with "night" — stable value for SSR + hydration.
  // Real theme is applied in the first useEffect (client-only).
  const [theme, setThemeState] = useState<Theme>("night");
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
    const t = getThemeFromHour(new Date().getHours());
    setThemeState(t);
    applyTheme(t);
  }, []);

  return { theme, setTheme, resetToAuto, isOverride, mounted };
}
