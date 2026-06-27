"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAIQuota } from "@/hooks/useAIQuota";
import { siteConfig } from "@/config/site";
import { MessageCircle, X, Send, ArrowUpRight } from "lucide-react";
import type { ChatMessage } from "@/types";

export function AIAssistant() {
  const pathname = usePathname();
  const { count, increment, isExhausted } = useAIQuota();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! Ask me anything about Franklin — his work, background, or how to get in touch." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    if (isExhausted) {
      setMessages((m) => [
        ...m,
        { role: "user", content: text },
        { role: "assistant", content: "You've reached your daily limit. Reach out to Franklin directly!" },
      ]);
      return;
    }

    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    increment();

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, { role: "user", content: text }], currentPage: pathname }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "var(--accent)",
          boxShadow: "0 4px 24px color-mix(in srgb, var(--accent) 50%, transparent)",
        }}
        aria-label={open ? "Close assistant" : "Open AI assistant"}
      >
        <span
          className="transition-all duration-200"
          style={{ color: "#fff", display: "flex" }}
        >
          {open ? <X size={18} strokeWidth={2.5} /> : <MessageCircle size={18} strokeWidth={2} />}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-19 right-6 z-50 flex flex-col rounded-[20px] overflow-hidden"
          style={{
            width: 340,
            height: 460,
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-lg)",
            backdropFilter: "var(--blur-nav)",
            WebkitBackdropFilter: "var(--blur-nav)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: "1px solid var(--card-border)" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Ask Franklin&apos;s AI
              </p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {count} / {siteConfig.ai.dailyQuotaMessages} messages today
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg transition-opacity hover:opacity-50" style={{ color: "var(--text-muted)" }}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[82%] rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed"
                  style={
                    m.role === "user"
                      ? { background: "var(--accent)", color: "#fff" }
                      : { background: "var(--bg-secondary)", color: "var(--text-primary)" }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-[14px] px-3.5 py-2.5 flex gap-1"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "var(--text-muted)",
                        animation: `pulse-line 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {isExhausted && (
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={siteConfig.socials.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-[14px] py-2.5 text-[13px] font-medium"
                  style={{ background: "#25d366", color: "#fff" }}
                >
                  WhatsApp <ArrowUpRight size={13} />
                </a>
                <a
                  href={`mailto:${siteConfig.socials.email}`}
                  className="flex items-center justify-center gap-2 rounded-[14px] py-2.5 text-[13px] font-medium"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  Email Franklin <ArrowUpRight size={13} />
                </a>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="shrink-0 px-3 py-3 flex items-center gap-2"
            style={{ borderTop: "1px solid var(--card-border)" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={isExhausted ? "Daily limit reached" : "Ask something…"}
              disabled={isExhausted || loading}
              className="flex-1 rounded-[10px] px-3 py-2 text-[13px] outline-none disabled:opacity-40"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--card-border)",
              }}
            />
            <button
              onClick={send}
              disabled={isExhausted || loading || !input.trim()}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-all disabled:opacity-30 hover:opacity-80 active:scale-95"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Send size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
