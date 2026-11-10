"use client";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { PROVIDER_LOGOS } from "./providerLogos";
import styles from "./lobby.module.css";

// Payment channel logos shipped in /public/logos (previously hot-linked from a
// third-party CDN). Only banks that have a local asset are listed.
const BANKS = ["KBANK", "SCB", "KTB", "BAY", "TRUEWALLET", "GSB", "BBL", "BAAC", "TTB", "TISCO", "UOBT", "CIMBT", "KKP"];

/**
 * Lobby footer — Premium Dark (design-reference/lobby-footer-design-6.png).
 * Order: brand logo → heading → subtitle → provider logos → payment logos → tags → copyright.
 * Provider logos: the 54 local files listed in providerLogos.ts (public/images/providers/), in source order.
 */
export default function LobbyFooter() {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          {/* original artwork (582×428, transparent); CSS trims its transparent padding so the visible mark is centred */}
          <Image
            src="/logo.png"
            alt="SNAKE168"
            width={582}
            height={428}
            sizes="(min-width: 1024px) 196px, (min-width: 600px) 150px, 128px"
            className={styles.footerLogo}
          />
          <h2 className={styles.footerTitle}>ที่สุดของค่ายเกมออนไลน์</h2>
          <p className={styles.footerSubtitle}>รวมเกมคุณภาพจากค่ายชั้นนำระดับโลก</p>
        </div>

        {PROVIDER_LOGOS.length > 0 && (
          <ul className={styles.providerLogoGrid} aria-label="ค่ายเกม">
            {PROVIDER_LOGOS.map((p) => (
              <li key={p.src} className={styles.providerLogoItem}>
                {/* local WebP served as-is (already optimised; no re-encode), lazy: the footer is below the fold */}
                <Image src={p.src} alt={p.name} width={p.width} height={p.height} unoptimized loading="lazy" className={styles.providerLogo} />
              </li>
            ))}
          </ul>
        )}

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
