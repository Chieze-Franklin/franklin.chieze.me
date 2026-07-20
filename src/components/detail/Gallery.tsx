"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Screenshot gallery: a horizontal strip of thumbnails that open a full-screen
 * lightbox carousel on click (keyboard + arrow navigation).
 */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );

  // Keyboard controls + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="mb-10 -mx-4 sm:mx-0">
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-0 pb-2 snap-x">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              className="relative h-64 w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
              style={{ border: "1px solid var(--card-border)" }}
              aria-label={`View ${title} screenshot ${i + 1}`}
            >
              <Image src={src} alt={`${title} screenshot ${i + 1}`} fill className="object-cover" sizes="480px" />
            </button>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 sm:left-6 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                aria-label="Previous"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 sm:right-6 flex h-11 w-11 items-center justify-center rounded-full transition-colors"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                aria-label="Next"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          <div className="relative h-[85vh] w-[90vw] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[index]}
              alt={`${title} screenshot ${index + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <div
              className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[12px] font-medium"
              style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
            >
              {index + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
