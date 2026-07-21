import type { ContentType } from "@/types";

/** Display metadata for each article content type. */
export const CONTENT_TYPES: { value: ContentType; label: string; hint: string }[] = [
  { value: "richtext", label: "Rich text", hint: "Write with a formatting toolbar" },
  { value: "html", label: "HTML", hint: "Write raw HTML with a live preview" },
  { value: "pdf", label: "PDF", hint: "Upload a PDF document" },
  { value: "audio", label: "Audio", hint: "Upload an audio file" },
  { value: "video", label: "Video", hint: "Upload a video file" },
];

/** Content types whose body is an uploaded/linked media file (stored in `url`). */
export const MEDIA_CONTENT_TYPES: ContentType[] = ["pdf", "audio", "video"];

export const isMediaType = (t: ContentType): boolean => MEDIA_CONTENT_TYPES.includes(t);

/** Accept string + human label for the file picker of a media content type. */
export function mediaAccept(t: ContentType): { accept: string; label: string; maxMb: number } {
  switch (t) {
    case "pdf":
      return { accept: "application/pdf", label: "PDF", maxMb: 25 };
    case "audio":
      return { accept: "audio/*", label: "audio", maxMb: 50 };
    case "video":
      return { accept: "video/*", label: "video", maxMb: 200 };
    default:
      return { accept: "", label: "", maxMb: 0 };
  }
}

export const contentTypeLabel = (t: ContentType): string =>
  CONTENT_TYPES.find((c) => c.value === t)?.label ?? t;
