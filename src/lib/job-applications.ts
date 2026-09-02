import { connectDB } from "@/lib/mongodb";
import { JobApplication } from "@/models/JobApplication";
import { STATUSES } from "@/lib/applications";
import type { JobApplication as JobApplicationType, ApplicationQuestion, ApplicationStatus } from "@/types";

interface QuestionDoc {
  id?: string;
  question?: string;
  answer?: string;
  wordLimit?: number;
  hint?: string;
}

interface JobApplicationDoc {
  _id: unknown;
  company: string;
  role: string;
  location?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  jobUrl?: string;
  jobDescription?: string;
  notes?: string;
  status?: string;
  coverLetter?: string;
  questions?: QuestionDoc[];
  localId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const STATUS_IDS = STATUSES.map((s) => s.id);
export const isStatus = (v: unknown): v is ApplicationStatus =>
  typeof v === "string" && (STATUS_IDS as string[]).includes(v);

const iso = (d?: Date | string) => (d ? new Date(d).toISOString() : new Date().toISOString());

/** Normalise a questions array coming off the wire (or out of localStorage). */
export function cleanQuestions(v: unknown): ApplicationQuestion[] {
  if (!Array.isArray(v)) return [];
  return v.map((raw) => {
    const q = (raw ?? {}) as QuestionDoc;
    const wordLimit = Number(q.wordLimit);
    return {
      id: String(q.id || crypto.randomUUID()),
      question: String(q.question ?? ""),
      answer: String(q.answer ?? ""),
      wordLimit: Number.isFinite(wordLimit) && wordLimit > 0 ? Math.trunc(wordLimit) : undefined,
      hint: q.hint ? String(q.hint) : undefined,
    };
  });
}

export function serializeApplication(doc: JobApplicationDoc): JobApplicationType {
  return {
    _id: String(doc._id),
    company: doc.company,
    role: doc.role,
    location: doc.location,
    companyWebsite: doc.companyWebsite,
    companyLinkedin: doc.companyLinkedin,
    jobUrl: doc.jobUrl,
    jobDescription: doc.jobDescription ?? "",
    notes: doc.notes,
    status: isStatus(doc.status) ? doc.status : "saved",
    coverLetter: doc.coverLetter,
    questions: cleanQuestions(doc.questions),
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

const text = (v: unknown): string | undefined => {
  const s = String(v ?? "").trim();
  return s || undefined;
};

const date = (v: unknown): Date => {
  const d = new Date(String(v ?? ""));
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

/**
 * One-way import of the browser-local tracker into the database.
 *
 * Each incoming application carries the id it had in localStorage; that id is
 * stored as `localId`, so re-running the import skips anything already brought
 * over instead of duplicating it. Nothing is removed from the browser — the
 * client keeps its copy as a backup.
 */
export async function importApplications(
  incoming: Record<string, unknown>[]
): Promise<{ imported: number; skipped: number }> {
  await connectDB();

  // Skip ids already imported, and collapse duplicates within the payload.
  const localIds = incoming.map((a) => String(a?._id ?? "")).filter(Boolean);
  const existing = await JobApplication.find({ localId: { $in: localIds } })
    .select("localId")
    .lean<{ localId?: string }[]>();
  const already = new Set(existing.map((d) => d.localId));
  const seen = new Set<string>();

  const docs = incoming
    .filter((a) => {
      const localId = String(a?._id ?? "");
      if (!localId || already.has(localId) || seen.has(localId)) return false;
      if (!String(a?.company ?? "").trim() || !String(a?.role ?? "").trim()) return false;
      seen.add(localId);
      return true;
    })
    .map((a) => ({
      localId: String(a._id),
      company: String(a.company).trim(),
      role: String(a.role).trim(),
      location: text(a.location),
      companyWebsite: text(a.companyWebsite),
      companyLinkedin: text(a.companyLinkedin),
      jobUrl: text(a.jobUrl),
      jobDescription: String(a.jobDescription ?? ""),
      notes: text(a.notes),
      status: isStatus(a.status) ? a.status : "saved",
      coverLetter: text(a.coverLetter),
      questions: cleanQuestions(a.questions),
      // Keep the original dates rather than stamping everything with "now".
      createdAt: date(a.createdAt),
      updatedAt: date(a.updatedAt),
    }));

  if (docs.length > 0) {
    await JobApplication.insertMany(docs, { timestamps: false });
  }

  return { imported: docs.length, skipped: incoming.length - docs.length };
}

/** Every application, newest first. */
export async function getApplications(): Promise<JobApplicationType[]> {
  await connectDB();
  const docs = await JobApplication.find().sort({ createdAt: -1 }).lean<JobApplicationDoc[]>();
  return docs.map(serializeApplication);
}
