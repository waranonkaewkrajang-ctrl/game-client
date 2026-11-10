"use client";
import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  APK_FILENAME,
  APK_URL,
  APP_ICON_SRC,
  INSTALL_PATH,
  type InstallPlatform,
  formatMegabytes,
  useApkInfo,
  useClientDevice,
} from "@/lib/app-install";
import styles from "./install.module.css";

const PLATFORMS: InstallPlatform[] = ["android", "ios"];

export default function InstallGuide({ initial }: { initial: InstallPlatform | null }) {
  const { t } = useTranslation();
  const device = useClientDevice();
  const [picked, setPicked] = useState<InstallPlatform | null>(initial);
  const [copied, setCopied] = useState(false);
  const tabRefs = useRef<Record<InstallPlatform, HTMLButtonElement | null>>({ android: null, ios: null });

  const detected: InstallPlatform | null =
    device?.kind === "android" || device?.kind === "ios" ? device.kind : null;
  // explicit choice (tab / ?os=) wins; otherwise the detected device; otherwise Android
  const selected: InstallPlatform = picked ?? detected ?? "android";
  const apk = useApkInfo(selected === "android");

  const select = (p: InstallPlatform, focus = false) => {
    setPicked(p);
    if (focus) tabRefs.current[p]?.focus();
    try {
      // keep the choice shareable without a server round-trip
      window.history.replaceState(null, "", `${INSTALL_PATH}?os=${p}`);
    } catch { /* ignore */ }
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = PLATFORMS.indexOf(selected);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      select(PLATFORMS[(i + (e.key === "ArrowRight" ? 1 : PLATFORMS.length - 1)) % PLATFORMS.length], true);
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      select(e.key === "Home" ? PLATFORMS[0] : PLATFORMS[PLATFORMS.length - 1], true);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${INSTALL_PATH}?os=ios`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked — the URL is visible on screen */ }
  };

  const tabLabel = (p: InstallPlatform) => (p === "android" ? "Android" : "iPhone / iPad");

  const meta =
    selected === "android"
      ? [apk.bytes ? formatMegabytes(apk.bytes) : null, t("appInstall.metaAndroidMin"), t("appInstall.metaFree")]
      : [t("appInstall.metaIosSafari"), t("appInstall.metaNoDownload"), t("appInstall.metaFree")];

  return (
    <main className={styles.page}>
      <div className={styles.tabs} role="tablist" aria-label={t("appInstall.chooseDevice")}>
        {PLATFORMS.map((p) => (
          <button
            key={p}
            ref={(el) => { tabRefs.current[p] = el; }}
            type="button"
            role="tab"
            id={`install-tab-${p}`}
            aria-selected={selected === p}
            aria-controls={`install-panel-${p}`}
            tabIndex={selected === p ? 0 : -1}
            className={`${styles.tab} ${selected === p ? styles.tabActive : ""}`}
            onClick={() => select(p)}
            onKeyDown={onTabKey}
          >
            {tabLabel(p)}
            {detected === p && <span className={styles.tabHint}>{t("appInstall.thisDevice")}</span>}
          </button>
        ))}
      </div>

      {/* app-store style listing: the only APK download button lives here */}
      <header className={styles.store}>
        <img src={APP_ICON_SRC} alt="" width={88} height={88} className={styles.storeIcon} />
        <div className={styles.storeBody}>
          <h1 className={styles.storeName}>SNAKE168</h1>
          <p className={styles.storeTagline}>{t("appInstall.pageLead")}</p>
          <ul className={styles.storeMeta} aria-label={t("appInstall.appInfo")}>
            {meta.filter(Boolean).map((m) => <li key={m as string}>{m}</li>)}
          </ul>
        </div>
        <div className={styles.storeCta}>
          {device?.standalone ? (
            <p className={styles.notice} role="status">{t("appInstall.alreadyInstalled")}</p>
          ) : selected === "android" ? (
            <>
              {apk.status === "available" ? (
                <a href={APK_URL} download={APK_FILENAME} className={styles.primary} type="application/vnd.android.package-archive">
                  <DownloadIcon /> {t("appInstall.downloadApk")}
                </a>
              ) : (
                <button type="button" className={styles.primary} disabled aria-busy={apk.status === "checking"}>
                  <DownloadIcon /> {apk.status === "missing" ? t("appInstall.apkUnavailableShort") : t("appInstall.downloadApk")}
                </button>
              )}
              {apk.status === "missing" && <p className={styles.warn} role="status">{t("appInstall.apkMissing")}</p>}
              <p className={styles.trust}><ShieldIcon /> {t("appInstall.officialOnly")}</p>
            </>
          ) : (
            <a href="#install-panel-ios" className={styles.primary}>{t("appInstall.seeSteps")}</a>
          )}
        </div>
      </header>

      {selected === "android" ? (
        <section
          id="install-panel-android"
          role="tabpanel"
          aria-labelledby="install-tab-android"
          className={styles.panel}
        >
          <div className={styles.steps}>
            <h2 className={styles.h2}>{t("appInstall.androidTitle")}</h2>
            <ol className={styles.list}>
              <li>
                <h3>{t("appInstall.android1Title")}</h3>
                <p>{t("appInstall.android1Desc")}</p>
              </li>
              <li>
                <h3>{t("appInstall.android2Title")}</h3>
                <p>{t("appInstall.android2Desc")}</p>
              </li>
              <li>
                <h3>{t("appInstall.android3Title")}</h3>
                <p>{t("appInstall.android3Desc")}</p>
              </li>
            </ol>
            <p className={styles.note}>{t("appInstall.androidNote")}</p>
          </div>
          <figure className={styles.figure}>
            <Image
              src="/install/android-guide.png"
              alt={t("appInstall.androidImageAlt")}
              width={1086}
              height={1448}
              sizes="(min-width: 900px) 420px, 100vw"
              loading="eager"
              className={styles.guideImg}
            />
          </figure>
        </section>
      ) : (
        <section
          id="install-panel-ios"
          role="tabpanel"
          aria-labelledby="install-tab-ios"
          className={styles.panel}
        >
          <div className={styles.steps}>
            <h2 className={styles.h2}>{t("appInstall.iosTitle")}</h2>
            {device?.kind === "ios" && device.iosNonSafari && (
              <div className={styles.warnBox} role="note">
                <p>{t("appInstall.iosOpenInSafari")}</p>
                <button type="button" className={styles.secondary} onClick={copyLink}>
                  {copied ? t("appInstall.copied") : t("appInstall.copyLink")}
                </button>
              </div>
            )}
            <ol className={styles.list}>
              <li>
                <h3>{t("appInstall.ios1Title")}</h3>
                <p>{t("appInstall.ios1Desc")}</p>
              </li>
              <li>
                <h3>{t("appInstall.ios2Title")}</h3>
                <p>
                  {t("appInstall.ios2Desc")} <ShareIcon />
                </p>
              </li>
              <li>
                <h3>{t("appInstall.ios3Title")}</h3>
                <p>{t("appInstall.ios3Desc")}</p>
              </li>
              <li>
                <h3>{t("appInstall.ios4Title")}</h3>
                <p>{t("appInstall.ios4Desc")}</p>
              </li>
            </ol>
            <p className={styles.note}>{t("appInstall.iosNote")}</p>
          </div>
          <figure className={styles.figure}>
            <Image
              src="/install/ios-guide.png"
              alt={t("appInstall.iosImageAlt")}
              width={1086}
              height={1448}
              sizes="(min-width: 900px) 420px, 100vw"
              loading="eager"
              className={styles.guideImg}
            />
          </figure>
        </section>
      )}
    </main>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className={styles.inlineIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className={styles.inlineIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5v10h14V11h-1" />
    </svg>
  );
}
