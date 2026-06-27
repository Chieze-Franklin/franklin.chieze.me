"use client";

import { X } from "lucide-react";
import type { ResumeEntry } from "@/types";

interface Props {
  name: string;
  type: "skill" | "tool";
  entries: ResumeEntry[];
  onClose: () => void;
}

function getYearRange(entries: ResumeEntry[]): number[] {
  const years = new Set<number>();
  entries.forEach((e) => {
    const start = new Date(e.startDate).getFullYear();
    const end = e.endDate ? new Date(e.endDate).getFullYear() : new Date().getFullYear();
    for (let y = start; y <= end; y++) years.add(y);
  });
  return Array.from(years).sort();
}

export function SkillToolModal({ name, type, entries, onClose }: Props) {
  const matching = entries.filter((e) =>
    type === "skill" ? e.skills.includes(name) : e.tools.includes(name)
  );

  const allYears = getYearRange(entries);
  const usageByYear = allYears.map((year) => ({
    year,
    active: matching.some((e) => {
      const start = new Date(e.startDate).getFullYear();
      const end = e.endDate ? new Date(e.endDate).getFullYear() : new Date().getFullYear();
      return year >= start && year <= end;
    }),
  }));

  const maxBar = Math.max(...usageByYear.map((y) => (y.active ? 1 : 0)), 1);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl p-6"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {type}
            </span>
            <h3
              className="text-2xl font-black mt-0.5"
              style={{ color: "var(--text-primary)" }}
            >
              {name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <div>
            <p className="text-3xl font-black" style={{ color: "var(--accent)" }}>
              {matching.length}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {matching.length === 1 ? "role" : "roles"}
            </p>
          </div>
          <div>
            <p className="text-3xl font-black" style={{ color: "var(--accent)" }}>
              {usageByYear.filter((y) => y.active).length}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              years active
            </p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="mb-6">
          <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Usage over time
          </p>
          <div className="flex items-end gap-1 h-16">
            {usageByYear.map(({ year, active }) => (
              <div key={year} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: active ? `${(1 / maxBar) * 48}px` : "4px",
                    background: active ? "var(--accent)" : "var(--card-border)",
                    minHeight: "4px",
                  }}
                />
                {allYears.length <= 10 && (
                  <span
                    className="text-[9px] rotate-45 origin-left"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {String(year).slice(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Roles list */}
        {matching.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Used at
            </p>
            <div className="flex flex-col gap-1.5">
              {matching.map((e) => (
                <div
                  key={e._id}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <span style={{ color: "var(--text-primary)" }}>
                    {e.title}, <span style={{ color: "var(--text-secondary)" }}>{e.company}</span>
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {new Date(e.startDate).getFullYear()}
                    {e.endDate
                      ? `–${new Date(e.endDate).getFullYear()}`
                      : "–present"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
