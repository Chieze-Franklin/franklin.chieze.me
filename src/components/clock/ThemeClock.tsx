"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useThemeContext } from "@/components/theme/ThemeProvider";
import {
  getThemeFromHour,
  getAngleFromHour24,
  getHourFromAngle24,
  themeRepresentativeHour,
  themeLabels,
} from "@/lib/theme";
import type { Theme } from "@/types";

// Static color map — used only in the dropdown dot, not the SVG
const THEME_COLORS: Record<Theme, string> = {
  dawn:  "#e8590c",
  day:   "#0071e3",
  dusk:  "#f5a623",
  night: "#2997ff",
};

export function ThemeClock() {
  const { theme, setTheme, resetToAuto, isOverride, mounted } = useThemeContext();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const [open, setOpen] = useState(false);
  const [handAngle, setHandAngle] = useState(0); // stable SSR default

  // Sync hand angle to current hour after mount (client-only)
  useEffect(() => {
    setHandAngle(getAngleFromHour24(new Date().getHours()));
  }, []);

  useEffect(() => {
    if (!isOverride && mounted) {
      setHandAngle(getAngleFromHour24(new Date().getHours()));
    }
  }, [isOverride, mounted]);

  const angleFromEvent = useCallback((e: PointerEvent | React.PointerEvent) => {
    if (!svgRef.current) return 0;
    const { left, top, width, height } = svgRef.current.getBoundingClientRect();
    let angle = Math.atan2(e.clientX - (left + width / 2), -(e.clientY - (top + height / 2))) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  // Drag → map angle over a full 24h cycle so every theme is reachable.
  const applyAngle = useCallback((angle: number) => {
    setHandAngle(angle);
    setTheme(getThemeFromHour(getHourFromAngle24(angle)));
  }, [setTheme]);

  // Dropdown pick → set theme AND move the hand to that theme's window.
  const pickTheme = useCallback((t: Theme) => {
    setTheme(t);
    setHandAngle(getAngleFromHour24(themeRepresentativeHour[t]));
    setOpen(false);
  }, [setTheme]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (dragging.current) applyAngle(angleFromEvent(e)); };
    const onUp   = () => { dragging.current = false; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup",   onUp);
    };
  }, [angleFromEvent, applyAngle]);

  const hx = 20 + 13 * Math.sin((handAngle * Math.PI) / 180);
  const hy = 20 - 13 * Math.cos((handAngle * Math.PI) / 180);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-70"
        style={{ color: "var(--text-secondary)", background: "var(--card-border)" }}
      >
        {/*
          SVG uses `var(--accent)` for all colors — no JS value, so
          server and client render identical markup. No hydration mismatch.
        */}
        <svg
          ref={svgRef}
          width="28"
          height="28"
          viewBox="0 0 40 40"
          style={{ cursor: "grab", touchAction: "none", flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragging.current = true;
            applyAngle(angleFromEvent(e));
          }}
        >
          <circle cx="20" cy="20" r="18" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.25" />
          <circle cx="20" cy="20" r="2" fill="var(--accent)" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * 2 * Math.PI;
            return (
              <line
                key={i}
                x1={20 + 15 * Math.sin(a)} y1={20 - 15 * Math.cos(a)}
                x2={20 + 17 * Math.sin(a)} y2={20 - 17 * Math.cos(a)}
                stroke="var(--accent)" strokeWidth="1.5" opacity="0.35"
              />
            );
          })}
          <line x1="20" y1="20" x2={hx} y2={hy} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/*
          suppressHydrationWarning: server renders "Night" (SSR default),
          client immediately corrects it. Acceptable single-render flicker.
        */}
        <span suppressHydrationWarning>{mounted ? themeLabels[theme] : ""}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-9 z-50 rounded-2xl overflow-hidden"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              boxShadow: "var(--shadow-lg)",
              minWidth: 160,
              backdropFilter: "var(--blur-nav)",
              WebkitBackdropFilter: "var(--blur-nav)",
            }}
          >
            <div className="px-3 pt-3 pb-1">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                Theme
              </p>
              {(["dawn", "day", "dusk", "night"] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => pickTheme(t)}
                  className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2 text-sm transition-colors text-left mb-0.5"
                  style={{
                    background: theme === t ? "var(--accent-soft)" : "transparent",
                    color:      theme === t ? "var(--accent)"      : "var(--text-secondary)",
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: THEME_COLORS[t] }} />
                  {themeLabels[t]}
                </button>
              ))}
            </div>
            {isOverride && (
              <div className="px-3 pt-1 pb-3" style={{ borderTop: "1px solid var(--card-border)" }}>
                <button
                  onClick={() => { resetToAuto(); setOpen(false); }}
                  className="mt-2 w-full text-[11px] font-medium py-1.5 rounded-lg transition-colors"
                  style={{ color: "var(--accent)", background: "var(--accent-soft)" }}
                >
                  Reset to default
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
