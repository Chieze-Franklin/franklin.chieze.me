"use client";

import { useState, useCallback } from "react";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { NewsCard } from "@/components/cards/NewsCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { mockPlays } from "@/lib/mock-data";
import type { PlayItem } from "@/types";

const PAGE_SIZE = 8;

export default function PlaysPage() {
  const [items, setItems] = useState<PlayItem[]>(mockPlays.slice(0, PAGE_SIZE));
  const [hasMore, setHasMore] = useState(mockPlays.length > PAGE_SIZE);

  const loadMore = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    const next = mockPlays.slice(items.length, items.length + PAGE_SIZE);
    setItems((prev) => [...prev, ...next]);
    if (items.length + PAGE_SIZE >= mockPlays.length) setHasMore(false);
  }, [items.length]);

  return (
    <>
      <PageHeader
        eyebrow="Plays"
        title="Side projects & experiments"
        subtitle="Things I build for fun, to learn, or because no one else has built them yet."
      />
      <section className="mx-auto w-full max-w-7xl px-6 pb-28">
        <MasonryGrid
          items={items}
          renderCard={(item, index) => <NewsCard item={item} basePath="plays" priority={index === 0} />}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </section>
    </>
  );
}
