import { siteConfig } from "@/config/site";
import { getExperienceEntries, getEducation, getPublications, getSetting } from "@/lib/resume";
import { getAwards, getSkills, getTools } from "@/lib/taxonomy";
import { getWorksList } from "@/lib/works";
import { workStatusMeta } from "@/lib/work-status";
import type { ResumeEntry, Education, Publication, Award, Skill, Tool, WorkItem } from "@/types";

/**
 * Static fallback used when the database is unavailable — keeps AI features
 * (cover letters, application answers) working with the essentials.
 */
export const CANDIDATE_BIO = `${siteConfig.name} — Co-founder of ProteusAI and Founder of Dreambase. Former Senior Software Engineer at Andela. Recognised among Africa's Top 40 Under 40 Engineers by TechCabal. ${siteConfig.stats.yearsBuilding} years building scalable, impactful products across Africa's tech ecosystem. Core strengths: system design, backend engineering, microservices, fintech, team leadership. Stack: Node.js, Next.js, MongoDB, PostgreSQL, Redis, Docker, Kubernetes, AWS, Terraform.`;

const year = (d?: string) => (d ? new Date(d).getFullYear() : "");
const range = (start: string, end?: string) => `${year(start)}–${end ? year(end) : "Present"}`;

function formatExperience(entries: ResumeEntry[]): string {
  if (entries.length === 0) return "(no roles on file)";
  return entries
    .map((e) => {
      const stack = [...e.skills, ...e.tools].map((s) => s.name).join(", ");
      const highlights = (e.highlights ?? []).map((h) => `  • ${h}`).join("\n");
      return [
        `- ${e.title} @ ${e.company || "—"} (${range(e.startDate, e.endDate)})${e.employmentType ? ` · ${e.employmentType}` : ""}`,
        e.description ? `  ${e.description}` : "",
        highlights,
        stack ? `  Stack: ${stack}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}

function formatWorks(items: WorkItem[]): string {
  if (items.length === 0) return "(no projects on file)";
  return items
    .map((w) => {
      const company = w.company ? ` @ ${w.company.name}` : "";
      return `- ${w.title}${company} (${range(w.startDate, w.endDate)}) — ${workStatusMeta(w.status).label}: ${w.summary}`;
    })
    .join("\n");
}

function formatEducation(items: Education[]): string {
  if (items.length === 0) return "(none on file)";
  return items
    .map((e) => `- ${e.degree}${e.field ? `, ${e.field}` : ""} — ${e.institution} (${range(e.startDate, e.endDate)})`)
    .join("\n");
}

function formatAwards(items: Award[]): string {
  if (items.length === 0) return "(none on file)";
  return items.map((a) => `- ${a.title} — ${a.issuer} (${year(a.date)}) · ${a.kind}`).join("\n");
}

function formatPublications(items: Publication[]): string {
  if (items.length === 0) return "(none on file)";
  return items.map((p) => `- ${p.title} — ${p.venue}, ${p.year}`).join("\n");
}

/**
 * Build the richest possible picture of the candidate for AI prompts: the
 * database-backed résumé when it is reachable, the static bio otherwise.
 */
export async function buildCandidateContext(): Promise<string> {
  let intro = "";
  let entries: ResumeEntry[] = [];
  let works: WorkItem[] = [];
  let education: Education[] = [];
  let awards: Award[] = [];
  let publications: Publication[] = [];
  let skills: Skill[] = [];
  let tools: Tool[] = [];

  try {
    const [introVal, e, w, ed, aw, pubs, sk, tl] = await Promise.all([
      getSetting("resumeIntro"),
      getExperienceEntries(),
      getWorksList({ limit: 12 }),
      getEducation(),
      getAwards(),
      getPublications(),
      getSkills(),
      getTools(),
    ]);
    intro = introVal.trim();
    entries = e;
    works = w.items;
    education = ed;
    awards = aw;
    publications = pubs;
    skills = sk;
    tools = tl;
  } catch {
    // Database unreachable — fall back to the static bio alone.
    return CANDIDATE_BIO;
  }

  return `${CANDIDATE_BIO}
${intro ? `\nProfile: ${intro}` : ""}

Contact: ${siteConfig.socials.email} · ${siteConfig.socials.linkedin} · ${siteConfig.socials.github}

Experience:
${formatExperience(entries)}

Projects and products built:
${formatWorks(works)}

Education:
${formatEducation(education)}

Awards and certifications:
${formatAwards(awards)}

Publications:
${formatPublications(publications)}

Skills: ${skills.map((s) => s.name).join(", ") || "(none on file)"}
Tools and technologies: ${tools.map((t) => t.name).join(", ") || "(none on file)"}`;
}
