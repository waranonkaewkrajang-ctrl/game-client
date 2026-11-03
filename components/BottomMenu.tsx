"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";
import styles from "./BottomMenu.module.css";

export default function BottomMenu() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [contactLinks, setContactLinks] = useState({ line: "#", telegram: "#" });
  useEffect(() => {
    api.get("/contact-links").then((res) => setContactLinks(res.data)).catch(() => {});
  }, []);
  if (["/login", "/register"].includes(pathname)) return null;

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const cls = (href: string) => `${styles.item} ${active(href) ? styles.itemActive : ""}`;

  return (
    <nav className={styles.bar} aria-label="Mobile">
      <Link href="/lobby" className={cls("/lobby")} aria-current={active("/lobby") ? "page" : undefined}>
        <img src="/icons/game.webp" className={styles.icon} alt="" width={26} height={26} />
        <span className={styles.label}>{t("nav.enterGame")}</span>
      </Link>
      <Link href="/promotions" className={cls("/promotions")} aria-current={active("/promotions") ? "page" : undefined}>
        <img src="/icons/menu/footer-menu-ic-left-2.webp" className={styles.icon} alt="" width={26} height={26} />
        <span className={styles.label}>{t("nav.promotion")}</span>
      </Link>

      <Link href="/wallet" className={`${styles.item} ${styles.center}`} aria-current={active("/wallet") ? "page" : undefined}>
        <span className={styles.centerBubble}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v3" />
            <path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
            <path d="M21 12h-4a2 2 0 0 0 0 4h4v-4z" />
          </svg>
        </span>
        <span className={styles.label}>{t("nav.walletMenu")}</span>
      </Link>

      <a href={contactLinks.line} target="_blank" rel="noopener noreferrer" className={styles.item}>
        <img src="/icons/contact.webp" className={styles.icon} alt="" width={26} height={26} />
        <span className={styles.label}>{t("nav.contact")}</span>
      </a>
      <Link href="/profile" className={cls("/profile")} aria-current={active("/profile") ? "page" : undefined}>
        <svg className={styles.svgIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        <span className={styles.label}>{t("nav.profile")}</span>
      </Link>
    </nav>
  );
}
