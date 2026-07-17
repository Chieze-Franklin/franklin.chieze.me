import { connectDB } from "@/lib/mongodb";
import { Hobby } from "@/models/Hobby";
import { getHobbies, serializeHobby } from "@/lib/resume";
import { guardAdmin } from "@/lib/admin-auth";
import { serverError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ items: await getHobbies() });
  } catch (err) {
    return serverError("GET /api/hobbies failed", err);
  }
}

export async function POST(req: Request) {
  const denied = await guardAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "Name is required" }, { status: 400 });
    await connectDB();
    const doc = await Hobby.create({ name, description: body.description?.trim() || undefined });
    return Response.json(serializeHobby(doc.toObject()), { status: 201 });
  } catch (err) {
    return serverError("POST /api/hobbies failed", err);
  }
}
