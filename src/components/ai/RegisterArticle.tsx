"use client";

import { useEffect } from "react";
import { setCurrentArticle, type CurrentArticle } from "@/lib/current-article";

/**
 * Registers the current article in the shared store while mounted, so the chat
 * widget knows what the reader is looking at. Renders nothing.
 */
export function RegisterArticle({ title, summary, content, slug }: CurrentArticle) {
  useEffect(() => {
    setCurrentArticle({ title, summary, content, slug });
    return () => setCurrentArticle(null);
  }, [title, summary, content, slug]);
  return null;
}
