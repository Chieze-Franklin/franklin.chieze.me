# franklin.chieze.me — Personal Portfolio Requirements

## Overview

Personal portfolio website for Franklin Chieze — engineer and entrepreneur.
Built with **Next.js** (App Router) and connected to a **MongoDB** database.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Database | MongoDB (via Mongoose or native driver) |
| Auth | Clerk.js (admin-only, email-restricted) |
| 3D / WebGL | Three.js or React Three Fiber |
| Styling | TailwindCSS (or CSS Modules) |
| AI Assistant | Claude API (Anthropic) |
| Animation | GSAP / Framer Motion |

---

## Navigation

A global navigation bar present on every page with the following links:

| Label | Route | Description |
|---|---|---|
| News | `/` | Landing page — latest news about Franklin |
| Works | `/works` | Professional works and interactive CV |
| Plays | `/plays` | Pet / personal / side projects |
| Thoughts | `/thoughts` | Articles, blog posts, vlogs, etc. |

The navigation also surfaces:
- **Theme switcher** (interactive clock — see Theming section)
- **AI assistant** trigger button
- **Social/contact links** (also repeated in the footer on every page)

---

## Landing Page (`/` — News)

### Design Inspiration
- https://valentincheval.design/
- https://www.daofor.design/
- https://arocksworld.com/
- https://dversostudio.io/

### Hero Section

- Full-viewport section.
- **Gradient background** (rich, bold, dynamic gradient).
- **Large bold typographic headline** that communicates Franklin is a brilliant engineer and entrepreneur. Example copy:
  > "Franklin Chieze — Engineer. Entrepreneur. Builder of things that matter."
- **3D model of Franklin** rendered in the center/foreground.
  - The model tracks the user's mouse cursor (parallax/look-at effect, as seen on dversostudio.io).
  - Model is loaded via Three.js / React Three Fiber with a `.glb` / `.gltf` asset.
- **Scroll-driven animation on the 3D model:**
  - Scrolling **down** → model translates backward (scale down + translate on Z-axis) and fades out.
  - Scrolling **up** back to hero → model translates forward and fades back in.
  - Implemented with a scroll progress hook tied to GSAP ScrollTrigger or Framer Motion scroll utilities.

### News Section (below hero)

- Infinite-scroll masonry/Pinterest-style card grid.
- Cards have **variable widths and heights**.
- **Newer items are larger** and appear first; older items are smaller and appear later.
- As the user scrolls to the bottom, the next page of news cards is lazy-loaded (intersection observer / infinite scroll).
- **Data source:** mock data initially; later replaced by a MongoDB fetch via a Next.js API route or Server Component.
- Each card links to a dedicated news detail page: `/news/[slug]`.

#### News Card Fields
```ts
{
  id: string;
  title: string;
  summary: string;
  coverImage?: string;
  date: Date;
  slug: string;
  tags?: string[];
  size?: "sm" | "md" | "lg" | "xl"; // derived from recency
}
```

---

## Works Page (`/works`)

### Content

- Projects / professional engagements presented in a masonry card layout (same infinite-scroll pattern as News, with its own visual theme).
- Each work card links to `/works/[slug]`.

### Interactive Resume / CV

A dedicated section (or sub-route `/works/resume`) featuring:

- **Timeline of job roles**, each with:
  - Company, title, date range, description.
  - A list of **skills** used in that role (rendered as clickable chips/badges).
  - A list of **tools** used in that role (rendered as clickable chips/badges, visually distinct from skills).
- **Skill report modal / drawer:** clicking a skill opens a panel showing:
  - How many roles / works required that skill.
  - A **time-based graph** (bar or line chart) showing usage frequency over the years.
  - Any other relevant aggregated stats.
- **Tool report modal / drawer:** clicking a tool opens a panel showing the same style of report as skills:
  - How many roles / works used that tool.
  - A **time-based graph** showing usage frequency over the years.
  - Any other relevant aggregated stats.
- **Resume download:**
  - User selects which experiences to include or omit (checkbox list).
  - User selects a resume template (2–3 template options, rendered as previews).
  - Download triggers a server-side PDF generation (e.g., Puppeteer or react-pdf) using the selected experiences and template.

#### Resume Data Model (MongoDB)
```ts
{
  id: string;
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date; // null = current
  description: string;
  skills: string[];
  tools: string[];
  highlights?: string[];
}
```

---

## Plays Page (`/plays`)

- Same infinite-scroll masonry card layout as News, with a **playful / lighter visual theme**.
- Showcases pet projects, personal experiments, side hacks.
- Each card links to `/plays/[slug]`.

---

## Thoughts Page (`/thoughts`)

