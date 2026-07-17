import { connectDB } from "@/lib/mongodb";
import { Hobby } from "@/models/Hobby";
import { serializeHobby } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    const body = await req.json();
    await connectDB();
    const doc = await Hobby.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (body.name !== undefined) doc.name = String(body.name).trim();
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    await doc.save();
    return Response.json(serializeHobby(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/hobbies/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Hobby.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/hobbies/[id] failed", err);
  }
}
