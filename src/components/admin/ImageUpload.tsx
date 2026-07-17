"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, Plus } from "lucide-react";

const ACCEPT = "image/png,image/jpeg,image/gif,image/webp,image/svg+xml";

async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

/** Single cover image — upload one, remove deletes it from S3. */
export function CoverImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      onChange(await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = async () => {
    if (!value) return;
    setBusy(true);
    try {
      await fetch(`/api/upload?url=${encodeURIComponent(value)}`, { method: "DELETE" });
      onChange("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative h-44 w-full overflow-hidden rounded-xl" style={{ background: "var(--surface-2)" }}>
          <Image src={value} alt="Cover preview" fill className="object-cover" sizes="600px" />
          <button
            type="button"
            onClick={removeImage}
            disabled={busy}
            className="btn btn-ghost absolute right-2 top-2 !px-2.5 !py-2"
            aria-label="Remove cover image"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors"
          style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
        >
          {busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-sm">{busy ? "Uploading…" : "Upload an image"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      {error && (
        <p className="mt-2 text-sm" style={{ color: "#be123c" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Multiple gallery images — add appends, remove deletes from S3. */
export function GalleryField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addFiles = async (files: FileList) => {
    setBusy(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadFile(file));
      onChange([...value, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = async (url: string) => {
    onChange(value.filter((u) => u !== url));
    await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div
            key={url}
            className="relative h-20 w-28 overflow-hidden rounded-lg"
            style={{ background: "var(--surface-2)", border: "1px solid var(--card-border)" }}
          >
            <Image src={url} alt="" fill className="object-cover" sizes="112px" />
            <button
              type="button"
              onClick={() => removeAt(url)}
              className="btn btn-ghost absolute right-1 top-1 !px-1.5 !py-1"
              aria-label="Remove image"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors"
          style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          <span className="text-[11px]">{busy ? "Uploading…" : "Add"}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
        }}
      />
      {error && (
        <p className="mt-2 text-sm" style={{ color: "#be123c" }}>
          {error}
        </p>
      )}
    </div>
  );
}
