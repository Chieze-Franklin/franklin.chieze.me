"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";

const STORAGE_KEY = "fchieze-ai-quota";

interface QuotaStore {
  date: string;
  count: number;
}

export function useAIQuota() {
  const [count, setCount] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored: QuotaStore = JSON.parse(raw);
      if (stored.date === today) {
        setCount(stored.count);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
        setCount(0);
      }
    }
  }, [today]);

  const increment = () => {
    const next = count + 1;
    setCount(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: next }));
  };

  const isExhausted = count >= siteConfig.ai.dailyQuotaMessages;

  return { count, increment, isExhausted, quota: siteConfig.ai.dailyQuotaMessages };
}
