import { guardAdmin } from "@/lib/admin-auth";
import { presignMediaUpload, ALLOWED_MEDIA_TYPES, mediaMaxBytes } from "@/lib/s3";
import { serverError } from "@/lib/api-error";

// POST /api/uploads/presign — get a presigned URL to upload a media file to S3.
// Body: { contentType, size? }. Admin only.
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const body = await req.json();
    const contentType = String(body.contentType ?? "");
    const size = Number(body.size) || 0;

    if (!ALLOWED_MEDIA_TYPES[contentType]) {
      return Response.json({ error: `Unsupported file type: ${contentType || "(none)"}` }, { status: 400 });
    }
    const max = mediaMaxBytes(contentType);
    if (size && size > max) {
      return Response.json(
        { error: `File is too large (max ${Math.round(max / 1024 / 1024)} MB).` },
        { status: 400 }
      );
    }

    const { uploadUrl, publicUrl } = await presignMediaUpload(contentType);
    return Response.json({ uploadUrl, publicUrl, maxBytes: max });
  } catch (err) {
    return serverError("POST /api/uploads/presign failed", err);
  }
}
