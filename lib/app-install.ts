"use client";
import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * App-install helpers shared by the mobile banner and /install.
 *
 * Device detection here is a UX hint only (which guide/button to show first). It must never gate
 * anything security-relevant — the user can always pick another device manually on /install.
 * Everything reads browser-only APIs, so it runs on the client only (server snapshot = null) to keep
 * hydration deterministic.
 */

export const APP_ICON_SRC = "/icons/app-icon.webp";
export const APK_URL = "/downloads/snake168.apk";
export const APK_FILENAME = "snake168.apk";
export const INSTALL_PATH = "/install";

export type InstallPlatform = "android" | "ios";
export type DeviceKind = InstallPlatform | "desktop" | "unknown";

export function detectDevice(nav: Navigator): DeviceKind {
  const ua = nav.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  // iPadOS 13+ Safari reports a desktop Mac UA; a touch screen tells it apart from a real Mac
  if (/macintosh/i.test(ua) && nav.maxTouchPoints > 1) return "ios";
  if (/windows nt|macintosh|cros|x11|linux x86_64/i.test(ua) && !/mobile/i.test(ua)) return "desktop";
  return "unknown";
}

/** iOS browsers other than Safari (Chrome, Firefox, Edge, LINE/Facebook in-app…) can't "Add to Home Screen" reliably. */
export function isIosNonSafari(nav: Navigator): boolean {
  const ua = nav.userAgent || "";
  return /crios|fxios|edgios|opios|gsa\/|line\/|fban|fbav|instagram|micromessenger/i.test(ua);
}

/** Already running as an installed web app / TWA → no point offering an install. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = (q: string) => typeof window.matchMedia === "function" && window.matchMedia(q).matches;
  return (
    mq("(display-mode: standalone)") ||
    mq("(display-mode: fullscreen)") ||
    mq("(display-mode: minimal-ui)") ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

export interface ClientDevice {
  kind: DeviceKind;
  standalone: boolean;
  iosNonSafari: boolean;
}

let cachedDevice: ClientDevice | null = null;
function getDeviceSnapshot(): ClientDevice {
  if (!cachedDevice) {
    cachedDevice = {
      kind: detectDevice(navigator),
      standalone: isStandalone(),
      iosNonSafari: isIosNonSafari(navigator),
    };
  }
  return cachedDevice;
}
const noopSubscribe = () => () => {};

/** null during SSR / hydration, then the detected device. */
export function useClientDevice(): ClientDevice | null {
  return useSyncExternalStore(noopSubscribe, getDeviceSnapshot, () => null);
}

/* ---------- banner dismissal (7 days) ---------- */

const DISMISS_KEY = "snake168:app-banner-dismissed-at";
export const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export function isBannerDismissed(now = Date.now()): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return Number.isFinite(at) && at > 0 && now - at < DISMISS_MS && at <= now;
  } catch {
    return false;
  }
}

export function dismissBanner(now = Date.now()): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(now));
  } catch {
    // storage blocked (private mode): the banner just closes for this page view
  }
}

/* ---------- APK availability ---------- */

export type ApkStatus = "checking" | "available" | "missing";
export interface ApkInfo {
  status: ApkStatus;
  /** file size from Content-Length, when the server sends it */
  bytes: number | null;
}

let apkProbe: Promise<ApkInfo> | null = null;

/**
 * Confirms the APK really exists before enabling a download button. A missing static file can come back
 * as an HTML 404 page (or an HTML fallback with 200), so anything served as text/html counts as missing.
 */
function probeApk(): Promise<ApkInfo> {
  if (!apkProbe) {
    apkProbe = fetch(APK_URL, { method: "HEAD", cache: "no-store" })
      .then((res): ApkInfo => {
        const type = res.headers.get("content-type") || "";
        if (!res.ok || type.includes("text/html")) return { status: "missing", bytes: null };
        const len = Number(res.headers.get("content-length"));
        return { status: "available", bytes: Number.isFinite(len) && len > 0 ? len : null };
      })
      .catch((): ApkInfo => ({ status: "missing", bytes: null }));
    // a network hiccup shouldn't stick for the whole session
    apkProbe.then((s) => { if (s.status === "missing") apkProbe = null; });
  }
  return apkProbe;
}

export function useApkInfo(enabled = true): ApkInfo {
  const [info, setInfo] = useState<ApkInfo>({ status: "checking", bytes: null });
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    probeApk().then((s) => { if (alive) setInfo(s); });
    return () => { alive = false; };
  }, [enabled]);
  return info;
}

export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
