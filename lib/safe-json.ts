// Read JSON from localStorage without letting a corrupted/blocked value crash the page.
export function readStoredJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const value = JSON.parse(raw) as T | null; // shape is NOT validated — callers check it
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

/** The username saved by the login/register pages, or null when missing or malformed. */
export function readStoredUsername(): string | null {
  const user = readStoredJSON<unknown>("user_data", null);
  const name = user && typeof user === "object" ? (user as { username?: unknown }).username : null;
  return typeof name === "string" && name ? name : null;
}
