import type {
  WorkItem,
  PlayItem,
  ThoughtItem,
  ResumeEntry,
  Education,
  Publication,
  Hobby,
  Award,
} from "@/types";
import { siteConfig } from "@/config/site";

export const mockWorks: WorkItem[] = [
  {
    _id: "w1",
    title: "Dreambase",
    summary: "Platform powering Africa's next-gen digital products.",
    date: "2023-01-01",
    slug: "dreambase",
    size: "xl",
    coverImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
    tags: ["saas", "platform", "africa"],
  },
  {
    _id: "w2",
    title: "Relai",
    summary: "Real-time relay infrastructure for modern web applications.",
    date: "2022-06-01",
    slug: "relai",
    size: "lg",
    tags: ["websocket", "realtime", "infrastructure"],
  },
];

export const mockPlays: PlayItem[] = [
  {
    _id: "p1",
    title: "3D Portfolio Experiment",
    summary: "An experimental 3D personal portfolio built with Three.js.",
    date: "2025-03-01",
    slug: "3d-portfolio-experiment",
    size: "lg",
    tags: ["threejs", "3d", "portfolio"],
  },
  {
    _id: "p2",
    title: "AI Receipt Scanner",
    summary: "Snap a receipt and get structured expense data instantly.",
    date: "2024-11-10",
    slug: "ai-receipt-scanner",
    size: "md",
    tags: ["ai", "computer-vision", "finance"],
  },
  {
    _id: "p3",
    title: "CLI Kanban Board",
    summary: "A full-featured Kanban board that lives entirely in your terminal.",
    date: "2024-07-22",
    slug: "cli-kanban",
    size: "sm",
    tags: ["cli", "productivity", "go"],
  },
];

export const mockThoughts: ThoughtItem[] = [
  {
    _id: "t1",
    title: "Why African startups should own their infrastructure",
    summary:
      "A long-form take on the hidden cost of renting compute from hyperscalers when building for emerging markets.",
    date: "2025-10-01",
    slug: "african-startups-own-infrastructure",
    size: "xl",
    type: "article",
    readingTime: 12,
    tags: ["infrastructure", "africa", "startups"],
    coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
  },
  {
    _id: "t2",
    title: "Building real-time features without losing your mind",
    summary: "WebSockets, SSE, long-polling — when to use each and how to scale them.",
    date: "2025-07-14",
    slug: "realtime-features",
    size: "lg",
    type: "blog",
    readingTime: 8,
    tags: ["backend", "realtime", "engineering"],
  },
  {
    _id: "t3",
    title: "A week in the life of a founder-engineer",
    summary: "Vlog: code, calls, coffee, and the chaos in between.",
    date: "2025-05-30",
    slug: "week-in-the-life-founder-engineer",
    size: "md",
    type: "vlog",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tags: ["vlog", "founder", "lifestyle"],
  },
];

export const mockResume: ResumeEntry[] = [
  {
    _id: "r1",
    company: "Dreambase",
    title: "Co-founder & CTO",
    startDate: "2023-01-01",
    description:
      "Leading engineering across all Dreambase products. Designed the core platform architecture, hired and mentored the engineering team, and shipped the first paid customers.",
    skills: ["System Design", "Team Leadership", "Product Strategy", "API Design"],
    tools: ["Node.js", "Next.js", "MongoDB", "Kubernetes", "AWS", "Terraform"],
    highlights: [
      "Grew engineering team from 1 to 12 engineers",
      "Architected a multi-tenant SaaS platform serving 50+ clients",
    ],
  },
  {
    _id: "r2",
    company: "Andela",
    title: "Senior Software Engineer",
    startDate: "2020-03-01",
    endDate: "2022-12-31",
    description:
      "Built and maintained high-traffic backend services and led a distributed team of five engineers.",
    skills: ["Backend Engineering", "Microservices", "Code Review", "Mentorship"],
    tools: ["Node.js", "PostgreSQL", "Redis", "Docker", "GitHub Actions"],
    highlights: [
      "Reduced API p99 latency by 40% through query optimisation",
      "Led migration of monolith to microservices architecture",
    ],
  },
];

