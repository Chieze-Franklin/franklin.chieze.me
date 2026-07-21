"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { EntityImage } from "@/components/ui/EntityImage";

interface Opt {
  _id: string;
  [key: string]: string | undefined;
}

/**
 * Single-select for a taxonomy collection (e.g. company). Shows existing options
 * as chips (click to select/deselect) and lets the admin create a new one inline.
 */
export function EntitySelect({
  endpoint,
  labelKey,
  title,
  value,
  onChange,
  imageKey,
  urlKey,
}: {
  endpoint: string;
  labelKey: string; // "name"
  title: string;
  value: string; // selected id ("" = none)
  onChange: (id: string) => void;
  imageKey?: string; // optional field holding a thumbnail URL
  urlKey?: string; // optional field holding a website URL (favicon fallback)
}) {
  const [options, setOptions] = useState<Opt[]>([]);
  const [newVal, setNewVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (active && res.ok) setOptions(data.items ?? []);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, [endpoint]);

  const addNew = async () => {
    const v = newVal.trim();
    if (!v) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [labelKey]: v }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOptions((prev) => (prev.some((o) => o._id === data._id) ? prev : [...prev, data]));
      onChange(data._id);
      setNewVal("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-secondary)" }}>
        {title}
      </span>

      {options.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {options.map((o) => {
            const on = value === o._id;
            const image = imageKey ? o[imageKey] : undefined;
            const url = urlKey ? o[urlKey] : undefined;
            const hasIcon = Boolean(image || url);
            return (
              <button
                key={o._id}
                type="button"
                onClick={() => onChange(on ? "" : o._id)}
                className={`inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-[12px] font-medium transition-colors ${hasIcon ? "pl-1.5" : "pl-3"}`}
                style={
                  on
                    ? { background: "var(--accent)", color: "#fff" }
                    : { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--card-border)" }
                }
              >
                {hasIcon ? <EntityImage image={image} url={url} label={o[labelKey]} size={16} /> : null}
                {o[labelKey]}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          className="admin-input"
          value={newVal}
          placeholder={`Add a new ${title.toLowerCase()}…`}
          onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addNew();
            }
          }}
        />
        <button type="button" className="btn btn-ghost !px-3 !py-2 shrink-0" onClick={addNew} disabled={busy || !newVal.trim()}>
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: "#be123c" }}>
          {error}
        </p>
      )}
    </div>
  );
}
