"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { APP_ICON_SRC, INSTALL_PATH, dismissBanner, isBannerDismissed, useClientDevice } from "@/lib/app-install";
import styles from "./AppInstallBanner.module.css";

const CLOSE_MS = 300;

/**
 * Mobile-only "install the app" strip rendered in normal flow directly above the sticky Navbar, so it
 * never overlaps it: it scrolls away with the page and the Navbar keeps sticking at top: 0.
 * Every button leads to the /install guide first (app-store style); the actual APK download lives there.
 * Hidden on desktop, inside the installed app, on /install itself, and for 7 days after the X is tapped.
 */
export default function AppInstallBanner() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const device = useClientDevice();
  const [phase, setPhase] = useState<"open" | "closing" | "closed">("open");
  const closeTimer = useRef<number | null>(null);

  // read once per mount (client only — device is null during SSR/hydration)
  const dismissed = useMemo(() => (device ? isBannerDismissed() : false), [device]);

  useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);

  const eligible =
    !!device &&
    !device.standalone &&
    device.kind !== "desktop" &&
    !dismissed &&
    pathname !== INSTALL_PATH;

  if (!eligible || phase === "closed") return null;

  const close = () => {
    if (phase !== "open") return;
    dismissBanner();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setPhase("closed"); return; }
    setPhase("closing");
    closeTimer.current = window.setTimeout(() => setPhase("closed"), CLOSE_MS);
  };

  const kind = device.kind;

  return (
    <aside
      className={`${styles.slot} ${phase === "closing" ? styles.closing : ""}`}
      aria-label={t("appInstall.bannerLabel")}
    >
      <div className={styles.banner}>
        <button type="button" className={styles.close} onClick={close} aria-label={t("appInstall.close")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <img src={APP_ICON_SRC} alt="" width={44} height={44} className={styles.icon} decoding="async" draggable={false} />

        <div className={styles.text}>
          <p className={styles.title}>
            <span className={styles.phrase}>
              {t("appInstall.bannerTitle")}<span className={styles.bang} aria-hidden="true">!</span>
            </span>
          </p>
          <p className={styles.sub}>{t("appInstall.bannerSub")}</p>
        </div>

        <div className={styles.actions}>
          {kind === "android" && (
            <Link href={`${INSTALL_PATH}?os=android`} className={styles.cta}>{t("appInstall.downloadApk")}</Link>
          )}
          {kind === "ios" && (
            <Link href={`${INSTALL_PATH}?os=ios`} className={styles.cta}>{t("appInstall.howToInstall")}</Link>
          )}
          {kind === "unknown" && (
            <>
              <Link href={`${INSTALL_PATH}?os=android`} className={`${styles.cta} ${styles.ctaSm}`}>Android</Link>
              <Link href={`${INSTALL_PATH}?os=ios`} className={`${styles.cta} ${styles.ctaSm}`}>iPhone</Link>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
