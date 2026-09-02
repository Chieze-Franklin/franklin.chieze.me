"use client";

import { useState, useEffect, useCallback } from "react";
import type { JobApplication } from "@/types";

/** Where the old browser-local tracker kept its data. Read-only now — the
 *  database is the source of truth; this is only the migration source. */
const LEGACY_KEY = "fchieze-applications";
/** Set once the legacy data has been imported, so the banner stays gone. */
const MIGRATED_KEY = "fchieze-applications-migrated";

/** An application on its way to the server: no `_id` yet when it is new. */
export type ApplicationDraft = Omit<JobApplication, "_id" | "createdAt" | "updatedAt"> &
  Partial<Pick<JobApplication, "_id" | "createdAt" | "updatedAt">>;

function readLegacy(): JobApplication[] {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((a) => a?.company && a?.role) : [];
  } catch {
    return []; // corrupt data — nothing to migrate
  }
}

/**
 * Database-backed job application store. Applications live in MongoDB behind
 * the admin-only /api/applications routes; anything still sitting in the old
 * localStorage tracker is offered up for a one-time import.
 */
export function useJobApplications() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  /** Legacy applications in this browser that have not been imported yet. */
  const [legacy, setLegacy] = useState<JobApplication[]>([]);
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load applications");
      setApps(data.items);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load applications.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await load();
      // Only offer the import once the database list is in hand.
      if (!cancelled && !localStorage.getItem(MIGRATED_KEY)) setLegacy(readLegacy());
    };
    void init();
    return () => {
      cancelled = true;
    };
  }, [load]);

  /** Create (no `_id`) or update (existing `_id`) an application. */
  const upsert = useCallback(async (app: ApplicationDraft) => {
    const isUpdate = Boolean(app._id);

    // Optimistic: reflect the edit straight away, reconcile with the server after.
    if (isUpdate) {
      setApps((prev) => prev.map((a) => (a._id === app._id ? ({ ...a, ...app } as JobApplication) : a)));
    }

    try {
      const res = await fetch(isUpdate ? `/api/applications/${app._id}` : "/api/applications", {
        method: isUpdate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || "Failed to save");
      setApps((prev) =>
        prev.some((a) => a._id === saved._id)
          ? prev.map((a) => (a._id === saved._id ? saved : a))
          : [saved, ...prev]
      );
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save. Your last change was not stored.");
      void load(); // roll the optimistic edit back to what the server actually has
    }
  }, [load]);

  const remove = useCallback(async (id: string) => {
    const previous = apps;
    setApps((prev) => prev.filter((a) => a._id !== id));
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
      setApps(previous);
    }
  }, [apps]);

  /** One-time import of this browser's localStorage tracker into the database. */
  const importLegacy = useCallback(async () => {
    if (legacy.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch("/api/applications/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applications: legacy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setApps(data.items);
      // The localStorage copy is deliberately left in place as a backup.
      localStorage.setItem(MIGRATED_KEY, new Date().toISOString());
      setLegacy([]);
      setError("");
      return { imported: data.imported as number, skipped: data.skipped as number };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  }, [legacy]);

  /** Hide the import prompt without importing — the data stays in the browser. */
  const dismissLegacy = useCallback(() => setLegacy([]), []);

  return {
    apps,
    loaded,
    error,
    upsert,
    remove,
    legacyCount: legacy.length,
    importing,
    importLegacy,
    dismissLegacy,
  };
}
