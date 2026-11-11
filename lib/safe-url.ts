// Validation for links that come from the API/admin panel (activities, popups, game launch URLs).
// Only absolute http(s) URLs or same-site paths are followed; javascript:, data:, protocol-relative ("//host")
// and malformed values are rejected.

/** The value itself (trimmed, otherwise unchanged — provider launch tokens must not be re-encoded) when it is an
 *  absolute http(s) URL; null otherwise. */
export function externalHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  try {
    const { protocol } = new URL(raw);
    return protocol === "https:" || protocol === "http:" ? raw : null;
  } catch { return null; }
}

/** A same-site path such as "/promotions?x=1"; null for "//host", "/\\host", schemes or empty values. */
export function internalPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  return /^\/(?![\/\\])/.test(path) && !/[\u0000-\u001f]/.test(path) ? path : null;
}

/** Open an admin-configured link: external http(s) in a new tab without opener access, internal paths via `navigate`. */
export function openConfiguredLink(value: unknown, navigate: (path: string) => void): void {
  const external = externalHttpUrl(value);
  if (external) { window.open(external, "_blank", "noopener,noreferrer"); return; }
  const path = internalPath(value);
  if (path) navigate(path);
}
