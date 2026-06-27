import { PageHeader } from "@/components/layout/PageHeader";
import { CV } from "@/components/cv/CV";
import {
  mockResume,
  mockEducation,
  mockPublications,
  mockAwards,
  mockHobbies,
  resumeIntro,
} from "@/lib/mock-data";

export default function CVPage() {
  return (
    <>
      <PageHeader
        eyebrow="Curriculum Vitae"
        title="Experience & beyond"
        subtitle="The full picture — roles, education, research, recognition, and what I do for fun."
      />
      <CV
        intro={resumeIntro}
        entries={mockResume}
        education={mockEducation}
        publications={mockPublications}
        awards={mockAwards}
        hobbies={mockHobbies}
      />
    </>
  );
}
