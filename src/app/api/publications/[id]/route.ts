import { connectDB } from "@/lib/mongodb";
import { Publication } from "@/models/Publication";
import { serializePublication } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

interface Ctx {
  params: Promise<{ id: string }>;
}

const PUB_TYPES = ["journal", "conference", "preprint", "chapter", "thesis"];
const cleanStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((s) => String(s).trim()).filter(Boolean) : [];

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    const body = await req.json();
    await connectDB();
    const doc = await Publication.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (body.title !== undefined) doc.title = String(body.title).trim();
    if (body.venue !== undefined) doc.venue = String(body.venue).trim();
    if (body.year !== undefined) {
      const n = Number(body.year);
      if (Number.isFinite(n) && n > 0) doc.year = Math.trunc(n);
    }
    if (body.authors !== undefined) doc.authors = cleanStrings(body.authors);
    if (body.type !== undefined && PUB_TYPES.includes(body.type)) doc.type = body.type;
    if (body.url !== undefined) doc.url = body.url?.trim() || undefined;
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    await doc.save();
    return Response.json(serializePublication(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/publications/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Publication.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/publications/[id] failed", err);
  }
}
