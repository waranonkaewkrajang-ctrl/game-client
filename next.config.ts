import type { NextConfig } from "next";
import { PLAYER_HOSTS } from "./lib/live-football/model";

// Optional local-only football WebSocket origin (production uses same-origin /ws/football, covered by 'self').
function wsOrigin(): string {
  try {
    const value = process.env.NEXT_PUBLIC_FOOTBALL_WS_URL;
    return value ? new URL(value).origin : "";
  } catch { return ""; }
}

// Content-Security-Policy in REPORT-ONLY mode: browsers log violations to the console but block nothing, so games,
// the live player, images and websockets keep working while compatibility is verified. Enforce only after review.
// Frame sources follow PLAYER_HOSTS so a player-domain change is reflected here automatically.
const cspReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' https://admintg289.sbs ${wsOrigin()}`.trim(),
  `frame-src ${PLAYER_HOSTS.map((host) => `https://${host}`).join(" ")}`,
  "media-src 'self' blob: https:",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }, // same as the browser default, made explicit
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // anti-clickjacking (e.g. framing /wallet); the site embeds itself nowhere else
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" }, // none are used; clipboard/fullscreen/autoplay untouched
  { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
];

// NOTE: before 2026-11-11 this file had no `export default`, so Next ignored it and ran with defaults (no standalone
// output, no remote image hosts). Exporting it now must not change that runtime behavior, so `output: "standalone"`
// (never active; would change the deploy artifact) is intentionally not carried over, and remotePatterns stays empty
// — which is what production already enforces ("url" parameter is not allowed for remote hosts).
const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false, // don't advertise "X-Powered-By: Next.js"
  images: {
    // Every optimized <Image> uses a local /public path; remote images are rendered with `unoptimized`.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
