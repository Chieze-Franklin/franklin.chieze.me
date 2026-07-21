import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.AWS_S3_BUCKET!;

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  // Don't add CRC checksum headers to presigned URLs — browsers can't compute them.
  requestChecksumCalculation: "WHEN_REQUIRED" as never,
  responseChecksumValidation: "WHEN_REQUIRED" as never,
});

// Image content types we accept, mapped to their file extension.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

// Media (pdf/audio/video) content types accepted for presigned uploads.
export const ALLOWED_MEDIA_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "weba",
  "audio/aac": "aac",
  "audio/mp4": "m4a",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
};

/** Max upload size (bytes) by broad media kind. */
export function mediaMaxBytes(contentType: string): number {
  if (contentType === "application/pdf") return 25 * 1024 * 1024; // 25 MB
  if (contentType.startsWith("audio/")) return 50 * 1024 * 1024; // 50 MB
  if (contentType.startsWith("video/")) return 200 * 1024 * 1024; // 200 MB
  return 25 * 1024 * 1024;
}

const publicUrl = (key: string) => `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

/** The public host objects are served from — used to validate/parse URLs. */
const bucketHost = () => `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;

/** Upload an image buffer to S3 and return its public URL. */
export async function uploadImage(
  body: Buffer,
  contentType: string,
  prefix = "news"
): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[contentType];
  if (!ext) throw new Error(`Unsupported image type: ${contentType}`);

  const key = `${prefix}/${randomUUID()}.${ext}`;
  await s3.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType })
  );
  return publicUrl(key);
}

/**
 * Create a presigned PUT URL so the browser can upload a media file directly to
 * S3 (bypassing serverless request-body limits). Returns the upload URL and the
 * eventual public URL. The bucket must allow CORS PUT from the site origin.
 */
export async function presignMediaUpload(
  contentType: string,
  prefix = "media"
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const ext = ALLOWED_MEDIA_TYPES[contentType];
  if (!ext) throw new Error(`Unsupported file type: ${contentType}`);
  const key = `${prefix}/${randomUUID()}.${ext}`;
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 });
  return { uploadUrl, publicUrl: publicUrl(key) };
}

/**
 * Delete an object given its public URL. Silently ignores URLs that don't
 * belong to this bucket (e.g. legacy Unsplash images) so callers can pass any
 * coverImage value safely.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  const host = bucketHost();
  if (!url.startsWith(host)) return;
  const key = decodeURIComponent(url.slice(host.length));
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
