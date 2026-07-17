import { requireAdmin } from "@/lib/admin-page";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminResume } from "@/components/admin/AdminResume";
import { AdminTaxonomy } from "@/components/admin/AdminTaxonomy";
import { IntroEditor } from "@/components/admin/IntroEditor";

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <h2 className="mb-4 text-lg font-black" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function AdminResumePage() {
  await requireAdmin();
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
      <AdminHeader title="Manage Resume" subtitle="Edit the CV intro, experience, education, publications, and hobbies." />

      <SubSection title="Intro">
        <IntroEditor settingKey="resumeIntro" placeholder="A short professional summary shown at the top of the CV." />
      </SubSection>

      <SubSection title="Experience">
        <AdminResume />
      </SubSection>

      <SubSection title="Education">
        <AdminTaxonomy
          endpoint="/api/education"
          singular="Education entry"
          displayKey="degree"
          fields={[
            { key: "degree", label: "Degree", required: true },
            { key: "institution", label: "Institution", required: true },
            { key: "field", label: "Field / honours" },
            { key: "startDate", label: "Start date", type: "date" },
            { key: "endDate", label: "End date", type: "date" },
            { key: "location", label: "Location" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </SubSection>

      <SubSection title="Publications">
        <AdminTaxonomy
          endpoint="/api/publications"
          singular="Publication"
          displayKey="title"
          fields={[
            { key: "title", label: "Title", required: true },
            { key: "venue", label: "Venue", required: true },
            { key: "year", label: "Year", type: "number" },
            { key: "authors", label: "Authors", type: "csv" },
            {
              key: "type",
              label: "Type",
              type: "select",
              options: [
                { value: "conference", label: "Conference" },
                { value: "journal", label: "Journal" },
                { value: "preprint", label: "Preprint" },
                { value: "chapter", label: "Chapter" },
                { value: "thesis", label: "Thesis" },
              ],
            },
            { key: "url", label: "Link", type: "url" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </SubSection>

      <SubSection title="Hobbies">
        <AdminTaxonomy
          endpoint="/api/hobbies"
          singular="Hobby"
          displayKey="name"
          fields={[
            { key: "name", label: "Name", required: true },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </SubSection>
    </div>
  );
}
