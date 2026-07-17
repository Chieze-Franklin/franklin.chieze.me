"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { NewsCard } from "@/components/cards/NewsCard";
import { PageHeader } from "@/components/layout/PageHeader";
import type { ThoughtItem } from "@/types";

const PAGE_SIZE = 8;

export default function ThoughtsPage() {
  const [items, setItems] = useState<ThoughtItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const requested = useRef<Set<number>>(new Set());

  const loadPage = useCallback(async (skip: number) => {
    if (requested.current.has(skip)) return;
    requested.current.add(skip);
    try {
      const res = await fetch(`/api/thoughts?skip=${skip}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { items: ThoughtItem[]; hasMore: boolean } = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
    } catch {
      requested.current.delete(skip);
      setHasMore(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    requested.current.add(0);
    (async () => {
      try {
        const res = await fetch(`/api/thoughts?skip=0&limit=${PAGE_SIZE}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { items: ThoughtItem[]; hasMore: boolean } = await res.json();
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
      <PageHeader
        eyebrow="Thoughts"
        title="Articles, posts & vlogs"
        subtitle="Ideas about engineering, startups, and building for Africa."
      />
      <section className="mx-auto w-full max-w-7xl px-6 pb-28">
        <MasonryGrid
          items={items}
          renderCard={(item, index) => (
            <NewsCard item={item} basePath="thoughts" priority={index === 0} openExternal={false} />
          )}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </section>
    </>
  );
}
