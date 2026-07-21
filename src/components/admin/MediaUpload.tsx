"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { mediaAccept } from "@/lib/content-type";
import { providerEmbedUrl, IFRAME_ALLOW } from "@/lib/embed";
import type { ContentType } from "@/types";

/**
 * Upload a media file (pdf/audio/video) straight to S3 via a presigned URL,
 * then preview it. `value` is the resulting public URL. Removing clears the
 * value; S3 cleanup happens server-side when the article is saved/deleted.
 */
export function MediaUpload({
  value,
  onChange,
  contentType,
}: {
  value: string;
  onChange: (url: string) => void;
  contentType: Extract<ContentType, "pdf" | "audio" | "video">;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const { accept, label, maxMb } = mediaAccept(contentType);

  const upload = async (file: File) => {
    setError("");
    if (file.size > maxMb * 1024 * 1024) {
      setError(`File is too large (max ${maxMb} MB).`);
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      // 1. Ask the server for a presigned PUT URL.
      const presign = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const data = await presign.json();
      if (!presign.ok) throw new Error(data.error || "Could not start upload");

      // 2. PUT the file directly to S3 (XHR so we can show progress).
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", data.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed (HTTP ${xhr.status}). Check bucket CORS.`));
        xhr.onerror = () => reject(new Error("Upload failed. Check bucket CORS configuration."));
        xhr.send(file);
      });

      onChange(data.publicUrl as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {value ? (
        <div className="space-y-3">
          <MediaPreview url={value} contentType={contentType} />
          <div className="flex items-center gap-3">
            <button type="button" className="btn btn-ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Replace
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onChange("")} disabled={busy}>
              <Trash2 size={15} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors"
          style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
        >
          {busy ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          <span className="text-sm font-medium">
            {busy ? `Uploading… ${progress}%` : `Upload ${label} file`}
          </span>
          <span className="text-xs">Max {maxMb} MB · uploaded to S3</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
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

/** Inline preview of an uploaded/linked media file. */
export function MediaPreview({ url, contentType }: { url: string; contentType: ContentType }) {
  if (contentType === "pdf") {
    return (
      <iframe
        src={url}
        title="PDF preview"
        className="h-[70vh] w-full rounded-2xl"
        style={{ border: "1px solid var(--card-border)", background: "var(--surface-2)" }}
      />
    );
  }
  if (contentType === "audio") {
    return <audio src={url} controls className="w-full" />;
  }
  if (contentType === "video") {
    const embed = providerEmbedUrl(url);
    return embed ? (
      <div className="w-full aspect-video overflow-hidden rounded-2xl">
        <iframe src={embed} title="Video preview" allow={IFRAME_ALLOW} allowFullScreen className="h-full w-full" />
      </div>
    ) : (
      <video src={url} controls className="w-full rounded-2xl" style={{ maxHeight: "70vh", background: "#000" }} />
    );
  }
  return null;
}
