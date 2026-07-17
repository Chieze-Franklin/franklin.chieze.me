import { connectDB } from "@/lib/mongodb";
import { Education } from "@/models/Education";
import { serializeEducation } from "@/lib/resume";
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
    const doc = await Education.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (body.institution !== undefined) doc.institution = String(body.institution).trim();
    if (body.degree !== undefined) doc.degree = String(body.degree).trim();
    if (body.field !== undefined) doc.field = body.field?.trim() || undefined;
    if (body.startDate !== undefined) doc.startDate = body.startDate?.trim() || "";
    if (body.endDate !== undefined) doc.endDate = body.endDate?.trim() || undefined;
    if (body.location !== undefined) doc.location = body.location?.trim() || undefined;
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    await doc.save();
    return Response.json(serializeEducation(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/education/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Education.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/education/[id] failed", err);
  }
}
