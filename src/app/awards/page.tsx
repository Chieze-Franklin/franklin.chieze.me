"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AwardCard } from "@/components/awards/AwardCard";
import { mockAwards } from "@/lib/mock-data";

type Filter = "all" | "award" | "certification";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "award", label: "Awards" },
  { id: "certification", label: "Certifications" },
];

export default function AwardsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(() => {
    const list = filter === "all" ? mockAwards : mockAwards.filter((a) => a.kind === filter);
    return [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [filter]);

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
      </section>
    </>
  );
}
