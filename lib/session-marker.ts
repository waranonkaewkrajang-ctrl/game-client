/**
 * "Signed in" marker cookie for the server-side redirect in proxy.ts.
 * It only says that this browser has a login — the real token stays in localStorage
 * and every API call is still checked by the backend, so the cookie carries no secret.
 */
export const SESSION_COOKIE = "sn_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days; a stale marker only skips the early redirect

export function markSignedIn() {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
}

export function markSignedOut() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** where to go after login: the ?next= path from the redirect, only if it is a local path */
export function nextPathAfterLogin(fallback = "/lobby") {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get("next");
  // only a path on this site: "/\evil.com", "//evil.com", "https://…" etc. resolve to another origin and are refused
  if (!raw || !raw.startsWith("/") || /[\\\u0000-\u001f]/.test(raw)) return fallback;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname.startsWith("/login")) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
