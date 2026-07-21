"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";

type Tool = {
  icon: React.ReactNode;
  title: string;
  command: string;
  arg?: string;
  /** Prompt for a URL before running (used by createLink). */
  prompt?: boolean;
};

// Pure config — no ref access here, so it's safe to build/map during render.
const TOOLBAR: Tool[][] = [
  [
    { icon: <Bold size={16} />, title: "Bold", command: "bold" },
    { icon: <Italic size={16} />, title: "Italic", command: "italic" },
    { icon: <Underline size={16} />, title: "Underline", command: "underline" },
  ],
  [
    { icon: <Heading2 size={16} />, title: "Heading", command: "formatBlock", arg: "H2" },
    { icon: <Heading3 size={16} />, title: "Subheading", command: "formatBlock", arg: "H3" },
    { icon: <Quote size={16} />, title: "Quote", command: "formatBlock", arg: "BLOCKQUOTE" },
    { icon: <Code2 size={16} />, title: "Code block", command: "formatBlock", arg: "PRE" },
  ],
  [
    { icon: <List size={16} />, title: "Bulleted list", command: "insertUnorderedList" },
    { icon: <ListOrdered size={16} />, title: "Numbered list", command: "insertOrderedList" },
  ],
  [
    { icon: <Link2 size={16} />, title: "Insert link", command: "createLink", prompt: true },
    { icon: <Eraser size={16} />, title: "Clear formatting", command: "removeFormat" },
  ],
  [
    { icon: <Undo2 size={16} />, title: "Undo", command: "undo" },
    { icon: <Redo2 size={16} />, title: "Redo", command: "redo" },
  ],
];

/**
 * A lightweight rich-text editor built on contentEditable + execCommand.
 * `value` seeds the initial HTML; edits are reported through onChange as HTML.
 * We intentionally don't re-write the DOM from `value` on every render (that
 * would reset the caret) — it's an uncontrolled editor with a controlled seed.
 */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Seed the editor once on mount.
  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = (tool: Tool) => {
    let arg = tool.arg;
    if (tool.prompt) {
      const url = window.prompt("Link URL");
      if (!url) return;
      arg = url;
    }
    ref.current?.focus();
    document.execCommand(tool.command, false, arg);
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--card-border)" }}>
      <div
        className="flex flex-wrap items-center gap-1 p-2"
        style={{ borderBottom: "1px solid var(--card-border)", background: "var(--surface-2)" }}
      >
        {TOOLBAR.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {gi > 0 && <span className="mx-1 h-5 w-px" style={{ background: "var(--card-border)" }} />}
            {group.map((tool) => (
              <button
                key={tool.title}
                type="button"
                title={tool.title}
                aria-label={tool.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(tool)}
                className="btn btn-ghost !px-2 !py-1.5"
              >
                {tool.icon}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        onBlur={() => onChange(ref.current?.innerHTML ?? "")}
        className="prose-editor min-h-[60vh] p-5 focus:outline-none"
        style={{ color: "var(--text-primary)" }}
        data-placeholder="Write your article…"
      />
    </div>
  );
}
