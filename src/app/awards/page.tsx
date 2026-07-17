"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AwardCard } from "@/components/awards/AwardCard";
import type { Award } from "@/types";

type Filter = "all" | "award" | "certification";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "award", label: "Awards" },
  { id: "certification", label: "Certifications" },
];

export default function AwardsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/awards");
        const data = await res.json();
        if (active && res.ok) setAwards(data.items ?? []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo(() => {
    const list = filter === "all" ? awards : awards.filter((a) => a.kind === filter);
    // Newest first; awards without a date sort last.
    return [...list].sort((a, b) => (a.date ? +new Date(a.date) : 0) < (b.date ? +new Date(b.date) : 0) ? 1 : -1);
  }, [filter, awards]);

  return (
    <>
      <PageHeader
        eyebrow="Recognition"
        title="Awards & certifications"
        subtitle="Honours and credentials — each linked to the work, roles, and ideas behind them."
      />

      <section className="mx-auto w-full max-w-3xl px-6 pb-28">
        {/* Filter pills */}
        <div className="mb-8 flex justify-center gap-2">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors"
                style={{
                  background: active ? "var(--accent)" : "var(--surface)",
                  color: active ? "#fff" : "var(--text-2)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--line)"}`,
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          {items.map((a) => (
            <AwardCard key={a._id} award={a} />
          ))}
        </div>

        {!loading && items.length === 0 && (
          <p className="py-16 text-center text-sm" style={{ color: "var(--text-3)" }}>
            No {filter === "all" ? "awards or certifications" : filter === "award" ? "awards" : "certifications"} yet.
          </p>
        )}
      </section>
    </>
  );
}
