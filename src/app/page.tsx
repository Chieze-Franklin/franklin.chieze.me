"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero/Hero";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { NewsCard } from "@/components/cards/NewsCard";
import { mockNews } from "@/lib/mock-data";
import type { NewsItem } from "@/types";

const PAGE_SIZE = 8;

const stats = [
  { value: "7+", label: "Years building" },
  { value: "12", label: "Engineers led" },
  { value: "50+", label: "Clients served" },
  { value: "3", label: "Companies shaped" },
];

const pillars = [
  { title: "Works", desc: "Products, platforms, and the teams behind them.", href: "/works" },
  { title: "Plays", desc: "Experiments, side projects, and things I build for fun.", href: "/plays" },
  { title: "Thoughts", desc: "Essays on engineering, startups, and building for Africa.", href: "/thoughts" },
];

export default function HomePage() {
  const [items, setItems] = useState<NewsItem[]>(mockNews.slice(0, PAGE_SIZE));
  const [hasMore, setHasMore] = useState(mockNews.length > PAGE_SIZE);

  const loadMore = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    const next = mockNews.slice(items.length, items.length + PAGE_SIZE);
    setItems((prev) => [...prev, ...next]);
    if (items.length + PAGE_SIZE >= mockNews.length) setHasMore(false);
  }, [items.length]);

  return (
    <>
      <Hero />

      {/* ── Stats strip ─────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
        <div className="grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p
                className="display"
                style={{ fontSize: "clamp(2.4rem, 6vw, 3.4rem)", color: "var(--text)" }}
              >
                {s.value}
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--text-2)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pillars / explore ──────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <Link key={p.title} href={p.href} className="card group p-7">
              <h3 className="headline text-2xl" style={{ color: "var(--text)" }}>
                {p.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-2)" }}>
                {p.desc}
              </p>
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-transform group-hover:translate-x-1"
                style={{ color: "var(--accent)" }}
              >
                Explore <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Latest news ────────────────────────────────────── */}
      <section id="latest" className="mx-auto w-full max-w-7xl px-6 pb-28 scroll-mt-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
              Latest
            </p>
            <h2 className="headline text-3xl sm:text-4xl" style={{ color: "var(--text)" }}>
              In the news
            </h2>
          </div>
        </div>

        <MasonryGrid
          items={items}
          renderCard={(item, index) => (
            <NewsCard item={item} basePath="news" priority={index === 0} />
          )}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </section>
    </>
  );
}
