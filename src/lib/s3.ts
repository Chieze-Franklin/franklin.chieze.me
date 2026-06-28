import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const REGION = process.env.AWS_REGION!;
const BUCKET = process.env.AWS_S3_BUCKET!;

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Image content types we accept, mapped to their file extension.
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

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
