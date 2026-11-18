// Article content for /guide/[slug]. Server-rendered so search engines and answer engines read the full text.
// Inline links inside any text: [label](/path) — rendered as <Link>. Keep every claim verifiable (see site-facts.ts).

export type GuideTopic = "games" | "providers" | "mobile" | "app" | "football" | "help";

export type Block =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption: string; head: string[]; rows: string[][] }
  | { type: "note"; text: string };

export interface GuideSection {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Guide {
  slug: string;
  topic: GuideTopic;
  /** <title> — unique per page */
  title: string;
  /** meta description — unique per page */
  description: string;
  h1: string;
  /** short answer shown first (answer-first for readers and answer engines) */
  answer: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
  summary: string[];
  /** slugs of related guides */
  related: string[];
  cta?: { href: string; label: string };
  /** ISO date the content was last checked against the site */
  updated: string;
}

export const TOPIC_LABEL: Record<GuideTopic, string> = {
  games: "หมวดเกม",
  providers: "ค่ายเกม",
  mobile: "ใช้งานบนมือถือ",
  app: "แอปและการติดตั้ง",
  football: "ฟุตบอล",
  help: "ช่วยเหลือ",
};
