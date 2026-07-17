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
  /** Associated awards — populated when fetched for a detail/edit view. */
  awards?: Award[];
}

/** A labelled external link (e.g. "App Store", "GitHub", "Docs"). */
export interface WorkLink {
  label: string;
  url: string;
}

export interface WorkItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  /** Additional screenshots/images shown in the work's gallery. */
  images?: string[];
  date: string;
  slug: string;
  tags?: string[];
  size?: CardSize;
  content?: string;
  /** Primary link (website / app store / live URL). */
  url?: string;
  /** Secondary labelled links. */
  links?: WorkLink[];
  /** Associated taxonomy — populated when fetched for a detail/edit view. */
  awards?: Award[];
  skills?: Skill[];
  tools?: Tool[];
  /** Optional company this work was built at/for. */
  company?: Company;
}

/** Standalone skill that can be associated with work items. */
export interface Skill {
  _id: string;
  name: string;
  description?: string;
}

/** Standalone tool/technology that can be associated with work items. */
export interface Tool {
  _id: string;
  name: string;
  description?: string;
  url?: string;
}

/** A company worked with or founded. */
export interface Company {
  _id: string;
  name: string;
  url?: string;
  description?: string;
}

/** A role held at a company — the building block of the résumé experience. */
export interface JobRole {
  _id: string;
  company?: Company;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: Skill[];
  tools: Tool[];
  highlights?: string[];
  awards?: Award[];
}

export interface PlayItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  images?: string[];
  date: string;
  slug: string;
  tags?: string[];
  size?: CardSize;
  content?: string;
  url?: string;
  repoUrl?: string;
  links?: WorkLink[];
  awards?: Award[];
  skills?: Skill[];
  tools?: Tool[];
}

export interface ThoughtItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  images?: string[];
  date: string;
  slug: string;
  tags?: string[];
  size?: CardSize;
  content?: string;
  type: "article" | "blog" | "vlog";
  url?: string;
  videoUrl?: string;
  readingTime?: number;
  links?: WorkLink[];
  awards?: Award[];
  skills?: Skill[];
  tools?: Tool[];
}

export interface ResumeEntry {
  _id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: Skill[];
  tools: Tool[];
  highlights?: string[];
  awards?: Award[];
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
