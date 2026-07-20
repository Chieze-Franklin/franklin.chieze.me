import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool, stepCountIs, jsonSchema } from "ai";
import { siteConfig } from "@/config/site";
import { getNewsList } from "@/lib/news";
import { getWorksList } from "@/lib/works";
import { getPlaysList } from "@/lib/plays";
import { getThoughtsList } from "@/lib/thoughts";
import { workStatusMeta } from "@/lib/work-status";
import type { NewsItem, WorkItem, PlayItem, ThoughtItem } from "@/types";

const FRANKLIN_BIO = `
You are Franklin Chieze's AI personal assistant on his personal portfolio website (franklin.chieze.me).

About Franklin:
- Software Engineer and Entrepreneur based in Africa
- Co-founder of ProteusAI — a platform powering Africa's next-gen digital products
- Founder of Dreambase - an AI-first software development agency
- Former Senior Software Engineer at Andela
- Recognised among Africa's Top 40 Under 40 Engineers by TechCabal
- Technical mentor at Andela Learning Community (ALC)
- Board advisor at TechNaija Foundation
- Passionate about building impactful, scalable products across Africa's tech ecosystem
- Skills: System Design, Team Leadership, API Design, Backend Engineering, Microservices, Fintech
- Tools: Node.js, Next.js, MongoDB, PostgreSQL, Redis, Docker, Kubernetes, AWS, Terraform

Contact:
- Email: ${siteConfig.socials.email}
- LinkedIn: ${siteConfig.socials.linkedin}
- Twitter: ${siteConfig.socials.twitter}
- GitHub: ${siteConfig.socials.github}
- WhatsApp: ${siteConfig.socials.whatsapp}

Instructions:
- Be helpful, warm, and concise — keep responses to 2-4 sentences max
- For detailed inquiries, proposals, or collaboration redirect users to contact Franklin directly
- You know what page the user is currently on — use that context. If they are reading an article, its content is included below as page content; answer questions about it directly.
- The latest news, works (projects), plays (side projects/experiments), and thoughts (articles/posts/vlogs) are provided below. If the user asks about older items or you need more than what's listed, call the matching search_* tool (search_news, search_works, search_plays, search_thoughts) to fetch more from the database.
- When you reference any item, you may share its link so the user can read more
- Never fabricate facts about Franklin — if you don't know, say so and invite them to contact him
`;

// Render news items into a compact bullet list for the system prompt / tool result.
function formatNews(items: NewsItem[]): string {
  if (items.length === 0) return "(no news items yet)";
  return items
    .map((n) => {
      const date = new Date(n.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const link = n.url || `/news/${n.slug}`;
      return `- ${n.title} (${date}) — ${n.summary} [${link}]`;
    })
    .join("\n");
}

// Render work items into a compact bullet list for the system prompt / tool result.
function formatWorks(items: WorkItem[]): string {
  if (items.length === 0) return "(no work items yet)";
  return items
    .map((w) => {
      const start = w.startDate ? new Date(w.startDate).getFullYear() : "";
      const end = w.endDate ? new Date(w.endDate).getFullYear() : "Present";
      const range = start ? ` (${start}–${end})` : "";
      const status = workStatusMeta(w.status).label;
      const company = w.company ? ` @ ${w.company.name}` : "";
      const link = `/works/${w.slug}`;
      return `- ${w.title}${company}${range} — ${status}: ${w.summary} [${link}]`;
    })
    .join("\n");
}

// Tool: let the model pull more news from the database on demand.
const searchNews = tool({
  description:
    "Fetch Franklin's news items from the database, newest first. Use when the user asks about news, updates, or announcements beyond the recent items already in context.",
  inputSchema: jsonSchema<{ limit?: number }>({
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "How many news items to fetch (default 10, max 50).",
      },
    },
  }),
  execute: async ({ limit }) => {
    try {
      const count = Math.min(Math.max(Math.trunc(limit ?? 10), 1), 50);
      const { items } = await getNewsList({ limit: count });
      return formatNews(items);
    } catch {
      return "Could not load news from the database right now.";
    }
  },
});

