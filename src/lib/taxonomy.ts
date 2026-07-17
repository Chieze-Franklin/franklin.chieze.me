import { connectDB } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { Tool } from "@/models/Tool";
import { Award } from "@/models/Award";
import { Company } from "@/models/Company";
import type {
  Skill as SkillType,
  Tool as ToolType,
  Award as AwardType,
  Company as CompanyType,
} from "@/types";

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
interface CompanyDoc {
  _id: unknown;
  name: string;
  url?: string;
  logo?: string;
  description?: string;
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

export function serializeCompany(d: CompanyDoc): CompanyType {
  return { _id: String(d._id), name: d.name, url: d.url, logo: d.logo, description: d.description };
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

export async function getCompanies(): Promise<CompanyType[]> {
  await connectDB();
  const docs = await Company.find().sort({ name: 1 }).lean<CompanyDoc[]>();
  return docs.map(serializeCompany);
}
