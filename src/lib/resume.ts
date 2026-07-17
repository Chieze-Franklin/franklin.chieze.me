import { connectDB } from "@/lib/mongodb";
import { JobRole } from "@/models/JobRole";
import { Education } from "@/models/Education";
import { Publication } from "@/models/Publication";
import { Hobby } from "@/models/Hobby";
import { Setting } from "@/models/Setting";
import "@/models/Company";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { serializeAward, serializeSkill, serializeTool, serializeCompany } from "@/lib/taxonomy";
import type {
  ResumeEntry,
  JobRole as JobRoleType,
  Education as EducationType,
  Publication as PublicationType,
  Hobby as HobbyType,
} from "@/types";

/* ─── Job roles (the source of the résumé experience) ─────────── */

interface JobRoleDoc {
  _id: unknown;
  company?: { _id: unknown; name: string; url?: string; description?: string } | null;
  title: string;
  startDate: Date | string;
  endDate?: Date | string;
  description?: string;
  skills?: { _id: unknown; name: string }[];
  tools?: { _id: unknown; name: string }[];
  highlights?: string[];
  awards?: { _id: unknown; title: string; kind?: "award" | "certification" }[];
}

const iso = (d: Date | string) => new Date(d).toISOString();
const ROLE_POPULATE = [{ path: "company" }, { path: "skills" }, { path: "tools" }, { path: "awards" }];

export function serializeJobRole(doc: JobRoleDoc): JobRoleType {
  return {
    _id: String(doc._id),
    company: doc.company ? serializeCompany(doc.company) : undefined,
    title: doc.title,
    startDate: iso(doc.startDate),
    endDate: doc.endDate ? iso(doc.endDate) : undefined,
    description: doc.description ?? "",
    skills: (doc.skills ?? []).filter(Boolean).map((s) => serializeSkill(s)),
    tools: (doc.tools ?? []).filter(Boolean).map((t) => serializeTool(t)),
    highlights: doc.highlights ?? [],
    awards: (doc.awards ?? []).filter(Boolean).map((a) => serializeAward(a)),
  };
}

/** Flatten a job role into the résumé-entry shape the CV renders. */
export function jobRoleToResumeEntry(role: JobRoleType): ResumeEntry {
  return {
    _id: role._id,
    company: role.company?.name ?? "",
    title: role.title,
    startDate: role.startDate,
    endDate: role.endDate,
    description: role.description,
    skills: role.skills,
    tools: role.tools,
    highlights: role.highlights,
    awards: role.awards,
  };
}

export async function getJobRoles(): Promise<JobRoleType[]> {
  await connectDB();
  const docs = await JobRole.find().sort({ startDate: -1 }).populate(ROLE_POPULATE).lean<JobRoleDoc[]>();
  return docs.map(serializeJobRole);
}

export async function getJobRoleById(id: string): Promise<JobRoleType | null> {
  await connectDB();
  const doc = await JobRole.findById(id).populate(ROLE_POPULATE).lean<JobRoleDoc | null>();
  return doc ? serializeJobRole(doc) : null;
}

/** The résumé experience: job roles flattened into entry cards. */
export async function getExperienceEntries(): Promise<ResumeEntry[]> {
  return (await getJobRoles()).map(jobRoleToResumeEntry);
}

/* ─── Education ───────────────────────────────────────────────── */

interface EducationDoc {
  _id: unknown;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
}

export function serializeEducation(d: EducationDoc): EducationType {
  return {
    _id: String(d._id),
    institution: d.institution,
    degree: d.degree,
    field: d.field,
    startDate: d.startDate,
    endDate: d.endDate,
    location: d.location,
    description: d.description,
  };
}

export async function getEducation(): Promise<EducationType[]> {
  await connectDB();
  const docs = await Education.find().sort({ startDate: -1 }).lean<EducationDoc[]>();
  return docs.map(serializeEducation);
}

/* ─── Publications ────────────────────────────────────────────── */

interface PublicationDoc {
  _id: unknown;
  title: string;
  venue: string;
  year: number;
  authors?: string[];
  type?: PublicationType["type"];
  url?: string;
  description?: string;
}

export function serializePublication(d: PublicationDoc): PublicationType {
  return {
    _id: String(d._id),
    title: d.title,
    venue: d.venue,
    year: d.year,
    authors: d.authors ?? [],
    type: d.type ?? "conference",
    url: d.url,
    description: d.description,
  };
}

export async function getPublications(): Promise<PublicationType[]> {
  await connectDB();
  const docs = await Publication.find().sort({ year: -1 }).lean<PublicationDoc[]>();
  return docs.map(serializePublication);
}

/* ─── Hobbies ─────────────────────────────────────────────────── */

interface HobbyDoc {
  _id: unknown;
  name: string;
  description?: string;
}

export function serializeHobby(d: HobbyDoc): HobbyType {
  return { _id: String(d._id), name: d.name, description: d.description };
}

export async function getHobbies(): Promise<HobbyType[]> {
  await connectDB();
  const docs = await Hobby.find().sort({ name: 1 }).lean<HobbyDoc[]>();
  return docs.map(serializeHobby);
}

/* ─── Settings (singletons like the résumé intro) ─────────────── */

export async function getSetting(key: string, fallback = ""): Promise<string> {
  await connectDB();
  const doc = await Setting.findOne({ key }).lean<{ value?: string } | null>();
  return doc?.value ?? fallback;
}
