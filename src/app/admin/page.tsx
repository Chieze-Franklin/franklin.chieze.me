import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";

const SECTIONS = [
  { label: "News", slug: "news", icon: "📰" },
  { label: "Works", slug: "works", icon: "💼" },
  { label: "Plays", slug: "plays", icon: "🎮" },
  { label: "Thoughts", slug: "thoughts", icon: "💭" },
  { label: "Awards", slug: "awards", icon: "🏆" },
  { label: "Skills", slug: "skills", icon: "🧠" },
  { label: "Tools", slug: "tools", icon: "🛠️" },
  { label: "Resume", slug: "resume", icon: "📄" },
  { label: "Site Config", slug: "site-config", icon: "⚙️" },
];

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (email !== siteConfig.adminEmail) redirect("/");

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs uppercase tracking-[0.3em] font-semibold mb-2"
            style={{ color: "var(--accent)" }}
          >
            Admin
          </p>
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            Content Management
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Signed in as <strong>{email}</strong>
          </p>
        </div>
        <UserButton />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SECTIONS.map((s) => (
          <a
            key={s.slug}
            href={`/admin/${s.slug}`}
            className="flex flex-col gap-3 rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <span className="text-3xl">{s.icon}</span>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {s.label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
