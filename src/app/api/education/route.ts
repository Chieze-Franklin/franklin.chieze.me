import { connectDB } from "@/lib/mongodb";
import { Education } from "@/models/Education";
import { getEducation, serializeEducation } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ items: await getEducation() });
  } catch (err) {
    return serverError("GET /api/education failed", err);
  }
}

export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const institution = String(body.institution ?? "").trim();
    const degree = String(body.degree ?? "").trim();
    if (!institution || !degree) {
      return Response.json({ error: "Institution and degree are required" }, { status: 400 });
    }
    await connectDB();
    const doc = await Education.create({
      institution,
      degree,
      field: body.field?.trim() || undefined,
      startDate: body.startDate?.trim() || "",
      endDate: body.endDate?.trim() || undefined,
      location: body.location?.trim() || undefined,
      description: body.description?.trim() || undefined,
    });
    return Response.json(serializeEducation(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/education failed", err);
  }
}
