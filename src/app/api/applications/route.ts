import { connectDB } from "@/lib/mongodb";
import { JobApplication } from "@/models/JobApplication";
import { getApplications, serializeApplication, cleanQuestions, isStatus } from "@/lib/job-applications";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

const text = (v: unknown): string | undefined => {
  const s = String(v ?? "").trim();
  return s || undefined;
};

export async function GET() {
  // Applications are private — never expose them publicly.
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    return Response.json({ items: await getApplications() });
  } catch (err) {
    return serverError("GET /api/applications failed", err);
  }
}

export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const company = String(body.company ?? "").trim();
    const role = String(body.role ?? "").trim();
    if (!company || !role) {
      return Response.json({ error: "Company and role are required" }, { status: 400 });
    }
    await connectDB();
    const doc = await JobApplication.create({
      company,
      role,
      location: text(body.location),
      companyWebsite: text(body.companyWebsite),
      companyLinkedin: text(body.companyLinkedin),
      jobUrl: text(body.jobUrl),
      jobDescription: String(body.jobDescription ?? ""),
      notes: text(body.notes),
      status: isStatus(body.status) ? body.status : "saved",
      coverLetter: text(body.coverLetter),
      questions: cleanQuestions(body.questions),
    });
    return Response.json(serializeApplication(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/applications failed", err);
  }
}
