"use client";

import { useState } from "react";
import { X, Sparkles, Plus, Copy, Check, Trash2, RefreshCw } from "lucide-react";
import type { JobApplication, ApplicationQuestion } from "@/types";

interface Props {
  app: JobApplication;
  onSaveQuestions: (questions: ApplicationQuestion[]) => void;
  onClose: () => void;
}

const blank = (): ApplicationQuestion => ({ id: crypto.randomUUID(), question: "", answer: "" });

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export function QuestionsStudio({ app, onSaveQuestions, onClose }: Props) {
  const [questions, setQuestions] = useState<ApplicationQuestion[]>(
    app.questions?.length ? app.questions : [blank()]
  );
  const [extraPrompt, setExtraPrompt] = useState("");
  /** ids currently being generated; empty when idle. */
  const [busy, setBusy] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const persist = (
    next: ApplicationQuestion[] | ((prev: ApplicationQuestion[]) => ApplicationQuestion[])
  ) => {
    setQuestions((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      onSaveQuestions(value);
      return value;
    });
  };

  const update = (id: string, patch: Partial<ApplicationQuestion>) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const add = () => persist((prev) => [...prev, blank()]);
  const removeQuestion = (id: string) => persist((prev) => prev.filter((q) => q.id !== id));

  /** Generate answers for the given questions (all answerable ones by default). */
  const generate = async (ids?: string[]) => {
    const targets = questions.filter(
      (q) => q.question.trim() && (!ids || ids.includes(q.id))
    );
    if (targets.length === 0) {
      setError("Add a question first.");
      return;
    }

    setBusy(targets.map((q) => q.id));
    setError("");
    try {
      const res = await fetch("/api/application-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: app.company,
          role: app.role,
          jobDescription: app.jobDescription,
          companyWebsite: app.companyWebsite,
          location: app.location,
          notes: app.notes,
          coverLetter: app.coverLetter,
          extraPrompt,
          questions: targets.map((q) => ({
            id: q.id,
            question: q.question,
            wordLimit: q.wordLimit,
            hint: q.hint,
            current: q.answer,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      const answers = new Map<string, string>(
        (data.answers as { id: string; answer: string }[]).map((a) => [a.id, a.answer])
      );
      persist((prev) =>
        prev.map((q) => (answers.has(q.id) ? { ...q, answer: answers.get(q.id)! } : q))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate. Try again.");
    } finally {
      setBusy([]);
    }
  };

  const copy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 1600);
  };

  const copyAll = () => {
    const text = questions
      .filter((q) => q.question.trim())
      .map((q) => `${q.question.trim()}\n\n${q.answer.trim() || "(no answer yet)"}`)
      .join("\n\n———\n\n");
    void copy("all", text);
  };

  const answered = questions.filter((q) => q.answer.trim()).length;
  const asked = questions.filter((q) => q.question.trim()).length;
  const generating = busy.length > 0;
  const inputStyle = { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--line)" } as const;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-3">
          <div>
            <h3 className="headline text-xl" style={{ color: "var(--text)" }}>Application questions</h3>
            <p className="text-[12.5px]" style={{ color: "var(--text-2)" }}>
              {app.role} · {app.company}
              {asked > 0 ? <span style={{ color: "var(--text-3)" }}> · {answered}/{asked} answered</span> : null}
            </p>
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
              placeholder="e.g. lean on the fintech work; keep the tone plain; mention the Andela mentorship."
              className="w-full min-h-16 resize-y rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
              style={inputStyle}
            />
          </label>

          {questions.map((q, i) => {
            const words = countWords(q.answer);
            const over = q.wordLimit ? words > q.wordLimit : false;
            const thisBusy = busy.includes(q.id);

            return (
              <div key={q.id} className="rounded-2xl p-4" style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="eyebrow" style={{ color: "var(--text-3)" }}>Question {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => generate([q.id])}
                      disabled={generating || !q.question.trim()}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
                      style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                    >
                      {thisBusy ? (
                        <span
                          className="h-3 w-3 animate-spin rounded-full"
                          style={{ border: "2px solid var(--accent-soft)", borderTopColor: "var(--accent)" }}
                        />
                      ) : q.answer.trim() ? (
                        <RefreshCw size={12} />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      {q.answer.trim() ? "Redraft" : "Draft"}
                    </button>
                    <button
                      onClick={() => copy(q.id, q.answer)}
                      disabled={!q.answer.trim()}
                      className="rounded-full p-1.5 transition-opacity hover:opacity-70 disabled:opacity-30"
                      style={{ color: "var(--text-2)" }}
                      aria-label="Copy answer"
                    >
                      {copiedId === q.id ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="rounded-full p-1.5 transition-opacity hover:opacity-70"
                      style={{ color: "var(--text-2)" }}
                      aria-label="Remove question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <textarea
                  value={q.question}
                  onChange={(e) => update(q.id, { question: e.target.value })}
                  onBlur={() => onSaveQuestions(questions)}
                  placeholder="Paste the question from the application form…"
                  className="w-full min-h-14 resize-y rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium outline-none"
                  style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--line)" }}
                />

                <div className="mt-2 grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min={1}
                    value={q.wordLimit ?? ""}
                    onChange={(e) =>
                      update(q.id, { wordLimit: e.target.value ? Number(e.target.value) : undefined })
                    }
                    onBlur={() => onSaveQuestions(questions)}
                    placeholder="Word limit"
                    className="rounded-xl px-3 py-2 text-[12.5px] outline-none"
                    style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--line)" }}
                  />
                  <input
                    value={q.hint ?? ""}
                    onChange={(e) => update(q.id, { hint: e.target.value })}
                    onBlur={() => onSaveQuestions(questions)}
                    placeholder="Steer this answer (optional)"
                    className="col-span-2 rounded-xl px-3 py-2 text-[12.5px] outline-none"
                    style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--line)" }}
                  />
                </div>

                <textarea
                  value={q.answer}
                  onChange={(e) => update(q.id, { answer: e.target.value })}
                  onBlur={() => onSaveQuestions(questions)}
                  placeholder="Draft with AI, then fine-tune the answer here…"
                  className="mt-2 w-full min-h-28 resize-y rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed outline-none"
                  style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--line)" }}
                />

                <p className="mt-1.5 text-[11.5px]" style={{ color: over ? "#be123c" : "var(--text-3)" }}>
                  {words} word{words === 1 ? "" : "s"}
                  {q.wordLimit ? ` / ${q.wordLimit}${over ? " — over the limit" : ""}` : ""}
                </p>
              </div>
            );
          })}

          <button
            onClick={add}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[13px] font-semibold transition-opacity hover:opacity-70"
            style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px dashed var(--line)" }}
          >
            <Plus size={15} /> Add question
          </button>

          {error && <p className="text-[12px]" style={{ color: "#be123c" }}>{error}</p>}
        </div>

        <div className="flex gap-2 px-6 py-4" style={{ borderTop: "1px solid var(--line)" }}>
          <button onClick={copyAll} disabled={asked === 0} className="btn btn-ghost flex-1 disabled:opacity-40">
            {copiedId === "all" ? <Check size={15} /> : <Copy size={15} />} {copiedId === "all" ? "Copied" : "Copy all"}
          </button>
          <button onClick={() => generate()} disabled={generating || asked === 0} className="btn btn-primary flex-1 disabled:opacity-50">
            {generating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Sparkles size={15} />
            )}
            {generating ? "Drafting…" : answered > 0 ? "Redraft all" : "Draft all answers"}
          </button>
        </div>
      </div>
    </div>
  );
}
