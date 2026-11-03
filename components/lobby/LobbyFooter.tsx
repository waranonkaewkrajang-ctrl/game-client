"use client";
import { useTranslation } from "react-i18next";
import styles from "./lobby.module.css";

// Payment channel logos shipped in /public/logos (previously hot-linked from a
// third-party CDN). Only banks that have a local asset are listed.
const BANKS = ["KBANK", "SCB", "KTB", "BAY", "TRUEWALLET", "GSB", "BBL", "BAAC", "TTB", "TISCO", "UOBT", "CIMBT", "KKP"];

export default function LobbyFooter() {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <img src="/logo.png" alt="SNAKE168" className={styles.footerLogo} loading="lazy" decoding="async" width={112} height={56} />
        <p className={styles.footerTagline}>{t("footer.tagline")}</p>

        <div className={styles.footerGroup}>
          <h2 className={styles.footerHeading}>{t("footer.payments")}</h2>
          <div className={styles.bankRow}>
            {BANKS.map((b) => (
              <img key={b} src={`/logos/${b}.webp`} alt={b} title={b} className={styles.bankLogo} loading="lazy" decoding="async" width={42} height={42} />
            ))}
          </div>
        </div>

        <div className={styles.footerGroup}>
          <h2 className={styles.footerHeading}>{t("footer.tags")}</h2>
          <span className={styles.footerTag}>สล็อตเว็บตรง PG เว็บใหญ่ มาแรง 2025 อันดับ 1 ในไทย</span>
        </div>

        <p className={styles.footerCopy}>© {new Date().getFullYear()} SNAKE168</p>
      </div>
    </footer>
  );
}
