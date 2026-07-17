import { connectDB } from "@/lib/mongodb";
import { Company } from "@/models/Company";
import { JobRole } from "@/models/JobRole";
import { Work } from "@/models/Work";
import { serializeCompany } from "@/lib/taxonomy";
import { deleteImageByUrl } from "@/lib/s3";
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
    const doc = await Company.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (body.name !== undefined) doc.name = String(body.name).trim();
    if (body.url !== undefined) doc.url = body.url?.trim() || undefined;
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    // Logo replaced/cleared → delete the old object from S3.
    if (body.logo !== undefined) {
      const next = body.logo?.trim() || undefined;
      if (doc.logo && doc.logo !== next) await deleteImageByUrl(doc.logo);
      doc.logo = next;
    }
    await doc.save();
    return Response.json(serializeCompany(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/companies/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Company.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (doc.logo) await deleteImageByUrl(doc.logo);
    // A job role can't exist without its company — remove them, and unset the
    // company on any works that referenced it.
    await Promise.all([
      JobRole.deleteMany({ company: id }),
      Work.updateMany({ company: id }, { $unset: { company: "" } }),
    ]);
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/companies/[id] failed", err);
  }
}
