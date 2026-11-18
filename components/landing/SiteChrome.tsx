import Image from "next/image";
import Link from "next/link";
import styles from "@/app/landing.module.css";

export interface NavItem {
  href: string;
  text: string;
}

function NavLinks({ items, current }: { items: NavItem[]; current?: string }) {
  return items.map(({ href, text }) => (
    <Link key={href} href={href} aria-current={href === current ? "page" : undefined}>{text}</Link>
  ));
}

function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className={styles.brand} aria-label="SNAKE168 หน้าแรก">
      <Image src="/images/logo/snake168-text-logo.webp" alt="SNAKE168" width={1996} height={788} sizes="160px" />
    </Link>
  );
}

/** header shared by the landing page and the /guide pages (no client JS; mobile menu is a <details>) */
export function SiteHeader({ items, brandHref = "/", current }: { items: NavItem[]; brandHref?: string; current?: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Brand href={brandHref} />
        <nav className={styles.desktopNav} aria-label="เมนูหลัก"><NavLinks items={items} current={current} /></nav>
        <Link href="/login" className={styles.button}>เข้าสู่ระบบ</Link>
        <details className={styles.mobileNav}>
          <summary aria-label="เมนูหลัก"><span aria-hidden="true" /></summary>
          <nav aria-label="เมนูหลัก"><NavLinks items={items} current={current} /></nav>
        </details>
      </div>
    </header>
  );
}

const FOOTER_GUIDES: NavItem[] = [
  { href: "/guide", text: "คู่มือทั้งหมด" },
  { href: "/guide/game-categories", text: "หมวดเกม" },
  { href: "/guide/game-providers", text: "ค่ายเกม" },
  { href: "/guide/android-app", text: "แอป Android" },
  { href: "/guide/iphone-home-screen", text: "ใช้งานบน iPhone" },
  { href: "/guide/football-schedule", text: "โปรแกรมฟุตบอล" },
  { href: "/guide/responsible-play", text: "เล่นอย่างรับผิดชอบ" },
];

export function SiteFooter({ items, brandHref = "/" }: { items: NavItem[]; brandHref?: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Brand href={brandHref} />
        <nav aria-label="เมนูท้ายหน้า"><NavLinks items={items} /></nav>
        <small>© SNAKE168</small>
      </div>
      <div className={styles.footerGuides}>
        <nav aria-label="คู่มือการใช้งาน"><NavLinks items={FOOTER_GUIDES} /></nav>
        <p>สำหรับผู้ที่บรรลุนิติภาวะเท่านั้น · เกมมีความเสี่ยง ไม่มีการรับประกันผลได้เสีย โปรดตั้งงบและเวลาเล่นให้เหมาะสม</p>
      </div>
    </footer>
  );
}
