import { connectDB } from "@/lib/mongodb";
import { JobApplication } from "@/models/JobApplication";
import { serializeApplication, cleanQuestions, isStatus } from "@/lib/job-applications";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

interface Ctx {
  params: Promise<{ id: string }>;
}

/** Optional text fields: an empty string clears them. */
const OPTIONAL_TEXT = [
  "location",
  "companyWebsite",
  "companyLinkedin",
  "jobUrl",
  "notes",
  "coverLetter",
] as const;

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    const body = await req.json();
    await connectDB();
    const doc = await JobApplication.findById(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

    if (body.company !== undefined) {
      const company = String(body.company).trim();
      if (!company) return Response.json({ error: "Company is required" }, { status: 400 });
      doc.company = company;
    }
    if (body.role !== undefined) {
      const role = String(body.role).trim();
      if (!role) return Response.json({ error: "Role is required" }, { status: 400 });
      doc.role = role;
    }
    for (const key of OPTIONAL_TEXT) {
      if (body[key] !== undefined) doc[key] = String(body[key] ?? "").trim() || undefined;
    }
    if (body.jobDescription !== undefined) doc.jobDescription = String(body.jobDescription ?? "");
    if (body.status !== undefined && isStatus(body.status)) doc.status = body.status;
    if (body.questions !== undefined) doc.questions = cleanQuestions(body.questions);

    await doc.save();
    return Response.json(serializeApplication(doc.toObject()));
  } catch (err) {
    return serverError("PATCH /api/applications/[id] failed", err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await guardAdmin();
  if (denied) return denied;
  const { id } = await params;
  try {
    await connectDB();
    const doc = await JobApplication.findByIdAndDelete(id);
    if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    return serverError("DELETE /api/applications/[id] failed", err);
  }
}
