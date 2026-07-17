"use client";

import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";

/** Editor for a single key/value setting (e.g. the résumé intro). */
export function IntroEditor({ settingKey, placeholder }: { settingKey: string; placeholder?: string }) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/settings/${settingKey}`);
        const data = await res.json();
        if (active && res.ok) setValue(data.value ?? "");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, [settingKey]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`/api/settings/${settingKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <textarea
        className="admin-input"
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-2 flex items-center gap-3">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
          {saved ? "Saved" : "Save intro"}
        </button>
        {error && (
          <span className="text-sm" style={{ color: "#be123c" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
