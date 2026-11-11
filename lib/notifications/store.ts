// Client-side notification store for the header bell (useSyncExternalStore).
// Merges every registered source, tracks read/announced state per user in localStorage, and exposes a
// `ring` counter that increases once for each batch of genuinely new notifications.
import { footballSource } from './football-source';
import type { AppNotification, NotificationSource } from './types';

// Add future sources (e.g. admin messages) here — the store and bell need no changes.
const SOURCES: NotificationSource[] = [footballSource];
const STATE_PREFIX = 'snake_notif_state:v1:';
const KEEP_STATE = 48 * 60 * 60_000; // read/announced marks are pruned after this
const EXPIRY_TICK = 30_000;

type UserState = { read: Record<string, number>; announced: Record<string, number> };
export type NotificationSnapshot = {
  items: readonly AppNotification[];
  unread: number;
  isRead: (id: string) => boolean;
  ring: number;
  failed: boolean;
};

const EMPTY: NotificationSnapshot = { items: [], unread: 0, isRead: () => false, ring: 0, failed: false };
let snapshot = EMPTY;
let lastSignature = '';
let user = '';
let refs = 0;
let ring = 0;
let state: UserState = { read: {}, announced: {} };
let stops: (() => void)[] = [];
let expiryTimer: ReturnType<typeof setInterval> | undefined;
const bySource = new Map<string, { items: AppNotification[]; failed: boolean }>();
const listeners = new Set<() => void>();

function stateKey() { return STATE_PREFIX + user; }
function loadState(): UserState {
  try {
    const raw = JSON.parse(localStorage.getItem(stateKey()) ?? 'null') as Partial<UserState> | null;
    const clean = (value: unknown) => Object.fromEntries(Object.entries(value && typeof value === 'object' ? value : {}).filter(([, at]) => typeof at === 'number')) as Record<string, number>;
    return { read: clean(raw?.read), announced: clean(raw?.announced) };
  } catch { return { read: {}, announced: {} }; }
}
function saveState() {
  const cutoff = Date.now() - KEEP_STATE;
  const prune = (marks: Record<string, number>) => Object.fromEntries(Object.entries(marks).filter(([, at]) => at >= cutoff));
  state = { read: prune(state.read), announced: prune(state.announced) };
  try { localStorage.setItem(stateKey(), JSON.stringify(state)); } catch { /* blocked storage: state lives in memory */ }
}

function recompute() {
  const now = Date.now();
  const merged = new Map<string, AppNotification>();
  for (const { items } of bySource.values()) for (const item of items) if (item.expiresAt > now && !merged.has(item.id)) merged.set(item.id, item);
  const items = [...merged.values()].sort((a, b) => b.at - a.at || a.id.localeCompare(b.id));
  const read = state.read;
  const fresh = items.filter(item => !read[item.id] && !state.announced[item.id]);
  if (fresh.length) {
    ring++; // animate once for this batch; refreshes and other tabs won't replay it
    for (const item of fresh) state.announced[item.id] = now;
    saveState();
  }
  const failed = [...bySource.values()].some(source => source.failed);
  // Skip the React update entirely when nothing visible changed (e.g. the 30 s expiry tick, identical refreshes).
  const signature = JSON.stringify([ring, failed, items.map(item => [item.id, item.at, item.expiresAt, item.title, item.body, item.context, item.images, !!read[item.id]])]);
  if (signature === lastSignature) return;
  lastSignature = signature;
  snapshot = {
    items,
    unread: items.filter(item => !read[item.id]).length,
    isRead: id => !!read[id],
    ring,
    failed,
  };
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== stateKey()) return; // read marks changed in another tab
  state = loadState();
  recompute();
}

/** Start sources for a logged-in user. Ref-counted; returns a stop function. */
export function startNotifications(username: string): () => void {
  if (!username) return () => {};
  if (refs > 0 && user !== username) stopAll();
  refs++;
  if (refs === 1) {
    user = username;
    state = loadState();
    stops = SOURCES.map(source => source.start((items, failed = false) => { bySource.set(source.id, { items, failed }); recompute(); }));
    expiryTimer = setInterval(recompute, EXPIRY_TICK); // drop expired items without any network request
    window.addEventListener('storage', onStorage);
  }
  return () => { if (--refs <= 0) stopAll(); };
}
function stopAll() {
  for (const stop of stops) stop();
  stops = [];
  clearInterval(expiryTimer);
  window.removeEventListener('storage', onStorage);
  bySource.clear();
  refs = 0;
  snapshot = EMPTY;
  lastSignature = '';
  for (const listener of listeners) listener();
}

export function markRead(id: string) {
  if (state.read[id]) return;
  state.read[id] = Date.now();
  saveState();
  recompute();
}
export function markAllRead() {
  const now = Date.now();
  for (const item of snapshot.items) state.read[item.id] ??= now;
  saveState();
  recompute();
}

export function subscribeNotifications(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function getNotificationSnapshot() { return snapshot; }
export function getServerNotificationSnapshot() { return EMPTY; }
