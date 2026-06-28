import { guardAdmin } from "@/lib/admin-auth";
import { uploadImage, deleteImageByUrl, ALLOWED_IMAGE_TYPES } from "@/lib/s3";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

// POST /api/upload — multipart form with a single `file`; uploads to S3 (admin only).
export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES[file.type]) {
      return Response.json({ error: `Unsupported image type: ${file.type}` }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: "Image must be 8 MB or smaller" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.type);
    return Response.json({ url }, { status: 201 });
  } catch (err) {
    console.error("POST /api/upload failed:", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}

// DELETE /api/upload?url=... — delete an image from S3 (admin only).
export async function DELETE(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const url = new URL(req.url).searchParams.get("url");
    if (!url) return Response.json({ error: "Missing url" }, { status: 400 });
    await deleteImageByUrl(url);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/upload failed:", err);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
