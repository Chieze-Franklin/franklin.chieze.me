"use client";

import { useState, useRef } from "react";
import { X, Download, Check } from "lucide-react";
import { ResumePreview, type ResumeTemplate } from "./ResumePreview";
import { siteConfig } from "@/config/site";
import type { ResumeEntry, Education, Publication, Award, Hobby } from "@/types";

interface Props {
  entries: ResumeEntry[];
  intro?: string;
  education?: Education[];
  publications?: Publication[];
  awards?: Award[];
  hobbies?: Hobby[];
  onClose: () => void;
}

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string }[] = [
  { id: "minimal", label: "Minimal", desc: "Single column, serif" },
  { id: "classic", label: "Classic", desc: "Sidebar + main" },
  { id: "modern", label: "Modern", desc: "Accent header band" },
  { id: "timeline", label: "Timeline", desc: "Dotted timeline" },
  { id: "compact", label: "Compact", desc: "Dense, one page" },
  { id: "elegant", label: "Elegant", desc: "Centered serif" },
];

const COLORS: { name: string; value: string }[] = [
  { name: "Azure",    value: "#0071e3" },
  { name: "Graphite", value: "#1d1d1f" },
  { name: "Emerald",  value: "#047857" },
  { name: "Violet",   value: "#6d28d9" },
  { name: "Crimson",  value: "#be123c" },
  { name: "Amber",    value: "#b45309" },
  { name: "Teal",     value: "#0f766e" },
  { name: "Slate",    value: "#475569" },
];

export function ResumeDownloadModal({
  entries,
  intro,
  education = [],
  publications = [],
  awards = [],
  hobbies = [],
  onClose,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(entries.map((e) => e._id)));
  const [template, setTemplate] = useState<ResumeTemplate>("minimal");
  const [accent, setAccent] = useState(COLORS[0].value);
  const [sections, setSections] = useState({
    intro: true,
    education: true,
    publications: true,
    awards: true,
    hobbies: true,
  });
  const previewRef = useRef<HTMLDivElement>(null);

  const chosen = entries.filter((e) => selected.has(e._id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setSection = (key: keyof typeof sections, on: boolean) =>
    setSections((s) => ({ ...s, [key]: on }));

  // Props handed to the preview — a section is omitted entirely when toggled off.
  const previewProps = {
    entries: chosen,
    template,
    accent,
    intro: sections.intro ? intro : undefined,
    education: sections.education ? education : undefined,
    publications: sections.publications ? publications : undefined,
    awards: sections.awards ? awards : undefined,
    hobbies: sections.hobbies ? hobbies : undefined,
  };

  // Real "download": print the exact preview node → Save as PDF
  const handleDownload = () => {
    const node = previewRef.current;
    if (!node) return;
    const w = window.open("", "_blank", "width=820,height=1060");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${siteConfig.name} — Résumé</title>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .doc { width: 100%; }
  .doc > div { width: 100% !important; box-shadow: none !important; }
</style></head>
<body><div class="doc">${node.outerHTML}</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body></html>`);
    w.document.close();
  };

  // Which section toggles to show (only when data exists)
  const sectionToggles: { key: keyof typeof sections; label: string; show: boolean }[] = [
    { key: "intro", label: "Intro / profile", show: !!intro },
    { key: "education", label: "Academic background", show: education.length > 0 },
    { key: "publications", label: "Publications", show: publications.length > 0 },
    { key: "awards", label: "Awards & certifications", show: awards.length > 0 },
    { key: "hobbies", label: "Hobbies & interests", show: hobbies.length > 0 },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl md:flex-row"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Controls ─────────────────────────────────────── */}
        <div className="flex w-full flex-col md:w-85 md:shrink-0" style={{ borderRight: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h3 className="headline text-xl" style={{ color: "var(--text)" }}>Résumé studio</h3>
            <button onClick={onClose} className="p-1 transition-opacity hover:opacity-60" style={{ color: "var(--text-2)" }}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-7 overflow-y-auto px-6 pb-4">
            {/* Template */}
            <div>
              <p className="eyebrow mb-3" style={{ color: "var(--text-3)" }}>Template</p>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => {
                  const active = template === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className="rounded-xl p-1.5 text-left transition-all"
                      style={{
                        background: active ? "var(--accent-soft)" : "var(--surface-2)",
                        border: `1.5px solid ${active ? "var(--accent)" : "transparent"}`,
                      }}
                    >
                      <TemplateThumb id={t.id} accent={accent} />
                      <p className="mt-1.5 text-[11px] font-semibold" style={{ color: active ? "var(--accent)" : "var(--text)" }}>
                        {t.label}
                      </p>
                      <p className="text-[9px] leading-tight" style={{ color: "var(--text-3)" }}>{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colour scheme */}
            <div>
              <p className="eyebrow mb-3" style={{ color: "var(--text-3)" }}>Colour scheme</p>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => {
                  const active = accent === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setAccent(c.value)}
                      title={c.name}
                      aria-label={c.name}
                      className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                      style={{ background: c.value, outline: active ? "2px solid var(--text)" : "none", outlineOffset: 2 }}
                    >
                      {active && <Check size={15} color="#fff" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sections */}
            <div>
              <p className="eyebrow mb-3" style={{ color: "var(--text-3)" }}>Sections</p>
              <div className="flex flex-col gap-1.5">
                {sectionToggles.filter((s) => s.show).map((s) => (
                  <Toggle
                    key={s.key}
                    label={s.label}
                    checked={sections[s.key]}
                    onChange={(on) => setSection(s.key, on)}
                  />
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <p className="eyebrow mb-3" style={{ color: "var(--text-3)" }}>Include experience</p>
              <div className="flex flex-col gap-2">
                {entries.map((e) => {
                  const on = selected.has(e._id);
                  return (
                    <label
                      key={e._id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all"
                      style={{
                        background: on ? "var(--accent-soft)" : "var(--surface-2)",
                        border: `1px solid ${on ? "var(--accent)" : "transparent"}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(e._id)}
                        className="h-4 w-4"
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold" style={{ color: "var(--text)" }}>{e.title}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-2)" }}>
                          {e.company} · {new Date(e.startDate).getFullYear()}
                          {e.endDate ? `–${new Date(e.endDate).getFullYear()}` : "–present"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4" style={{ borderTop: "1px solid var(--line)" }}>
            <button onClick={handleDownload} disabled={chosen.length === 0} className="btn btn-primary w-full disabled:opacity-40">
              <Download size={16} />
              Download PDF · {chosen.length} role{chosen.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>

        {/* ── Live preview ─────────────────────────────────── */}
        <div className="hidden flex-1 items-start justify-center overflow-y-auto p-8 md:flex" style={{ background: "var(--bg-2)" }}>
          {chosen.length > 0 ? (
            <ResumePreview ref={previewRef} {...previewProps} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Select at least one role to preview.</p>
            </div>
          )}
        </div>

        {/* Off-screen preview on mobile so download still works */}
        <div className="md:hidden" style={{ position: "absolute", left: -9999, top: 0 }} aria-hidden>
          {chosen.length > 0 && <ResumePreview ref={previewRef} {...previewProps} />}
        </div>
      </div>
    </div>
  );
}

/* Pill toggle switch */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-colors"
      style={{ background: "var(--surface-2)" }}
    >
      <span className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{label}</span>
      <span
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
        style={{ background: checked ? "var(--accent)" : "var(--line)" }}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
        />
      </span>
    </button>
  );
}

