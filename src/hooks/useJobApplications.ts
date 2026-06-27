"use client";

import { useState, useEffect, useCallback } from "react";
import type { JobApplication } from "@/types";

const KEY = "fchieze-applications";

/**
 * Local-first job application store. Persists to localStorage so the tracker
 * works without a backend; swap the read/write calls for API routes later.
 */
export function useJobApplications() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setApps(JSON.parse(raw));
    } catch {
      /* ignore corrupt data */
    }
    setLoaded(true);
  }, []);

  const write = (next: JobApplication[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  };

  const upsert = useCallback((app: JobApplication) => {
    setApps((prev) => {
      const exists = prev.some((a) => a._id === app._id);
      const next = exists ? prev.map((a) => (a._id === app._id ? app : a)) : [app, ...prev];
      return write(next);
    });
  }, []);

  const remove = useCallback((id: string) => {
    setApps((prev) => write(prev.filter((a) => a._id !== id)));
  }, []);

  return { apps, loaded, upsert, remove };
}
