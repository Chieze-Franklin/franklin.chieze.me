"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface MasonryGridProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
}

export function MasonryGrid<T>({ items, renderCard, onLoadMore, hasMore }: MasonryGridProps<T>) {
  const [loading, setLoading] = useState(false);
  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasMore && !loading && onLoadMore) {
      setLoading(true);
      onLoadMore().finally(() => setLoading(false));
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <div>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4" style={{ columnGap: "1rem" }}>
        {items.map((item, i) => (
          <div key={i} className="break-inside-avoid mb-4">
            {renderCard(item, i)}
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-12 flex items-center justify-center mt-4">
        {loading && (
          <div
            className="h-4 w-4 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
        )}
        {!hasMore && items.length > 0 && (
          <p className="text-[11px] tracking-wide" style={{ color: "var(--text-muted)" }}>
            You&apos;ve reached the end
          </p>
        )}
      </div>
    </div>
  );
}
