"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AwardChips } from "@/components/detail/AwardChips";
import { EntityImage } from "@/components/ui/EntityImage";
import type { ResumeEntry } from "@/types";

interface Props {
  entry: ResumeEntry;
  onChipClick: (name: string, type: "skill" | "tool") => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function ResumeEntryCard({ entry, onChipClick }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden theme-card">
      <button
        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
              {entry.title}
            </h3>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {entry.company}
            </span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(entry.startDate)} — {entry.endDate ? formatDate(entry.endDate) : "Present"}
          </p>
        </div>
        <ChevronDown
          size={16}
          className="shrink-0 mt-1 transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t" style={{ borderColor: "var(--card-border)" }}>
          <p className="text-sm leading-relaxed mt-4 mb-4" style={{ color: "var(--text-secondary)" }}>
            {entry.description}
          </p>

          {entry.highlights && entry.highlights.length > 0 && (
            <ul className="mb-5 space-y-1.5">
              {entry.highlights.map((h, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--accent)" }}>▸</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {entry.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--text-muted)" }}>
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.skills.map((s) => (
                  <button
                    key={s._id}
                    onClick={(e) => { e.stopPropagation(); onChipClick(s.name, "skill"); }}
                    className="inline-flex items-center gap-1.5 text-xs py-1 pl-1.5 pr-3 rounded-full font-semibold transition-all hover:scale-105"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    <EntityImage image={s.image} url={s.url} label={s.name} size={16} />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {entry.tools.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: "var(--text-muted)" }}>
                Tools
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.tools.map((t) => (
                  <button
                    key={t._id}
                    onClick={(e) => { e.stopPropagation(); onChipClick(t.name, "tool"); }}
                    className="inline-flex items-center gap-1.5 text-xs py-1 pl-1.5 pr-3 rounded-full font-medium transition-all hover:scale-105"
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <EntityImage image={t.image} url={t.url} label={t.name} size={16} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AwardChips awards={entry.awards ?? []} className="mt-5" />
        </div>
      )}
    </div>
  );
}