- Same infinite-scroll masonry card layout, with a **literary / editorial visual theme**.
- Showcases articles, blog posts, vlogs, and other written or recorded content.
- Each card links to `/thoughts/[slug]`.
- Cards may embed a video thumbnail if the thought is a vlog.

---

## Time-Based Theming

### Automatic theme selection

The site selects a theme based on the user's **local browser time**:

| Time range | Theme name | Mood |
|---|---|---|
| 05:00 – 11:59 | Dawn | Warm sunrise palette |
| 12:00 – 16:59 | Day | Bright, clean, high-contrast |
| 17:00 – 19:59 | Dusk | Golden-hour amber/pink |
| 20:00 – 04:59 | Night | Dark, moody, deep blues/purples |

### Manual theme override — Interactive Clock

- A **clock widget** is always accessible (e.g., in the corner of the nav or as a floating element).
- The user can **drag the clock's hour hand** to any time position.
- Dragging to a time in a different range switches to the corresponding theme immediately.
- The chosen override is persisted in `localStorage` for the session.

### Implementation notes

- Themes are expressed as CSS custom properties (`--color-bg`, `--color-text`, etc.) toggled via a `data-theme` attribute on `<html>`.
- The clock widget is an SVG-based interactive element with pointer event handling.

---

## AI Personal Assistant

### Behavior

- Accessible from every page via a chat widget (floating button → chat drawer/modal).
- **Always knows:**
  - The current page the user is on (passed as context).
  - The visible content of the current page (summary injected into the system prompt).
  - Everything about Franklin (stored in a system prompt / knowledge base file).
- **Token-saving strategy:**
  - The assistant should proactively redirect users to contact Franklin directly for detailed inquiries.
  - Usage is tracked per browser (via `localStorage` or a session cookie) — daily quota per user.
  - When the quota is exhausted, the assistant always responds with a message directing the user to contact Franklin, and presents **contact action buttons**:
    - WhatsApp button
    - Email button
- **Contact info** (populated in `.env` or a config file):
  - WhatsApp number
  - Email address

### API

- Calls the **Claude API** (Anthropic) server-side via a Next.js Route Handler (`/api/assistant`).
- The route receives `{ messages, currentPage, pageContent }` and returns a streamed response.
- System prompt includes: Franklin's bio, current page, page content summary, and quota-reached flag.

---

## Social Links & Footer

Present on every page (footer and/or nav):

- LinkedIn
- Twitter / X
- GitHub
- WhatsApp (contact)
- Email

Links are configured in a single `siteConfig.ts` constant file so they can be updated in one place.

---

## Admin / CMS Page

### Route

`/admin` (or `/dashboard`)

### Authentication

- **Clerk.js** handles auth.
- Only the email `chieze.franklin@gmail.com` is allowed through; any other authenticated user is shown a 403 page.
- Clerk middleware protects the `/admin` route at the Next.js middleware level.

### Capabilities

- CRUD for **News** items.
- CRUD for **Works** items.
- CRUD for **Plays** items.
- CRUD for **Thoughts** items.
- CRUD for **Resume/Job roles**.
- Upload / replace the 3D model asset.
- Update social links and contact info.

---

## Data Architecture (MongoDB Collections)

| Collection | Purpose |
|---|---|
| `news` | News items for the landing page |
| `works` | Professional works/projects |
| `plays` | Pet/side projects |
| `thoughts` | Articles, blogs, vlogs |
| `resume` | Job roles with skills |
| `skills` | Skill definitions and metadata |
| `tools` | Tool definitions and metadata |
| `siteConfig` | Global site config (social links, contact info, AI quota, etc.) |

---

## Routing Summary

| Route | Page |
|---|---|
| `/` | Landing — News |
| `/news/[slug]` | Individual news detail |
| `/works` | Works listing + resume section |
| `/works/[slug]` | Individual work detail |
| `/works/resume` | Interactive resume |
| `/plays` | Plays listing |
| `/plays/[slug]` | Individual play detail |
| `/thoughts` | Thoughts listing |
| `/thoughts/[slug]` | Individual thought detail |
| `/admin` | Admin CMS (Clerk-protected) |
| `/api/assistant` | AI assistant API route |

---

## Open Questions / Future Considerations

- **3D model source:** A `.glb` file of Franklin's likeness needs to be provided or created (e.g., from Ready Player Me or a custom 3D scan).
- **PDF resume generation:** Choose between Puppeteer (server-rendered HTML → PDF) or `@react-pdf/renderer` (React → PDF in the browser or server).
- **Video hosting for vlogs:** Self-hosted (Next.js + CDN) vs. embedded YouTube/Vimeo.
- **AI quota enforcement:** `localStorage` is easy but bypassable. A server-side session or IP-based rate limit may be added later.
- **Internationalisation (i18n):** Not in scope for v1 but worth noting for the future.
