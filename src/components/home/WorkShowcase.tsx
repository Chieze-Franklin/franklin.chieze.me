"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { WorkItem } from "@/types";

interface Tile {
  src: string;
  slug: string;
  title: string;
}

// Repeating bento size pattern (grid-flow-dense packs the gaps).
const SPANS = [
  "col-span-2 row-span-2",
  "",
  "",
  "col-span-2",
  "row-span-2",
  "",
  "",
  "",
];

export function WorkShowcase() {
  const [tiles, setTiles] = useState<Tile[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/works?limit=8");
        if (!res.ok) return;
        const data: { items: WorkItem[] } = await res.json();
        const collected: Tile[] = [];
        for (const w of data.items) {
          // Prefer real screenshots; fall back to the cover image. Cap 2 per work
          // so no single project dominates the grid.
          const imgs = (w.images && w.images.length ? w.images : w.coverImage ? [w.coverImage] : []).slice(0, 2);
          for (const src of imgs) collected.push({ src, slug: w.slug, title: w.title });
        }
        if (active) setTiles(collected.slice(0, 8));
      } catch {
        /* leave empty — section stays hidden */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-24">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
            Selected work
          </p>
          <h2 className="headline text-3xl sm:text-4xl" style={{ color: "var(--text)" }}>
            Things I&apos;ve built
          </h2>
        </div>
        <Link
          href="/works"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-transform hover:translate-x-0.5"
          style={{ color: "var(--accent)" }}
        >
          See all <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-flow-dense grid-cols-2 sm:grid-cols-4 auto-rows-[130px] sm:auto-rows-[150px] gap-3">
        {tiles.map((t, i) => (
          <Link
            key={`${t.slug}-${i}`}
            href={`/works/${t.slug}`}
            className={`group relative overflow-hidden rounded-2xl ${SPANS[i % SPANS.length]}`}
            style={{ border: "1px solid var(--card-border)" }}
          >
            <Image
              src={t.src}
              alt={t.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            <span
              className="absolute inset-x-0 bottom-0 p-3 text-[13px] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
            >
              {t.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