/* Tiny abstract thumbnail per template */
function TemplateThumb({ id, accent }: { id: ResumeTemplate; accent: string }) {
  const bar = (w: string, c = "#c9c9c9") => (
    <div style={{ height: 2.5, width: w, background: c, borderRadius: 2 }} />
  );
  return (
    <div style={{ aspectRatio: "3/4", background: "#fff", borderRadius: 6, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}>
      {id === "minimal" && (
        <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 3 }}>
          {bar("70%", accent)}
          {bar("45%")}
          <div style={{ height: 3 }} />
          {bar("90%")} {bar("85%")} {bar("60%")}
        </div>
      )}
      {id === "classic" && (
        <div style={{ display: "flex", height: "100%" }}>
          <div style={{ width: "38%", background: "#f0f0f0", padding: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            {bar("80%", accent)} {bar("70%")} {bar("60%")}
          </div>
          <div style={{ flex: 1, padding: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            {bar("85%")} {bar("90%")} {bar("70%")}
          </div>
        </div>
      )}
      {id === "modern" && (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ background: accent, height: "30%", padding: 5, display: "flex", flexDirection: "column", gap: 3, justifyContent: "center" }}>
            {bar("70%", "rgba(255,255,255,0.9)")} {bar("45%", "rgba(255,255,255,0.6)")}
          </div>
          <div style={{ padding: 5, display: "flex", flexDirection: "column", gap: 3 }}>
            {bar("88%")} {bar("80%")} {bar("65%")}
          </div>
        </div>
      )}
      {id === "timeline" && (
        <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 3 }}>
          {bar("65%", accent)}
          {bar("40%")}
          <div style={{ marginTop: 3, paddingLeft: 8, borderLeft: `2px solid ${accent}`, display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{bar("80%")} {bar("60%")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{bar("75%")} {bar("55%")}</div>
          </div>
        </div>
      )}
      {id === "compact" && (
        <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1.5px solid ${accent}`, paddingBottom: 3 }}>
            {bar("45%", accent)}
            <div style={{ width: "30%", display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-end" }}>{bar("100%", "#d8d8d8")} {bar("80%", "#d8d8d8")}</div>
          </div>
          {bar("95%")} {bar("92%")} {bar("90%")} {bar("70%")}
        </div>
      )}
      {id === "elegant" && (
        <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
          <div style={{ width: "100%", height: 1.5, background: accent }} />
          {bar("55%", "#3a3a3a")}
          {bar("35%")}
          <div style={{ width: "100%", height: 1.5, background: accent }} />
          <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>{bar("85%")} {bar("78%")} {bar("60%")}</div>
        </div>
      )}
    </div>
  );
}
