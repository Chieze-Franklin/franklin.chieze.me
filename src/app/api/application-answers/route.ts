import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, jsonSchema } from "ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { siteConfig } from "@/config/site";
import { buildCandidateContext } from "@/lib/candidate-context";

interface AskedQuestion {
  id: string;
  question: string;
  wordLimit?: number;
  hint?: string;
  /** Existing draft, when the user is asking for a rewrite rather than a first pass. */
  current?: string;
}

interface AnswerPayload {
  answers: { id: string; answer: string }[];
}

const answerSchema = jsonSchema<AnswerPayload>({
  type: "object",
  properties: {
    answers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "The id of the question being answered." },
          answer: { type: "string", description: "The answer, in the candidate's own voice." },
        },
        required: ["id", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["answers"],
  additionalProperties: false,
});

export async function POST(req: Request) {
  // Private endpoint — restrict to the site owner.
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  if (user?.emailAddresses?.[0]?.emailAddress !== siteConfig.adminEmail) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const {
      company,
      role,
      jobDescription,
      companyWebsite,
      location,
      notes,
      coverLetter,
      extraPrompt,
      questions,
    } = (await req.json()) as {
      company?: string;
      role?: string;
      jobDescription?: string;
      companyWebsite?: string;
      location?: string;
      notes?: string;
      coverLetter?: string;
      extraPrompt?: string;
      questions?: AskedQuestion[];
    };

    const asked = (questions ?? []).filter((q) => q?.question?.trim());
    if (asked.length === 0) {
      return Response.json({ error: "Add at least one question first." }, { status: 400 });
    }

    const candidate = await buildCandidateContext();

    const system = `You are helping ${siteConfig.name} answer the questions on a job application form. Write each answer in first person, as ${siteConfig.name} would write it himself.

Everything known about the candidate:
${candidate}

Rules:
- Ground every answer in the candidate background above and in the job details. NEVER invent employers, titles, dates, metrics, or achievements that are not there.
- Be specific: name real projects, companies, and technologies from the background, and tie them to what this role actually needs.
- Natural, confident, human voice. Plain prose — no clichés, no filler, no AI throat-clearing, no bullet lists unless the question clearly asks for one.
- Respect each question's word limit strictly. With no limit given, keep the answer to roughly 120–180 words.
- Answer the question that was asked — directly, from the first sentence.
- If the background genuinely lacks what a question asks for (a specific certification, a tool never used), write the most honest answer available from adjacent experience rather than fabricating.
- Return one entry per question, echoing the exact id you were given.`;

    const prompt = `Company: ${company || "(not provided)"}
Role: ${role || "(not provided)"}
${location ? `Location: ${location}` : ""}
${companyWebsite ? `Company website: ${companyWebsite}` : ""}

Job description:
${jobDescription || "(not provided)"}

${notes ? `Candidate's notes on this application: ${notes}` : ""}
${coverLetter ? `Cover letter already drafted for this role (stay consistent with it, do not repeat it verbatim):\n${coverLetter}` : ""}
${extraPrompt ? `Additional instructions from the candidate (these take priority): ${extraPrompt}` : ""}

Questions to answer:
${asked
  .map(
    (q, i) =>
      `${i + 1}. [id: ${q.id}] ${q.question.trim()}${q.wordLimit ? ` (max ${q.wordLimit} words)` : ""}${
        q.hint ? `\n   Steer for this answer: ${q.hint}` : ""
      }${q.current?.trim() ? `\n   Existing draft to improve on: ${q.current.trim()}` : ""}`
  )
  .join("\n")}`;

    const { object } = await generateObject({
      model: anthropic("claude-opus-5"),
      schema: answerSchema,
      system,
      prompt,
      maxOutputTokens: 4000,
    });

    // Only hand back answers for questions that were actually asked.
    const byId = new Map(object.answers.map((a) => [a.id, a.answer]));
    const answers = asked
      .map((q) => ({ id: q.id, answer: (byId.get(q.id) ?? "").trim() }))
      .filter((a) => a.answer);

    if (answers.length === 0) {
      return Response.json({ error: "No answers came back. Please try again." }, { status: 502 });
    }

    return Response.json({ answers });
  } catch {
    return Response.json({ error: "Failed to generate answers. Please try again." }, { status: 500 });
  }
}
