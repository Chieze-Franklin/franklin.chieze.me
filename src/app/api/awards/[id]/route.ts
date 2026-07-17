import { connectDB } from "@/lib/mongodb";
import { Award } from "@/models/Award";
import { Work } from "@/models/Work";
import { Play } from "@/models/Play";
import { Thought } from "@/models/Thought";
import News from "@/models/News";
import Resume from "@/models/Resume";
import { serializeAward } from "@/lib/taxonomy";
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
    const doc = await Award.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (body.title !== undefined) doc.title = String(body.title).trim();
    if (body.issuer !== undefined) doc.issuer = body.issuer?.trim() || undefined;
    if (body.date !== undefined) doc.date = body.date?.trim() || undefined;
    if (body.kind !== undefined) doc.kind = body.kind === "certification" ? "certification" : "award";
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    if (body.url !== undefined) doc.url = body.url?.trim() || undefined;
    if (body.credentialId !== undefined) doc.credentialId = body.credentialId?.trim() || undefined;
    await doc.save();
    return Response.json(serializeAward(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/awards/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Award.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    // Drop the reference from anything that used it.
    await Promise.all([
      Work.updateMany({ awards: id }, { $pull: { awards: id } }),
      Play.updateMany({ awards: id }, { $pull: { awards: id } }),
      Thought.updateMany({ awards: id }, { $pull: { awards: id } }),
      News.updateMany({ awards: id }, { $pull: { awards: id } }),
      Resume.updateMany({ awards: id }, { $pull: { awards: id } }),
    ]);
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/awards/[id] failed", err);
  }
}