/* ─── CV: intro, education, publications, awards, hobbies ──────── */

export const resumeIntro =
  `Software engineer and entrepreneur with ${siteConfig.stats.yearsBuilding} years building scalable products across Africa's tech ecosystem. Co-founder of ProteusAI and founder of Dreambase, with prior senior roles at Andela. I care about resilient systems, strong teams, and shipping things that matter.`;

export const mockEducation: Education[] = [
  {
    _id: "ed1",
    institution: "University of Lagos",
    degree: "B.Sc. Computer Science",
    field: "First Class Honours",
    startDate: "2012-09-01",
    endDate: "2016-07-31",
    location: "Lagos, Nigeria",
    description: "Graduated top of class. Final-year project on distributed payment systems.",
  },
  {
    _id: "ed2",
    institution: "Stanford Online",
    degree: "Graduate Certificate, Distributed Systems",
    startDate: "2019-01-01",
    endDate: "2019-12-31",
    location: "Remote",
  },
];

export const mockPublications: Publication[] = [
  {
    _id: "pub1",
    title: "Resilient Payment Orchestration for Emerging Markets",
    venue: "ACM SoCC",
    year: 2023,
    authors: ["F. Chieze", "A. Okafor"],
    type: "conference",
    url: "https://example.com/paper-payment-orchestration",
    description: "A fault-tolerant architecture for multi-provider payment routing under unreliable networks.",
  },
  {
    _id: "pub2",
    title: "Scaling Microservices on Constrained Infrastructure",
    venue: "IEEE Software",
    year: 2022,
    authors: ["F. Chieze"],
    type: "journal",
    url: "https://example.com/paper-microservices",
  },
];

export const mockHobbies: Hobby[] = [
  { _id: "hb1", name: "Chess", description: "Rated club player; I run a small community tournament." },
  { _id: "hb2", name: "Long-distance running", description: "Two marathons and counting." },
  { _id: "hb3", name: "Analog photography" },
  { _id: "hb4", name: "Mentoring", description: "Andela Learning Community volunteer." },
];

export const mockAwards: Award[] = [
  {
    _id: "aw1",
    title: "Top 40 Under 40 Engineers in Africa",
    issuer: "TechCabal",
    date: "2024-12-10",
    kind: "award",
    description: "Recognised among Africa's most impactful young engineers.",
    related: [
      { type: "experience", id: "r1", label: "Co-founder & CTO, Dreambase" },
      { type: "news", id: "5", label: "Awarded Top 40 Under 40" },
    ],
  },
  {
    _id: "aw2",
    title: "AWS Certified Solutions Architect – Professional",
    issuer: "Amazon Web Services",
    date: "2023-03-15",
    kind: "certification",
    credentialId: "AWS-PSA-99213",
    url: "https://www.credly.com/badges/example",
    related: [{ type: "experience", id: "r1", label: "Co-founder & CTO, Dreambase" }],
  },
  {
    _id: "aw3",
    title: "Certified Kubernetes Administrator (CKA)",
    issuer: "Cloud Native Computing Foundation",
    date: "2022-08-01",
    kind: "certification",
    credentialId: "CKA-2208-7741",
    related: [
      { type: "experience", id: "r2", label: "Senior Software Engineer, Andela" },
      { type: "work", id: "w1", label: "Dreambase" },
    ],
  },
  {
    _id: "aw4",
    title: "Best Paper Award",
    issuer: "ACM SoCC 2023",
    date: "2023-11-02",
    kind: "award",
    description: "For research on resilient payment orchestration.",
    related: [{ type: "thought", id: "t2", label: "Building real-time features" }],
  },
  {
    _id: "aw5",
    title: "DevFest Lagos — Best Speaker",
    issuer: "GDG Lagos",
    date: "2025-08-15",
    kind: "award",
    related: [
      { type: "news", id: "3", label: "Speaking at DevFest Lagos 2025" },
      { type: "play", id: "p1", label: "3D Portfolio Experiment" },
    ],
  },
];
