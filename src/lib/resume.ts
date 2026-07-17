import { connectDB } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { Education } from "@/models/Education";
import { Publication } from "@/models/Publication";
import { Hobby } from "@/models/Hobby";
import { Setting } from "@/models/Setting";
import "@/models/Award";
import "@/models/Skill";
import "@/models/Tool";
import { serializeAward, serializeSkill, serializeTool } from "@/lib/taxonomy";
import type {
  ResumeEntry,
  Education as EducationType,
  Publication as PublicationType,
  Hobby as HobbyType,
} from "@/types";

/* ─── Experience entries ──────────────────────────────────────── */

interface ResumeDoc {
  _id: unknown;
  company: string;
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
const RESUME_POPULATE = [{ path: "skills" }, { path: "tools" }, { path: "awards" }];

export function serializeResume(doc: ResumeDoc): ResumeEntry {
  return {
    _id: String(doc._id),
    company: doc.company,
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

export async function getResumeEntries(): Promise<ResumeEntry[]> {
  await connectDB();
  const docs = await Resume.find().sort({ startDate: -1 }).populate(RESUME_POPULATE).lean<ResumeDoc[]>();
  return docs.map(serializeResume);
}

export async function getResumeById(id: string): Promise<ResumeEntry | null> {
  await connectDB();
  const doc = await Resume.findById(id).populate(RESUME_POPULATE).lean<ResumeDoc | null>();
  return doc ? serializeResume(doc) : null;
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
