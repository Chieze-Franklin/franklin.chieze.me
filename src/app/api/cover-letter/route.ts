import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { siteConfig } from "@/config/site";

const BIO = `Franklin Chieze — Co-founder & CTO of Dreambase. Former Senior Software Engineer at Andela and Software Engineer at Flutterwave. 7+ years building scalable, impactful products across Africa's tech ecosystem. Core strengths: system design, backend engineering, microservices, fintech, team leadership. Stack: Node.js, Next.js, MongoDB, PostgreSQL, Redis, Docker, Kubernetes, AWS, Terraform.`;

export async function POST(req: Request) {
  // Private endpoint — restrict to the site owner.
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  if (user?.emailAddresses?.[0]?.emailAddress !== siteConfig.adminEmail) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { company, role, jobDescription, companyWebsite, extraPrompt } = await req.json();

    const system = `You are an expert cover-letter writer. Write a compelling, specific, and genuine cover letter for ${siteConfig.name}.

Candidate background:
${BIO}

Rules:
- Write ONLY the letter body: begin with a salutation (e.g., "Dear Hiring Team,") and end with a closing ("Sincerely,") followed by "${siteConfig.name}" on the final line.
- Do NOT include the sender's address, contact details, the date, or the company's address — those are added by the template.
- 3–4 tight paragraphs. Confident, warm, and concrete — reference the company and role specifically. No clichés or filler.
- Tie the candidate's real experience to the role's needs. Never invent facts beyond the background provided.`;

    const prompt = `Company: ${company}
Role: ${role}
${companyWebsite ? `Company website: ${companyWebsite}` : ""}

Job description:
${jobDescription || "(not provided)"}

${extraPrompt ? `Additional instructions from the candidate: ${extraPrompt}` : ""}`;

    const { text } = await generateText({
      model: anthropic("claude-opus-4-8"),
      system,
      prompt,
      maxOutputTokens: 1200,
    });

    return Response.json({ letter: text.trim() });
  } catch {
    return Response.json({ error: "Failed to generate cover letter. Please try again." }, { status: 500 });
  }
}
