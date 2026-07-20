import { connectDB } from "@/lib/mongodb";
import { Tool } from "@/models/Tool";
import { Work } from "@/models/Work";
import { Play } from "@/models/Play";
import { Thought } from "@/models/Thought";
import { JobRole } from "@/models/JobRole";
import { serializeTool } from "@/lib/taxonomy";
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
    const doc = await Tool.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (body.name !== undefined) doc.name = String(body.name).trim();
    if (body.description !== undefined) doc.description = body.description?.trim() || undefined;
    if (body.url !== undefined) doc.url = body.url?.trim() || undefined;
    if (body.image !== undefined) {
      const next = body.image?.trim() || undefined;
      if (doc.image && doc.image !== next) await deleteImageByUrl(doc.image);
      doc.image = next;
    }
    await doc.save();
    return Response.json(serializeTool(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/tools/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await Tool.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    if (doc.image) await deleteImageByUrl(doc.image);
    // Drop the reference from anything that used it.
    await Promise.all([
      Work.updateMany({ tools: id }, { $pull: { tools: id } }),
      Play.updateMany({ tools: id }, { $pull: { tools: id } }),
      Thought.updateMany({ tools: id }, { $pull: { tools: id } }),
      JobRole.updateMany({ tools: id }, { $pull: { tools: id } }),
    ]);
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/tools/[id] failed", err);
  }
}
