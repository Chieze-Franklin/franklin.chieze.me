import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { ApplyTracker } from "@/components/apply/ApplyTracker";

export const metadata = { title: "Applications — Franklin Chieze", robots: { index: false } };

export default async function ApplyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (email !== siteConfig.adminEmail) redirect("/");

  return (
    <>
      <PageHeader
        eyebrow="Private"
        title="Job applications"
        subtitle="Track companies, roles, and progress — and draft tailored cover letters with AI."
      />
      <ApplyTracker />
    </>
  );
}
