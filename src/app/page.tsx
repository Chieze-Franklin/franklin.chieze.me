"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero/Hero";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { NewsCard } from "@/components/cards/NewsCard";
import { siteConfig } from "@/config/site";
import type { NewsItem } from "@/types";

const PAGE_SIZE = 8;

const stats = [
  { value: siteConfig.stats.yearsBuilding, label: "Years building" },
  { value: siteConfig.stats.engineersLed, label: "Engineers led" },
  { value: siteConfig.stats.clientsServed, label: "Clients served" },
  { value: siteConfig.stats.companiesShaped, label: "Companies shaped" },
];

const pillars = [
  { title: "Works", desc: "Products, platforms, and the teams behind them.", href: "/works" },
  { title: "Plays", desc: "Experiments, side projects, and things I build for fun.", href: "/plays" },
  { title: "Thoughts", desc: "Essays on engineering, startups, and building for Africa.", href: "/thoughts" },
];

export default function HomePage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  // Track which page offsets we've already requested so the mount effect and
  // the infinite-scroll observer never fetch the same page twice.
  const requested = useRef<Set<number>>(new Set());

  // Fetch a page of news from the API, appending to what's already loaded.
  const loadPage = useCallback(async (skip: number) => {
    if (requested.current.has(skip)) return;
    requested.current.add(skip);
    try {
      const res = await fetch(`/api/news?skip=${skip}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { items: NewsItem[]; hasMore: boolean } = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch {
      requested.current.delete(skip); // allow a retry on the next trigger
      setHasMore(false);
    }
  }, []);

  // Load the first page on mount. Inlined (rather than calling loadPage) so the
  // only state updates happen after the await, satisfying the effects lint rule.
  useEffect(() => {
    let active = true;
    requested.current.add(0);
    (async () => {
      try {
        const res = await fetch(`/api/news?skip=0&limit=${PAGE_SIZE}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { items: NewsItem[]; hasMore: boolean } = await res.json();
        if (!active) return;
        setItems(data.items);
        setHasMore(data.hasMore);
      } catch {
        requested.current.delete(0);
        if (active) setHasMore(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const loadMore = useCallback(() => loadPage(items.length), [loadPage, items.length]);

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
