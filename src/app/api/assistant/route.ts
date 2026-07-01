import { anthropic } from "@ai-sdk/anthropic";
import { generateText, tool, stepCountIs, jsonSchema } from "ai";
import { siteConfig } from "@/config/site";
import { getNewsList } from "@/lib/news";
import type { NewsItem } from "@/types";

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
- You know what page the user is currently on — use that context
- The latest news items are provided below. If the user asks about older news or you need more than what's listed, call the search_news tool to fetch more from the database.
- When you reference a news item, you may share its link so the user can read more
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

export async function POST(req: Request) {
  try {
    const { messages, currentPage, pageContent } = await req.json();

    // Load the latest news for context. Fail soft so the assistant still works
    // (without news) if the database is unavailable.
    let recentNews = "(news unavailable)";
    try {
      const { items } = await getNewsList({ limit: 10 });
      recentNews = formatNews(items);
    } catch {
      /* leave the fallback text */
    }

    const system = `${FRANKLIN_BIO}
Current page: ${currentPage ?? "/"}
${pageContent ? `Page summary: ${pageContent}` : ""}

Latest news (most recent first):
${recentNews}`;

    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      system,
      messages: messages.slice(-10),
      tools: { search_news: searchNews },
      stopWhen: stepCountIs(5),
      maxOutputTokens: 400,
    });

    return Response.json({ content: text });
  } catch {
    return Response.json(
      { content: "Something went wrong. Please try again or contact Franklin directly." },
      { status: 500 }
    );
  }
}
