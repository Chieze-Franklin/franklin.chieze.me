"use client";

import { useState, useCallback } from "react";
import { MasonryGrid } from "@/components/cards/MasonryGrid";
import { NewsCard } from "@/components/cards/NewsCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { mockWorks } from "@/lib/mock-data";
import type { WorkItem } from "@/types";

const PAGE_SIZE = 6;

export default function WorksPage() {
  const [items, setItems] = useState<WorkItem[]>(mockWorks.slice(0, PAGE_SIZE));
  const [hasMore, setHasMore] = useState(mockWorks.length > PAGE_SIZE);

  const loadMore = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    const next = mockWorks.slice(items.length, items.length + PAGE_SIZE);
    setItems((prev) => [...prev, ...next]);
    if (items.length + PAGE_SIZE >= mockWorks.length) setHasMore(false);
  }, [items.length]);

  return (
    <>
      <PageHeader
        eyebrow="Works"
        title="Products & platforms"
        subtitle="The products I've built and the teams behind them. Looking for my full résumé? See the CV."
      />
      <section className="mx-auto w-full max-w-7xl px-6 pb-28">
        <MasonryGrid
          items={items}
          renderCard={(item, index) => (
            <NewsCard item={item} basePath="works" priority={index === 0} />
          )}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </section>
    </>
  );
}
