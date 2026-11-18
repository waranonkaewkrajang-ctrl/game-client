import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-marker";

/**
 * Members-only pages: send guests to /login on the server, before the page is rendered,
 * instead of loading the page and bouncing in the browser afterwards.
 * Optimistic check only — the pages and the backend API still verify the real token.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/lobby/:path*",
    "/wallet/:path*",
    "/profile/:path*",
    "/promotions/:path*",
    "/history/:path*",
    "/spin-wheel/:path*",
    "/rewards/:path*",
  ],
};
