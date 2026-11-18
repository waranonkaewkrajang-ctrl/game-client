import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CountUp from "@/components/landing/CountUp";
import InstallTabs from "@/components/landing/InstallTabs";
import LeagueFixtures from "@/components/landing/LeagueFixtures";
import ScrollReveal from "@/components/landing/ScrollReveal";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { guideBySlug } from "@/content/guides";
import { CATALOGUE, FACTS_CHECKED_LABEL, FOOTBALL_LEAGUES, LOBBY_CATEGORIES, providerLogos } from "@/content/site-facts";
import type { CalendarFeed } from "@/lib/live-football/calendar";
import { footballCalendar } from "@/lib/live-football/calendar-server";
import { seoOrigin } from "@/lib/seo-origin";
import styles from "./landing.module.css";

const title = "SNAKE168 | หมวดเกม ค่ายเกม ตารางฟุตบอล และการใช้งานบนมือถือ";
const description = `สำรวจหมวดเกมของ SNAKE168 กว่า ${CATALOGUE.games.toLocaleString("th-TH")} เกมจากมากกว่า ${CATALOGUE.providers} ค่าย เช็กโปรแกรมฟุตบอลลีกหลัก และดูวิธีใช้งานบนมือถือ Android และ iPhone`;

export function generateMetadata(): Metadata {
  return {
    title,
    description,
    keywords: null,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: seoOrigin(),
      siteName: "SNAKE168",
      locale: "th_TH",
      type: "website",
      images: [{ url: "/og-image.png", alt: "SNAKE168" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

const navigation = [
  { href: "#games", text: "หมวดเกม" },
  { href: "#providers", text: "ค่ายเกม" },
  { href: "#football", text: "ฟุตบอล" },
  { href: "#app", text: "ติดตั้งแอป" },
  { href: "/guide", text: "คู่มือ" },
  { href: "#faq", text: "คำถามที่พบบ่อย" },
];

const questions = [
  {
    question: "SNAKE168 มีหมวดเกมอะไรบ้าง?",
    answer: "ล็อบบี้มี 6 หมวด ได้แก่ ยอดนิยม คาสิโน สล็อต ยิงปลา เกมไพ่ และกีฬา เลือกหมวดแล้วเลือกค่ายเพื่อดูเกมที่เปิดให้บริการ",
    href: "/guide/game-categories",
    label: "อ่านคู่มือหมวดเกม",
  },
  {
    question: "มีเกมจากกี่ค่าย?",
    answer: `ณ ${FACTS_CHECKED_LABEL} มีเกมที่เปิดอยู่มากกว่า ${CATALOGUE.games.toLocaleString("th-TH")} เกม จากมากกว่า ${CATALOGUE.providers} ค่าย ค่ายที่มีเกมมากที่สุดคือ Pragmatic Play, KA Gaming และ Yggdrasil`,
    href: "/guide/game-providers",
    label: "ดูรายชื่อค่ายทั้งหมด",
  },
  {
    question: "ใช้งานผ่านมือถือได้หรือไม่?",
    answer: "ใช้ผ่านเบราว์เซอร์บนมือถือได้ทันที บน Android ติดตั้งแอปจากไฟล์ APK ทางการได้ ส่วน iPhone ใช้วิธีเพิ่มไปยังหน้าจอโฮมผ่าน Safari",
    href: "/install",
    label: "ดูคู่มือการติดตั้ง",
  },
  {
    question: "บน iPhone ต้องดาวน์โหลดแอปไหม?",
    answer: "ไม่ต้อง เปิดเว็บไซต์ด้วย Safari แตะปุ่มแชร์ แล้วเลือก \"เพิ่มไปยังหน้าจอโฮม\" ไอคอนจะอยู่บนหน้าจอเหมือนแอป",
    href: "/guide/iphone-home-screen",
    label: "ขั้นตอนบน iPhone",
  },
  {
    question: "ต้องสมัครก่อนใช้งานหรือไม่?",
    answer: "การเปิดเกมและการใช้กระเป๋าเงินต้องเข้าสู่ระบบด้วยบัญชีสมาชิก ซึ่งสมัครด้วยเบอร์มือถือ 10 หลัก",
    href: "/register",
    label: "ไปหน้าสมัครสมาชิก",
  },
  {
    question: "ฝากและถอนเงินใช้เวลานานเท่าไร?",
    answer: "ฝากเงินแล้วระบบยืนยันอัตโนมัติ โดยปกติเงินเข้ากระเป๋าภายในประมาณ 5 นาที ส่วนการถอนต้องผ่านการตรวจสอบและอนุมัติจากทีมงานก่อน",
    href: "/guide/deposit-withdraw",
    label: "อ่านขั้นตอนฝาก-ถอน",
  },
  {
    question: "ดูโปรแกรมฟุตบอลได้ลีกไหนบ้าง?",
    answer: `ปฏิทินรายเดือนครอบคลุม ${FOOTBALL_LEAGUES.join(" ")} พร้อมสถานะของคู่และเวลานับถอยหลังก่อนเริ่มแข่ง`,
    href: "/guide/football-schedule",
    label: "อ่านคู่มือโปรแกรมฟุตบอล",
  },
  {
    question: "หากพบปัญหาในการใช้งาน ควรทำอย่างไร?",
    answer: "หากเข้าสู่ระบบไม่ได้ ให้ใช้เมนูลืมรหัสผ่านในหน้าเข้าสู่ระบบเพื่อดูช่องทางติดต่อเจ้าหน้าที่ หากเกมเปิดไม่ขึ้น ให้ตรวจอินเทอร์เน็ตแล้วลองเปิดใหม่",
    href: "/guide/account-help",
    label: "ดูวิธีแก้ปัญหา",
  },
];

type Shot = { src: string; alt: string; width: number; height: number };
type Feature = {
  id: string;
  title: string;
  description: string;
  points: string[];
  href: string;
  label: string;
  browser?: Shot & { url: string };
  phones?: Shot[];
};

// all screenshots are real pages of this site (captured 18 Nov 2026)
const SHOT_LOBBY_DESKTOP: Shot = { src: "/landing/pc-lobby.webp", alt: "หน้า Lobby ของ SNAKE168 บนคอมพิวเตอร์ แสดงหมวดเกม แท็บเกม และการ์ดค่ายเกม", width: 1919, height: 1004 };
const SHOT_LOBBY_MOBILE: Shot = { src: "/landing/phone-lobby.webp", alt: "หน้า Lobby ของ SNAKE168 บนมือถือ แสดงแท็บเกม หมวดเกม และการ์ดค่ายเกม", width: 868, height: 1885 };
const SHOT_LIVE_DESKTOP: Shot = { src: "/landing/shot-live-desktop.webp", alt: "หน้าฟุตบอลของ SNAKE168 บนคอมพิวเตอร์ แสดงตารางการแข่งขันพร้อมปุ่มเรียงเวลาและเรียงลีก", width: 1600, height: 812 };
const SHOT_LIVE_MOBILE: Shot = { src: "/landing/phone-live.webp", alt: "หน้าฟุตบอลของ SNAKE168 บนมือถือ แสดงตารางการแข่งขัน เวลาเตะ และสถานะ LIVE", width: 868, height: 1885 };

const features: Feature[] = [
  {
    id: "lobby",
    title: "เลือกเกมที่ชอบ",
    description: "สำรวจสล็อต คาสิโนสด ยิงปลา เกมไพ่ และกีฬาในล็อบบี้เดียว เลือกดูตามหมวดหรือค่ายที่สนใจ แล้วกดหัวใจเก็บเกมโปรดไว้เล่นต่อ",
    points: ["6 หมวดเกมในล็อบบี้", "เลือกค่ายจากการ์ดพร้อมจำนวนเกม", "แท็บเล่นล่าสุดและเกมโปรด"],
    browser: { ...SHOT_LOBBY_DESKTOP, url: "snake1168.online/lobby" },
    href: "/guide/lobby-guide",
    label: "วิธีใช้ล็อบบี้",
  },
  {
    id: "football-feature",
    title: "ติดตามฟุตบอล",
    description: "เช็กโปรแกรมตามลีก ดูว่าคู่ไหนกำลังแข่งหรือใกล้เริ่ม พร้อมเวลานับถอยหลัง และสมาชิกที่เข้าสู่ระบบจะเห็นการแจ้งเตือนในกระดิ่งก่อนเริ่มเกม",
    points: ["เรียงตามเวลาหรือตามลีก", "เวลาแสดงตามประเทศไทย", "นับถอยหลังก่อนเริ่มแข่ง"],
    browser: { ...SHOT_LIVE_DESKTOP, url: "snake1168.online/live" },
    href: "/live",
    label: "เปิดหน้าฟุตบอล",
  },
  {
    id: "mobile",
    title: "ใช้งานผ่านมือถือ",
    description: "เปิด SNAKE168 ผ่านเบราว์เซอร์บน iOS และ Android ติดตั้งแอปบน Android หรือเพิ่มไอคอนไว้บนหน้าจอโฮมของ iPhone",
    points: ["เมนูหลักอยู่ด้านล่างของจอ", "เกมเปิดเต็มจอในหน้าเดียวกัน", "บัญชีเดียวกันทุกอุปกรณ์"],
    phones: [SHOT_LOBBY_MOBILE, SHOT_LIVE_MOBILE],
    href: "/guide/play-on-mobile",
    label: "คู่มือมือถือ",
  },
];

/** the page must never wait long on the upstream fixtures feed — fall back to client loading */
async function initialFixtures(): Promise<CalendarFeed | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
  return Promise.race([footballCalendar().catch(() => null), timeout]);
}

const CATEGORY_INFO: Record<string, { text: string; count?: string; guide: string }> = {
  popular: { text: "เกมที่จัดไว้ด้านบนของล็อบบี้ จุดเริ่มต้นเมื่อยังไม่รู้จะเล่นอะไร", guide: "/guide/game-categories" },
  casino: { text: "บาคาร่า รูเล็ต แบล็กแจ็ก เสือมังกร แบบมีดีลเลอร์สด", count: `${CATALOGUE.liveCasino}+`, guide: "/guide/live-casino" },
  slot: { text: "สล็อตหลายธีม ทั้งเพย์ไลน์ Megaways และสัญลักษณ์ตกหล่น", count: `${CATALOGUE.slots.toLocaleString("th-TH")}+`, guide: "/guide/slot-games" },
  fishing: { text: "เกมยิงเป้าหมายบนจอ เล่นด้วยการแตะหน้าจอ", count: `${CATALOGUE.fishing}+`, guide: "/guide/fishing-and-card-games" },
  card: { text: "ป๊อกเด้ง ไฮโลไทย น้ำเต้าปูปลา แบบกราฟิก เริ่มรอบได้ทันที", count: `${CATALOGUE.card}+`, guide: "/guide/fishing-and-card-games" },
  sport: { text: "ทางเข้าหน้ากีฬาของ SBOBET และ AMB Sportsbook", count: "2 ค่าย", guide: "/guide/game-categories#sport" },
};

const STEPS = [
  { title: "สมัครด้วยเบอร์มือถือ", text: "ใช้เบอร์มือถือ 10 หลัก ตั้งรหัสผ่าน และกรอกบัญชีธนาคารหรือ TrueWallet สำหรับรับเงิน", href: "/register", label: "สมัครสมาชิก" },
  { title: "ฝากเงินผ่านกระเป๋าเงิน", text: "เลือกช่องทางที่เปิดให้ในหน้ากระเป๋าเงิน ระบบยืนยันยอดฝากอัตโนมัติภายในประมาณ 5 นาที", href: "/guide/deposit-withdraw", label: "ขั้นตอนฝาก-ถอน" },
  { title: "เลือกหมวดและค่ายเกม", text: "เปิดล็อบบี้ เลือกหมวด เลือกค่าย แล้วกดเกมที่ต้องการ ตั้งงบและเวลาเล่นไว้ก่อนเริ่ม", href: "/guide/lobby-guide", label: "วิธีใช้ล็อบบี้" },
];

const FEATURED_GUIDES = ["game-providers", "slot-games", "live-casino", "android-app", "football-schedule", "responsible-play"];

/** phone frame whose screen has the exact ratio of the screenshots (868x1885), so nothing is cropped or zoomed */
function Device({ shot, className = "", sizes, preload }: { shot: Shot; className?: string; sizes: string; preload?: boolean }) {
  return (
    <div className={`${styles.device} ${className}`}>
      <div className={styles.screen}>
        <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes={sizes} preload={preload} />
      </div>
    </div>
  );
}

function Arrow() {
  return <span aria-hidden="true" className={styles.arrow} />;
}

export default async function Home() {
  const fixtures = await initialFixtures();
  const logos = providerLogos();
  const guides = FEATURED_GUIDES.map(guideBySlug).filter((g) => !!g);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
  };

  return (
    <div className={styles.page} id="top">
      <div className={styles.progress} aria-hidden="true" />
      <a className={styles.skip} href="#main-content">ข้ามไปยังเนื้อหา</a>
      <SiteHeader items={navigation} brandHref="#top" />

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <h1 id="hero-title">SNAKE168<br />เกมและ<span>ฟุตบอล</span></h1>
              <p>เลือกหมวดเกมจากหลายสิบค่าย และติดตามโปรแกรมฟุตบอลได้ทั้งบนคอมและมือถือ</p>
              <div className={styles.heroActions}>
                <Link href="/register" className={`${styles.button} ${styles.primary}`}>สมัครสมาชิก <Arrow /></Link>
                <a href="#games" className={styles.button}>ดูหมวดเกม</a>
              </div>
            </div>
            <div className={styles.heroArt}>
              <div className={styles.heroMonitor}>
                <div className={styles.monitorScreen}>
                  <Image src={SHOT_LOBBY_DESKTOP.src} alt={SHOT_LOBBY_DESKTOP.alt} width={SHOT_LOBBY_DESKTOP.width} height={SHOT_LOBBY_DESKTOP.height} sizes="(max-width: 760px) 82vw, 900px" preload />
                </div>
              </div>
              <Device shot={SHOT_LOBBY_MOBILE} className={`${styles.heroDevice} ${styles.heroDeviceLeft}`} sizes="(max-width: 760px) 45vw, 360px" preload />
              <Device shot={SHOT_LIVE_MOBILE} className={`${styles.heroDevice} ${styles.heroDeviceRight}`} sizes="(max-width: 760px) 45vw, 360px" preload />
            </div>
          </div>
        </section>

        <section className={styles.stats} aria-label="ตัวเลขของเว็บไซต์">
          <dl>
            <div><dt>เกมที่เปิดให้บริการ</dt><dd><CountUp value={CATALOGUE.games} suffix="+" /></dd></div>
            <div><dt>ค่ายเกม</dt><dd><CountUp value={CATALOGUE.providers} suffix="+" /></dd></div>
            <div><dt>หมวดเกมในล็อบบี้</dt><dd><CountUp value={LOBBY_CATEGORIES.length} /></dd></div>
            <div><dt>ลีกในปฏิทินฟุตบอล</dt><dd><CountUp value={FOOTBALL_LEAGUES.length} /></dd></div>
          </dl>
          <p>ข้อมูลจากรายการเกมที่เปิดอยู่ ณ {FACTS_CHECKED_LABEL}</p>
        </section>

        <section id="games" className={styles.block} aria-labelledby="games-title">
          <ScrollReveal direction="left" className={styles.blockHead}>
            <p className={styles.eyebrow}>หมวดเกม</p>
            <h2 id="games-title">6 หมวดในล็อบบี้เดียว</h2>
            <p>เลือกหมวดก่อน แล้วค่อยเลือกค่าย ตัวเลขเป็นจำนวนเกมโดยประมาณ</p>
          </ScrollReveal>
          <ul className={styles.categoryGrid}>
            {LOBBY_CATEGORIES.map((c) => {
              const info = CATEGORY_INFO[c.id];
              return (
                <li key={c.id} className={styles[`cat_${c.id}`]}>
                  <Link href={info.guide}>
                    <span className={styles.catEn}>{c.english}</span>
                    <strong>{c.label}</strong>
                    <span className={styles.catText}>{info.text}</span>
                    {info.count && <span className={styles.catCount}>{info.count}{/ค่าย/.test(info.count) ? "" : " เกม"}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="providers" className={styles.marqueeSection} aria-labelledby="providers-title">
          <div className={styles.blockHead}>
            <p className={styles.eyebrow}>ค่ายเกม</p>
            <h2 id="providers-title">ค่ายเกมที่เปิดให้บริการ</h2>
            <p>ตัวอย่างโลโก้ค่ายที่มีเกมเปิดอยู่จริง · <Link href="/guide/game-providers">ดูรายชื่อและจำนวนเกมทุกค่าย</Link></p>
          </div>
          <div className={styles.marquee}>
            <ul className={styles.marqueeTrack}>
              {[...logos, ...logos].map((p, i) => (
                <li key={`${p.id}-${i}`} aria-hidden={i >= logos.length ? true : undefined}>
                  <Image src={p.logo} alt={i >= logos.length ? "" : p.name} width={150} height={82} sizes="150px" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className={styles.features}>
          {features.map((feature, index) => {
            const reverse = index % 2 === 1;
            return (
              <section
                key={feature.id}
                id={feature.id === "football-feature" ? "football" : feature.id}
                className={`${styles.feature} ${reverse ? styles.reverse : ""}`}
                aria-labelledby={`${feature.id}-title`}
              >
                <ScrollReveal direction={reverse ? "right" : "left"} className={styles.art}>
                  {feature.browser && (
                    <div className={styles.browser}>
                      <div className={styles.browserBar} aria-hidden="true"><i /><i /><i /><span>{feature.browser.url}</span></div>
                      <Image src={feature.browser.src} alt={feature.browser.alt} width={feature.browser.width} height={feature.browser.height} sizes="(max-width: 760px) 92vw, 56vw" />
                    </div>
                  )}
                  {feature.phones && (
                    <div className={styles.phonePair}>
                      {feature.phones.map((shot) => (
                        <Device key={shot.src} shot={shot} sizes="(max-width: 760px) 44vw, 300px" />
                      ))}
                    </div>
                  )}
                </ScrollReveal>
                <ScrollReveal direction={reverse ? "left" : "right"} className={styles.featureCopy}>
                  <h2 id={`${feature.id}-title`}>{feature.title}</h2>
                  <p>{feature.description}</p>
                  <ul>{feature.points.map((t) => <li key={t}>{t}</li>)}</ul>
                  <Link href={feature.href} className={styles.button}>{feature.label} <Arrow /></Link>
                </ScrollReveal>
              </section>
            );
          })}
        </div>

        <section id="fixtures" className={styles.block} aria-label="โปรแกรมฟุตบอล">
          <LeagueFixtures initial={fixtures} />
        </section>

        <section className={styles.block} aria-labelledby="steps-title">
          <ScrollReveal direction="left" className={styles.blockHead}>
            <p className={styles.eyebrow}>เริ่มต้นใช้งาน</p>
            <h2 id="steps-title">เริ่มได้ใน 3 ขั้นตอน</h2>
          </ScrollReveal>
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className={styles.stepNo} aria-hidden="true">{i + 1}</span>
                <strong>{s.title}</strong>
                <p>{s.text}</p>
                <Link href={s.href}>{s.label} <Arrow /></Link>
              </li>
            ))}
          </ol>
        </section>

        <section id="app" className={`${styles.block} ${styles.appBlock}`} aria-labelledby="app-title">
          <ScrollReveal direction="left" className={styles.blockHead}>
            <p className={styles.eyebrow}>ติดตั้งแอป</p>
            <h2 id="app-title">ใช้งานเหมือนแอปบนมือถือ</h2>
            <p>Android ติดตั้งจากไฟล์ APK ทางการ ส่วน iPhone เพิ่มไอคอนไว้บนหน้าจอโฮมผ่าน Safari</p>
          </ScrollReveal>
          <InstallTabs />
        </section>

        <section className={styles.block} aria-labelledby="guides-title">
          <ScrollReveal direction="right" className={styles.blockHead}>
            <p className={styles.eyebrow}>คู่มือแนะนำ</p>
            <h2 id="guides-title">อ่านก่อนเริ่มใช้งาน</h2>
          </ScrollReveal>
          <ul className={styles.guideCards}>
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/guide/${g.slug}`}>
                  <strong>{g.h1}</strong>
                  <span>{g.description}</span>
                  <em>อ่านต่อ <Arrow /></em>
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.centerActions}>
            <Link href="/guide" className={styles.button}>คู่มือทั้งหมด <Arrow /></Link>
          </div>
        </section>

        <section className={styles.responsibleBox} aria-labelledby="responsible-title">
          <h2 id="responsible-title">เล่นอย่างรับผิดชอบ</h2>
          <p>
            สำหรับผู้ที่บรรลุนิติภาวะเท่านั้น เกมทุกประเภทมีความเสี่ยงและไม่มีการรับประกันผล ตั้งงบและเวลาก่อนเล่น
            ไม่เล่นเพื่อตามคืนเงินที่เสีย หากรู้สึกควบคุมไม่ได้ ปรึกษาสายด่วนสุขภาพจิต 1323
          </p>
          <Link href="/guide/responsible-play">อ่านแนวทางเล่นอย่างรับผิดชอบ</Link>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <div className={styles.faqInner}>
            <ScrollReveal direction="left">
              <p className={styles.eyebrow}>FAQ</p>
              <h2 id="faq-title">คำถามที่พบบ่อย</h2>
              <p className={styles.faqIntro}>ข้อมูลสำหรับการเริ่มใช้งาน SNAKE168</p>
            </ScrollReveal>
            <ScrollReveal direction="right" className={styles.questions}>
              {questions.map(({ question, answer, href, label }) => (
                <details key={question}>
                  <summary>{question}<Arrow /></summary>
                  <p>{answer} {href && <Link href={href}>{label}</Link>}</p>
                </details>
              ))}
            </ScrollReveal>
          </div>
        </section>
      </main>

      <SiteFooter items={navigation} brandHref="#top" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
