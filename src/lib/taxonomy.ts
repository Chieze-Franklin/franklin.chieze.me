import { connectDB } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { Tool } from "@/models/Tool";
import { Award } from "@/models/Award";
import type { Skill as SkillType, Tool as ToolType, Award as AwardType } from "@/types";

/* ─── Serializers ─────────────────────────────────────────────── */

interface SkillDoc {
  _id: unknown;
  name: string;
  description?: string;
}
interface ToolDoc {
  _id: unknown;
  name: string;
  description?: string;
  url?: string;
}
interface AwardDoc {
  _id: unknown;
  title: string;
  issuer?: string;
  date?: string;
  kind?: "award" | "certification";
  description?: string;
  url?: string;
  credentialId?: string;
}

export function serializeSkill(d: SkillDoc): SkillType {
  return { _id: String(d._id), name: d.name, description: d.description };
}

export function serializeTool(d: ToolDoc): ToolType {
  return { _id: String(d._id), name: d.name, description: d.description, url: d.url };
}

export function serializeAward(d: AwardDoc): AwardType {
  return {
    _id: String(d._id),
    title: d.title,
    issuer: d.issuer ?? "",
    date: d.date ?? "",
    kind: d.kind ?? "award",
    description: d.description,
    url: d.url,
    credentialId: d.credentialId,
  };
}

/* ─── List helpers (used by the public/admin selectors) ───────── */

export async function getSkills(): Promise<SkillType[]> {
  await connectDB();
  const docs = await Skill.find().sort({ name: 1 }).lean<SkillDoc[]>();
  return docs.map(serializeSkill);
}

export async function getTools(): Promise<ToolType[]> {
  await connectDB();
  const docs = await Tool.find().sort({ name: 1 }).lean<ToolDoc[]>();
  return docs.map(serializeTool);
}

export async function getAwards(): Promise<AwardType[]> {
  await connectDB();
  const docs = await Award.find().sort({ title: 1 }).lean<AwardDoc[]>();
  return docs.map(serializeAward);
}
