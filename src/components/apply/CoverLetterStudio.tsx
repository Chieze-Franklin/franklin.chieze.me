"use client";

import { useState, useRef } from "react";
import { X, Sparkles, Copy, Check, Download } from "lucide-react";
import { CoverLetterPreview, type LetterTemplate } from "./CoverLetterPreview";
import { siteConfig } from "@/config/site";
import type { JobApplication } from "@/types";

interface Props {
  app: JobApplication;
  onSaveLetter: (letter: string) => void;
  onClose: () => void;
}

const TEMPLATES: { id: LetterTemplate; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

export function CoverLetterStudio({ app, onSaveLetter, onClose }: Props) {
  const [body, setBody] = useState(app.coverLetter ?? "");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [template, setTemplate] = useState<LetterTemplate>("classic");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: app.company,
          role: app.role,
          jobDescription: app.jobDescription,
          companyWebsite: app.companyWebsite,
          extraPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBody(data.letter);
      onSaveLetter(data.letter);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const persist = () => onSaveLetter(body);

  const download = () => {
    const node = previewRef.current;
    if (!node) return;
    const w = window.open("", "_blank", "width=820,height=1060");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>${siteConfig.name} — Cover letter, ${app.company}</title>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .doc { width: 100%; }
  .doc > div { width: 100% !important; box-shadow: none !important; }
</style></head>
<body><div class="doc">${node.outerHTML}</div>
<script>window.onload=function(){setTimeout(function(){window.print();},250);};</script>
</body></html>`);
    w.document.close();
  };

  const inputStyle = { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--line)" } as const;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl md:flex-row"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls */}
        <div className="flex w-full flex-col md:w-96 md:shrink-0" style={{ borderRight: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between px-6 pt-6 pb-3">
            <div>
              <h3 className="headline text-xl" style={{ color: "var(--text)" }}>Cover letter</h3>
              <p className="text-[12.5px]" style={{ color: "var(--text-2)" }}>{app.role} · {app.company}</p>
            </div>
            <button onClick={onClose} className="p-1 transition-opacity hover:opacity-60" style={{ color: "var(--text-2)" }}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "var(--text-2)" }}>
                Extra instructions (optional)
              </span>
              <textarea
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                placeholder="e.g. emphasise fintech experience; mention referral by Ada; keep it under 250 words."
                className="w-full min-h-20 resize-y rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
                style={inputStyle}
              />
            </label>

            <button onClick={generate} disabled={generating} className="btn btn-primary w-full disabled:opacity-50">
              {generating ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {generating ? "Generating…" : body ? "Regenerate" : "Generate with AI"}
            </button>
            {error && <p className="text-[12px]" style={{ color: "#be123c" }}>{error}</p>}

            {/* Editable body */}
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium" style={{ color: "var(--text-2)" }}>
                Letter (editable)
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={persist}
                placeholder="Generate a draft, then fine-tune it here…"
                className="w-full min-h-44 resize-y rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed outline-none"
                style={inputStyle}
              />
            </label>

            {/* Template */}
            <div>
              <p className="eyebrow mb-2" style={{ color: "var(--text-3)" }}>Template</p>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => {
                  const active = template === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className="rounded-xl py-2 text-[12.5px] font-semibold transition-all"
                      style={{
                        background: active ? "var(--accent-soft)" : "var(--surface-2)",
                        color: active ? "var(--accent)" : "var(--text-2)",
                        border: `1.5px solid ${active ? "var(--accent)" : "transparent"}`,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid var(--line)" }}>
            <button onClick={copy} disabled={!body} className="btn btn-ghost flex-1 disabled:opacity-40">
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={download} disabled={!body} className="btn btn-primary flex-1 disabled:opacity-40">
              <Download size={15} /> Download
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="hidden flex-1 items-start justify-center overflow-y-auto p-8 md:flex" style={{ background: "var(--bg-2)" }}>
          <CoverLetterPreview ref={previewRef} body={body} company={app.company} role={app.role} template={template} />
        </div>

        {/* Off-screen preview for mobile download */}
        <div className="md:hidden" style={{ position: "absolute", left: -9999, top: 0 }} aria-hidden>
          <CoverLetterPreview ref={previewRef} body={body} company={app.company} role={app.role} template={template} />
        </div>
      </div>
    </div>
  );
}
