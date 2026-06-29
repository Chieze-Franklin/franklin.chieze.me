export type CardSize = "sm" | "md" | "lg" | "xl";

export interface NewsItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  date: string;
  slug: string;
  tags?: string[];
  size?: CardSize;
  content?: string;
  /** Optional external link; when set, the card opens this URL in a new tab. */
  url?: string;
}

export interface WorkItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  date: string;
  slug: string;
  tags?: string[];
  size?: CardSize;
  content?: string;
  url?: string;
}

export interface PlayItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  date: string;
  slug: string;
  tags?: string[];
  size?: CardSize;
  content?: string;
  url?: string;
  repoUrl?: string;
}

export interface ThoughtItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  date: string;
  slug: string;
  tags?: string[];
  size?: CardSize;
  content?: string;
  type: "article" | "blog" | "vlog";
  videoUrl?: string;
  readingTime?: number;
}

export interface ResumeEntry {
  _id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
  tools: string[];
  highlights?: string[];
}

export interface SkillOrTool {
  name: string;
  roleCount: number;
  usageByYear: { year: number; count: number }[];
}

export type Theme = "dawn" | "day" | "dusk" | "night";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ─── CV / Curriculum ──────────────────────────────────────────── */

export interface Education {
  _id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
}

export interface Publication {
  _id: string;
  title: string;
  venue: string;
  year: number;
  authors: string[];
  type: "journal" | "conference" | "preprint" | "chapter" | "thesis";
  url?: string;
  description?: string;
}

export interface Hobby {
  _id: string;
  name: string;
  description?: string;
}

/* What an award/certification can be linked to elsewhere on the site. */
export type RelatedRefType = "work" | "play" | "thought" | "news" | "experience";

export interface RelatedRef {
  type: RelatedRefType;
  id: string;
  label: string;
}

export interface Award {
  _id: string;
  title: string;
  issuer: string;
  date: string;
  kind: "award" | "certification";
  description?: string;
  url?: string;
  credentialId?: string;
  /** Items this award/cert is associated with (jobs, projects, articles…). */
  related?: RelatedRef[];
}

/* ─── Job application tracker (private /apply) ─────────────────── */

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "accepted"
  | "rejected";

export interface JobApplication {
  _id: string;
  company: string;
  role: string;
  location?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  jobUrl?: string;
  jobDescription: string;
  notes?: string;
  status: ApplicationStatus;
  coverLetter?: string;
  createdAt: string;
  updatedAt: string;
}
