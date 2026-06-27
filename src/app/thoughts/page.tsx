"use client";

import { useState, useCallback } from "react";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { NewsCard } from "@/components/cards/NewsCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { mockThoughts } from "@/lib/mock-data";
import type { ThoughtItem } from "@/types";

const PAGE_SIZE = 8;

export default function ThoughtsPage() {
  const [items, setItems] = useState<ThoughtItem[]>(mockThoughts.slice(0, PAGE_SIZE));
  const [hasMore, setHasMore] = useState(mockThoughts.length > PAGE_SIZE);

  const loadMore = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    const next = mockThoughts.slice(items.length, items.length + PAGE_SIZE);
    setItems((prev) => [...prev, ...next]);
    if (items.length + PAGE_SIZE >= mockThoughts.length) setHasMore(false);
  }, [items.length]);

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
          renderCard={(item, index) => <NewsCard item={item} basePath="thoughts" priority={index === 0} />}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </section>
    </>
  );
}
