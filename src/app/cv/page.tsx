import { PageHeader } from "@/components/layout/PageHeader";
import { CV } from "@/components/cv/CV";
import { getAwards, getSkills, getTools } from "@/lib/taxonomy";
import { getExperienceEntries, getEducation, getPublications, getHobbies, getSetting } from "@/lib/resume";
import type { Award, Skill, Tool, ResumeEntry, Education, Publication, Hobby } from "@/types";

// Everything on the CV is database-backed — render on demand.
export const dynamic = "force-dynamic";

const DEFAULT_INTRO =
  "Software engineer and entrepreneur building scalable products across Africa's tech ecosystem.";

export default async function CVPage() {
  // Fail soft: if the database is unavailable, the CV still renders (with empty sections).
  let intro = DEFAULT_INTRO;
  let entries: ResumeEntry[] = [];
  let education: Education[] = [];
  let publications: Publication[] = [];
  let hobbies: Hobby[] = [];
  let awards: Award[] = [];
  let skills: Skill[] = [];
  let tools: Tool[] = [];

  try {
    const [introVal, e, ed, pubs, hobs, aw, sk, tl] = await Promise.all([
      getSetting("resumeIntro"),
      getExperienceEntries(),
      getEducation(),
      getPublications(),
      getHobbies(),
      getAwards(),
      getSkills(),
      getTools(),
    ]);
    if (introVal.trim()) intro = introVal;
    entries = e;
    education = ed;
    publications = pubs;
    hobbies = hobs;
    awards = aw;
    skills = sk;
    tools = tl;
  } catch {
    /* leave defaults / empties */
  }

  return (
    <>
      <PageHeader
        eyebrow="Curriculum Vitae"
        title="Experience & beyond"
        subtitle="The full picture — roles, education, research, recognition, and what I do for fun."
      />
      <CV
        intro={intro}
        entries={entries}
        education={education}
        publications={publications}
        skills={skills}
        tools={tools}
        awards={awards}
        hobbies={hobbies}
      />
    </>
  );
}
