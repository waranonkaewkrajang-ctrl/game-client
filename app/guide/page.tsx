import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { GUIDES } from "@/content/guides";
import { TOPIC_LABEL, type GuideTopic } from "@/content/guides/types";
import { seoOrigin } from "@/lib/seo-origin";
import landing from "@/app/landing.module.css";
import styles from "./guide.module.css";

const title = "คู่มือการใช้งาน SNAKE168 | หมวดเกม ค่ายเกม แอป และฟุตบอล";
const description = "รวมคู่มือ SNAKE168 ตั้งแต่หมวดเกมและค่ายเกม การใช้งานบนมือถือ ติดตั้งแอป Android และ iPhone โปรแกรมฟุตบอล ไปจนถึงการฝากถอนและการแก้ปัญหา";

export const metadata: Metadata = {
  title,
  description,
  keywords: null,
  alternates: { canonical: "/guide" },
  openGraph: { title, description, url: `${seoOrigin()}/guide`, siteName: "SNAKE168", locale: "th_TH", type: "website", images: [{ url: "/og-image.png", alt: "SNAKE168" }] },
};

const NAV = [
  { href: "/", text: "หน้าแรก" },
  { href: "/guide", text: "คู่มือ" },
  { href: "/guide/game-categories", text: "หมวดเกม" },
  { href: "/guide/football-schedule", text: "ฟุตบอล" },
];

const ORDER: GuideTopic[] = ["games", "providers", "mobile", "app", "football", "help"];

export default function GuideIndex() {
  const origin = seoOrigin();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "คู่มือการใช้งาน SNAKE168",
    description,
    inLanguage: "th",
    url: `${origin}/guide`,
    hasPart: GUIDES.map((g) => ({ "@type": "Article", headline: g.h1, url: `${origin}/guide/${g.slug}` })),
  };

  return (
    <div className={landing.page}>
      <a className={landing.skip} href="#guides">ข้ามไปยังเนื้อหา</a>
      <SiteHeader items={NAV} current="/guide" />
      <main id="guides" className={styles.main}>
        <header className={styles.indexHead}>
          <p className={styles.topic}>คู่มือ</p>
          <h1>คู่มือการใช้งาน SNAKE168</h1>
          <p>
            รวมคำตอบเรื่องที่ผู้ใช้ถามบ่อย ทั้งหมวดเกม ค่ายเกม การใช้งานบนมือถือ การติดตั้งแอป โปรแกรมฟุตบอล และการแก้ปัญหาบัญชี
            ทุกหน้าเขียนจากการใช้งานจริงบนเว็บไซต์ และระบุวันที่ตรวจสอบข้อมูลไว้ที่หัวบทความ
          </p>
        </header>
        {ORDER.map((topic) => {
          const list = GUIDES.filter((g) => g.topic === topic);
          if (!list.length) return null;
          return (
            <section key={topic} className={styles.topicGroup} aria-labelledby={`t-${topic}`}>
              <h2 id={`t-${topic}`}>{TOPIC_LABEL[topic]}</h2>
              <ul className={styles.cards}>
                {list.map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guide/${g.slug}`}>
                      <strong>{g.h1}</strong>
                      <span>{g.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <SiteFooter items={NAV} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
