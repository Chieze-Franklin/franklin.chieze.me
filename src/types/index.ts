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
  /** Optional view count (set on articles). */
  views?: number;
  /** Optional status (articles use ArticleStatus, works use WorkStatus). */
  status?: ArticleStatus | WorkStatus;
  /** Associated awards — populated when fetched for a detail/edit view. */
  awards?: Award[];
}

/** A labelled external link (e.g. "App Store", "GitHub", "Docs"). */
export interface WorkLink {
  label: string;
  url: string;
}

/** Lifecycle status of a work item. */
export type WorkStatus = "in_progress" | "completed" | "paused" | "cancelled";

export interface WorkItem {
  _id: string;
  title: string;
  summary: string;
  coverImage?: string;
  /** Additional screenshots/images shown in the work's gallery. */
  images?: string[];
  /** Display date for the shared card — mirrors `startDate`. */
  date: string;
  /** When the work started. */
  startDate: string;
  /** When the work ended; omitted while ongoing. */
  endDate?: string;
  status: WorkStatus;
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
  url?: string;
  image?: string;
}

/** Standalone tool/technology that can be associated with work items. */
export interface Tool {
  _id: string;
  name: string;
  description?: string;
  url?: string;
  image?: string;
}

/** A company worked with or founded. */
export interface Company {
  _id: string;
  name: string;
  url?: string;
  logo?: string;
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

/** A blog/publication that articles can belong to. */
export interface Blog {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  logo?: string;
  url?: string;
}

/** How an article's content is rendered. */
export type ContentType = "plaintext" | "html" | "markdown" | "audio" | "video";
/** Whether the content lives in the DB or at an external resource. */
export type ContentSource = "inline" | "external";
/** Publication status — only `published` is visible to readers. */
export type ArticleStatus = "draft" | "published" | "archived";

/** An article/post/vlog (surfaced on /thoughts). */
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
  blog?: Blog;
  status: ArticleStatus;
  contentType: ContentType;
  contentSource: ContentSource;
  /** External content location (YouTube, GitHub, audio file, …) or canonical link. */
  url?: string;
  readingTime?: number;
  views?: number;
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
  image?: string;
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
