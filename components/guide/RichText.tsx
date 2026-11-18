import Link from "next/link";
import { Fragment } from "react";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Plain text with [label](/path) links. Internal paths use <Link>; anything else opens as a normal anchor. */
export default function RichText({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    const [, label, href] = m;
    out.push(
      href.startsWith("/") || href.startsWith("#")
        ? <Link key={i} href={href}>{label}</Link>
        : <a key={i} href={href} rel="noopener noreferrer" target="_blank">{label}</a>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((n, k) => <Fragment key={k}>{n}</Fragment>)}</>;
}

/** text without link markup — for JSON-LD and meta, so structured data matches what is shown */
export const plainText = (text: string) => text.replace(LINK, "$1");
