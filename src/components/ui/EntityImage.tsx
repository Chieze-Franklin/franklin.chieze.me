import Image from "next/image";
import { entityImageSrc } from "@/lib/entity-image";

/**
 * Renders an entity's image with a fallback chain: uploaded image → website
 * favicon → a monogram placeholder (first letter of `label`).
 */
export function EntityImage({
  image,
  url,
  label = "",
  size = 16,
  rounded = "rounded",
  className = "",
}: {
  image?: string;
  url?: string;
  label?: string;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  const src = entityImageSrc({ image, url });

  if (!src) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${rounded} ${className}`}
        style={{
          width: size,
          height: size,
          background: "var(--surface-2)",
          color: "var(--text-3)",
          fontSize: Math.round(size * 0.55),
          fontWeight: 700,
        }}
        aria-hidden
      >
        {label.trim().charAt(0).toUpperCase() || "•"}
      </span>
    );
  }

  return (
    <span
      className={`relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{ width: size, height: size, background: "var(--surface-2)" }}
    >
      <Image src={src} alt="" fill className="object-contain" sizes={`${size}px`} />
    </span>
  );
}
