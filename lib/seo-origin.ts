const DEFAULT_ORIGIN = "https://snake1168.online";

// The SEO origin is independent of the host that serves the request.
export function seoOrigin() {
  const configured = process.env.SEO_CANONICAL_ORIGIN?.trim();
  if (!configured) return DEFAULT_ORIGIN;

  const url = URL.parse(configured);
  if (
    url?.protocol !== "https:" ||
    url.username || url.password || url.pathname !== "/" || url.search || url.hash
  ) {
    throw new Error("SEO_CANONICAL_ORIGIN must be an HTTPS origin without a path, credentials, query, or fragment.");
  }
  return url.origin;
}
