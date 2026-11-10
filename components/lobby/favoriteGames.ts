"use client";
// Favorite games — browser-local store (the single favorites store used by the provider rooms and the lobby tab).
//
// The project has no favorites backend, hook, store or page (searched: no favorite/favourite/wishlist
// code or endpoints), so favorites live in this browser's localStorage only: they survive a refresh but
// do NOT sync across devices or browsers. If a favorites API is added later, swap the read/write
// functions below; the hook's interface (isFavorite / toggle) can stay the same.
//
// Stored value: JSON array of keys "<PRODUCT_ID>:<game_code>" — product id + the provider's own game code,
// so games from different providers never collide. Only game identifiers are stored (no tokens/user data).
// The array keeps insertion order (oldest first).
//
// Per account: the list is stored under "<LEGACY_KEY>:user:<id>", where <id> is the logged-in user's id from
// localStorage "user_data" (written by the login/register pages; username as a fallback), so two accounts
// on the same browser never see each other's favorites. Without a known user the original key is used.
// Migration: favorites saved before scoping (original key) are moved once into the first account that
// loads them, then the original key is cleared, so they cannot reach a second account.

import { useCallback, useSyncExternalStore } from "react";

const LEGACY_KEY = "snake168:favorite-games:v1";
const USER_DATA_KEY = "user_data";
const EMPTY: readonly string[] = [];

export const favoriteKey = (productId: string, gameCode: string) => `${productId.toUpperCase()}:${gameCode}`;

/** splits a favorite key back into its product id (upper-cased) and game code */
export const parseFavoriteKey = (key: string) => {
  const i = key.indexOf(":");
  return i > 0 ? { productId: key.slice(0, i), gameCode: key.slice(i + 1) } : null;
};

function currentStorageKey(): string {
  try {
    const raw = window.localStorage.getItem(USER_DATA_KEY);
    const user: unknown = raw ? JSON.parse(raw) : null;
    if (user && typeof user === "object") {
      const { id, username } = user as { id?: unknown; username?: unknown };
      const scope = id ?? username;
      if ((typeof scope === "string" && scope !== "") || typeof scope === "number") return `${LEGACY_KEY}:user:${scope}`;
    }
  } catch { /* unreadable user data → unscoped */ }
  return LEGACY_KEY;
}

function parseList(raw: string | null): string[] {
  const parsed: unknown = raw ? JSON.parse(raw) : [];
  return Array.isArray(parsed) ? [...new Set(parsed.filter((v): v is string => typeof v === "string"))] : [];
}

let cache: { key: string; list: readonly string[] } | null = null;
const listeners = new Set<() => void>();

function read(): readonly string[] {
  let key = LEGACY_KEY;
  try { key = currentStorageKey(); } catch { /* storage blocked */ }
  if (cache && cache.key === key) return cache.list;
  let list: readonly string[] = [];
  try {
    const ls = window.localStorage;
    const raw = ls.getItem(key);
    if (raw === null && key !== LEGACY_KEY) {
      // one-time move of pre-scoping favorites into this account
      const legacy = ls.getItem(LEGACY_KEY);
      list = parseList(legacy);
      if (legacy !== null) {
        ls.setItem(key, JSON.stringify(list));
        ls.removeItem(LEGACY_KEY);
      }
    } else {
      list = parseList(raw);
    }
  } catch {
    list = []; // storage blocked / corrupt → behave as "no favorites"
  }
  cache = { key, list };
  return list;
}

/** returns false when the browser refused to save (private mode / quota) — the caller keeps the old state */
function write(next: readonly string[]): boolean {
  let key: string;
  try {
    key = currentStorageKey();
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    return false;
  }
  cache = { key, list: next };
  listeners.forEach((l) => l());
  return true;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // another tab changed the list, or logged in / out (user_data)
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === USER_DATA_KEY || e.key.startsWith(LEGACY_KEY)) { cache = null; listener(); }
  };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
}

/** Shared favorite state: every card/page using this hook sees the same list (same tab: instantly). */
export function useFavoriteGames() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const isFavorite = useCallback((key: string) => list.includes(key), [list]);
  const toggle = useCallback((key: string): boolean => {
    const current = read();
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    return write(next);
  }, []);
  return { favorites: list, isFavorite, toggle };
}