// Tool: let the model pull more works (projects) from the database on demand.
const searchWorks = tool({
  description:
    "Fetch Franklin's works (projects/products he has built), newest first. Use when the user asks about his work, projects, or portfolio beyond the recent items already in context.",
  inputSchema: jsonSchema<{ limit?: number }>({
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "How many work items to fetch (default 10, max 50).",
      },
    },
  }),
  execute: async ({ limit }) => {
    try {
      const count = Math.min(Math.max(Math.trunc(limit ?? 10), 1), 50);
      const { items } = await getWorksList({ limit: count });
      return formatWorks(items);
    } catch {
      return "Could not load works from the database right now.";
    }
  },
});

// Compact bullet list for plays / thoughts.
function formatDatedItems(
  items: (PlayItem | ThoughtItem)[],
  basePath: string
): string {
  if (items.length === 0) return "(none yet)";
  return items
    .map((it) => {
      const date = it.date
        ? new Date(it.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "";
      const when = date ? ` (${date})` : "";
      const link = it.url || `/${basePath}/${it.slug}`;
      return `- ${it.title}${when} — ${it.summary} [${link}]`;
    })
    .join("\n");
}

// Tool: pull more plays (side projects / experiments) from the database.
const searchPlays = tool({
  description:
    "Fetch Franklin's plays — side projects and experiments — newest first. Use when the user asks about his experiments, side projects, or things he builds for fun.",
  inputSchema: jsonSchema<{ limit?: number }>({
    type: "object",
    properties: {
      limit: { type: "number", description: "How many plays to fetch (default 10, max 50)." },
    },
  }),
  execute: async ({ limit }) => {
    try {
      const count = Math.min(Math.max(Math.trunc(limit ?? 10), 1), 50);
      const { items } = await getPlaysList({ limit: count });
      return formatDatedItems(items, "plays");
    } catch {
      return "Could not load plays from the database right now.";
    }
  },
});

// Tool: pull more thoughts (articles / posts / vlogs) from the database.
const searchThoughts = tool({
  description:
    "Fetch Franklin's thoughts — articles, blog posts, and vlogs — newest first. Use when the user asks about his writing, articles, opinions, or videos.",
  inputSchema: jsonSchema<{ limit?: number }>({
    type: "object",
    properties: {
      limit: { type: "number", description: "How many thoughts to fetch (default 10, max 50)." },
    },
  }),
  execute: async ({ limit }) => {
    try {
      const count = Math.min(Math.max(Math.trunc(limit ?? 10), 1), 50);
      const { items } = await getThoughtsList({ limit: count });
      return formatDatedItems(items, "thoughts");
    } catch {
      return "Could not load thoughts from the database right now.";
    }
  },
});

export async function POST(req: Request) {
  try {
    const { messages, currentPage, pageContent } = await req.json();

    // Load the latest news + works for context. Fail soft so the assistant still
    // works (without them) if the database is unavailable.
    let recentNews = "(news unavailable)";
    let recentWorks = "(works unavailable)";
    let recentPlays = "(plays unavailable)";
    let recentThoughts = "(thoughts unavailable)";
    try {
      const [news, works, plays, thoughts] = await Promise.all([
        getNewsList({ limit: 10 }),
        getWorksList({ limit: 10 }),
        getPlaysList({ limit: 10 }),
        getThoughtsList({ limit: 10 }),
      ]);
      recentNews = formatNews(news.items);
      recentWorks = formatWorks(works.items);
      recentPlays = formatDatedItems(plays.items, "plays");
      recentThoughts = formatDatedItems(thoughts.items, "thoughts");
    } catch {
      /* leave the fallback text */
    }

    const system = `${FRANKLIN_BIO}
Current page: ${currentPage ?? "/"}
${pageContent ? `Page summary: ${pageContent}` : ""}

Latest news (most recent first):
${recentNews}

Latest works (most recent first):
${recentWorks}

Latest plays (most recent first):
${recentPlays}

Latest thoughts (most recent first):
${recentThoughts}`;

    const result = streamText({
      model: anthropic("claude-haiku-4-5"),
      system,
      messages: messages.slice(-10),
      tools: {
        search_news: searchNews,
        search_works: searchWorks,
        search_plays: searchPlays,
        search_thoughts: searchThoughts,
      },
      stopWhen: stepCountIs(5),
      maxOutputTokens: 400,
    });

    // Stream the assistant's text back to the client as plain-text chunks.
    return result.toTextStreamResponse();
  } catch {
    return Response.json(
      { content: "Something went wrong. Please try again or contact Franklin directly." },
      { status: 500 }
    );
  }
}
