import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RichText, { plainText } from "@/components/guide/RichText";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { GUIDES, guideBySlug } from "@/content/guides";
import { TOPIC_LABEL, type Block } from "@/content/guides/types";
import { seoOrigin } from "@/lib/seo-origin";
import landing from "@/app/landing.module.css";
import styles from "../guide.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = guideBySlug((await params).slug);
  if (!guide) return {};
  const path = `/guide/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    keywords: null,
    alternates: { canonical: path },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${seoOrigin()}${path}`,
      siteName: "SNAKE168",
      locale: "th_TH",
      type: "article",
      modifiedTime: guide.updated,
      images: [{ url: "/og-image.png", alt: "SNAKE168" }],
    },
    twitter: { card: "summary_large_image", title: guide.title, description: guide.description, images: ["/og-image.png"] },
  };
}

const NAV = [
  { href: "/", text: "หน้าแรก" },
  { href: "/guide", text: "คู่มือ" },
  { href: "/guide/game-categories", text: "หมวดเกม" },
  { href: "/guide/football-schedule", text: "ฟุตบอล" },
];

const thaiDate = (iso: string) =>
  new Date(`${iso}T00:00:00+07:00`).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p><RichText text={block.text} /></p>;
    case "h3":
      return <h3>{block.text}</h3>;
    case "ul":
      return <ul>{block.items.map((t) => <li key={t}><RichText text={t} /></li>)}</ul>;
    case "ol":
      return <ol>{block.items.map((t) => <li key={t}><RichText text={t} /></li>)}</ol>;
    case "note":
      return <p className={styles.note}><RichText text={block.text} /></p>;
    case "table":
      return (
        <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={block.caption}>
          <table>
            <caption>{block.caption}</caption>
            <thead><tr>{block.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>
              {block.rows.map((r) => (
                <tr key={r.join("|")}>{r.map((c, i) => (i === 0 ? <th key={i} scope="row"><RichText text={c} /></th> : <td key={i}><RichText text={c} /></td>))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = guideBySlug((await params).slug);
  if (!guide) notFound();

  const origin = seoOrigin();
  const url = `${origin}/guide/${guide.slug}`;
  const related = guide.related.map(guideBySlug).filter((g) => !!g);

  // structured data mirrors the visible page (headline = H1, FAQ = the questions shown below)
  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.h1,
      description: guide.description,
      inLanguage: "th",
      dateModified: guide.updated,
      mainEntityOfPage: url,
      publisher: { "@type": "Organization", name: "SNAKE168", logo: { "@type": "ImageObject", url: `${origin}/images/logo/snake168-text-logo.webp` } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "หน้าแรก", item: `${origin}/` },
        { "@type": "ListItem", position: 2, name: "คู่มือ", item: `${origin}/guide` },
        { "@type": "ListItem", position: 3, name: guide.h1, item: url },
      ],
    },
  ];
  if (guide.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plainText(f.a) } })),
    });
  }

  return (
    <div className={landing.page}>
      <a className={landing.skip} href="#article">ข้ามไปยังเนื้อหา</a>
      <SiteHeader items={NAV} current="/guide" />
      <main id="article" className={styles.main}>
        <nav aria-label="breadcrumb" className={styles.crumbs}>
          <ol>
            <li><Link href="/">หน้าแรก</Link></li>
            <li><Link href="/guide">คู่มือ</Link></li>
            <li aria-current="page">{guide.h1}</li>
          </ol>
        </nav>

        <article className={styles.article}>
          <header className={styles.articleHead}>
            <p className={styles.topic}>{TOPIC_LABEL[guide.topic]}</p>
            <h1>{guide.h1}</h1>
            <p className={styles.updated}>ตรวจสอบข้อมูลล่าสุด <time dateTime={guide.updated}>{thaiDate(guide.updated)}</time></p>
            <div className={styles.answer}>
              <strong>คำตอบสั้น</strong>
              <p><RichText text={guide.answer} /></p>
            </div>
          </header>

          <div className={styles.layout}>
            <aside className={styles.toc} aria-label="สารบัญ">
              <details open>
                <summary>สารบัญ</summary>
                <ol>
                  {guide.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
                  {guide.faq?.length ? <li><a href="#faq">คำถามที่พบบ่อย</a></li> : null}
                  <li><a href="#summary">สรุป</a></li>
                </ol>
              </details>
            </aside>

            <div className={styles.body}>
              {guide.sections.map((s) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                  <h2 id={`${s.id}-h`}>{s.title}</h2>
                  {s.blocks.map((b, i) => <BlockView key={i} block={b} />)}
                </section>
              ))}

              {guide.faq?.length ? (
                <section id="faq" aria-labelledby="faq-h" className={styles.faq}>
                  <h2 id="faq-h">คำถามที่พบบ่อย</h2>
                  {guide.faq.map((f) => (
                    <details key={f.q}>
                      <summary>{f.q}</summary>
                      <p><RichText text={f.a} /></p>
                    </details>
                  ))}
                </section>
              ) : null}

              <section id="summary" aria-labelledby="summary-h" className={styles.summary}>
                <h2 id="summary-h">สรุป</h2>
                <ul>{guide.summary.map((t) => <li key={t}><RichText text={t} /></li>)}</ul>
                {guide.cta && <Link href={guide.cta.href} className={`${landing.button} ${landing.primary}`}>{guide.cta.label}</Link>}
              </section>

              <p className={styles.responsible}>
                เนื้อหานี้ให้ข้อมูลการใช้งานเว็บไซต์เท่านั้น ไม่ใช่คำแนะนำทางการเงิน เกมทุกประเภทมีความเสี่ยงและไม่มีการรับประกันผล
                อ่านเพิ่มเติมที่ <Link href="/guide/responsible-play">เล่นอย่างรับผิดชอบ</Link>
              </p>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="related-h">
            <h2 id="related-h">อ่านต่อ</h2>
            <ul>
              {related.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guide/${g.slug}`}>
                    <span>{TOPIC_LABEL[g.topic]}</span>
                    <strong>{g.h1}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter items={NAV} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
