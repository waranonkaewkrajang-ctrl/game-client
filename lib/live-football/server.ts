import 'server-only';
import { randomUUID } from 'node:crypto';
import { parseFeed, reconcileFeed, isFinished, validatePlayerUrl } from './model';
import type { FootballFeed, FootballMatch, PlayerLink } from './model';

const FEED_ORIGIN = 'https://api-streaming-channels.askmebet.live';
const FEED_TTL = 10_000;
// Upstream player links must be OPENED within a few seconds of minting (measured: OK at 0 s, "LINK TIME OUT"
// at 10 s; once playing they keep playing). So links are minted on demand for the match a viewer opens and
// are never cached or reused.
const MINT_CONCURRENCY = 8;      // parallel upstream mints (~0.1 s each → roughly 80 links/s)
const MINT_QUEUE_MAX = 400;      // waiting viewers beyond the parallel slots; queued, not refused
const MINT_QUEUE_WAIT = 10_000;  // give up waiting for a slot after this
const CLIENT_WINDOW = 60_000;
const CLIENT_MAX_OPENS = 30;     // per client IP per minute — far above a human clicking matches
const CLIENT_TRACK_MAX = 20_000;
type Store = {
  feed?: FootballFeed; attemptedAt: number; refreshing?: Promise<FootballFeed>;
  minting: number; waiters: (() => void)[]; clients: Map<string, number[]>; confirmationCursor: number;
};
const globalStore = globalThis as typeof globalThis & { __snakeFootball?: Store };
const store: Store = globalStore.__snakeFootball ??= { attemptedAt: 0, minting: 0, waiters: [], clients: new Map(), confirmationCursor: 0 };
store.confirmationCursor ??= 0;
store.minting ??= 0;
store.waiters ??= [];
store.clients ??= new Map();

export class PlayerError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function readJSON(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000), redirect: 'error' });
  if (!response.ok) throw new Error(`ต้นทางตอบ HTTP ${response.status}`);
  return response.json();
}

async function confirmEnd(match: FootballMatch): Promise<FootballMatch> {
  try {
    const payload = await readJSON(`${FEED_ORIGIN}/match/soccer/${match.id}`) as { message?: string; results?: { matches?: { matchId?: number; liveTime?: string }[] } | null };
    // Missing results only counts as ended when the endpoint explicitly returns null.
    if (payload.results === null) return { ...match, state: 'ended' };
    // Observed end response: HTTP 200, {"message":"OK"}, with no results key.
    if (!('results' in payload) && payload.message === 'OK') return { ...match, state: 'ended' };
    const detail = payload.results?.matches?.find(item => String(item.matchId) === match.id);
    if (detail && typeof detail.liveTime === 'string' && isFinished(detail.liveTime)) return { ...match, state: 'ended', clock: detail.liveTime };
  } catch { /* Keep the current player on network errors or an ambiguous status. */ }
  return match;
}

export async function footballFeed(): Promise<FootballFeed> {
  if (store.refreshing) return store.refreshing;
  if (store.feed && Date.now() - store.attemptedAt < FEED_TTL) return store.feed;
  if (!store.feed && Date.now() - store.attemptedAt < FEED_TTL) throw new Error('กำลังรอต้นทางพร้อมให้บริการ');
  store.attemptedAt = Date.now();
  store.refreshing = (async () => {
    try {
      const incoming = parseFeed(await readJSON(`${FEED_ORIGIN}/matches-streaming-channel/soccer/live`));
      // Keep recent missing entries for confirmation; old finished entries are not an archive.
      const previous = (store.feed?.matches ?? []).filter(match => match.state !== 'ended' || match.missingChecks < 30);
      const merged = reconcileFeed(previous, incoming);
      const candidates = merged.filter(match => match.state === 'checking' && match.missingChecks >= 2);
      const offset = candidates.length ? store.confirmationCursor % candidates.length : 0;
      const toConfirm = [...candidates.slice(offset), ...candidates.slice(0, offset)].slice(0, 4);
      store.confirmationCursor += toConfirm.length;
      const confirmed = new Map((await Promise.all(toConfirm.map(confirmEnd))).map(match => [match.id, match]));
      store.feed = { matches: merged.map(match => confirmed.get(match.id) ?? match), updatedAt: Date.now(), stale: false, message: null };
    } catch {
      if (!store.feed) throw new Error('ยังเชื่อมต่อรายการสดไม่ได้ กรุณาลองใหม่');
      store.feed = { ...store.feed, stale: true, message: 'ต้นทางตอบช้าหรือข้อมูลไม่สมบูรณ์ กำลังแสดงรายการล่าสุดที่ตรวจได้' };
    }
    return store.feed;
  })();
  try { return await store.refreshing; } finally { store.refreshing = undefined; }
}

// Sliding-window limit per client so one script cannot occupy the shared mint slots.
function allowClient(client: string): boolean {
  const now = Date.now();
  const recent = (store.clients.get(client) ?? []).filter(at => now - at < CLIENT_WINDOW);
  if (recent.length >= CLIENT_MAX_OPENS) { store.clients.set(client, recent); return false; }
  recent.push(now);
  store.clients.delete(client); // re-insert → Map order stays least-recently-used first
  store.clients.set(client, recent);
  if (store.clients.size > CLIENT_TRACK_MAX) {
    for (const [key, stamps] of store.clients) {
      if (store.clients.size <= CLIENT_TRACK_MAX * 0.9) break;
      if (!stamps.length || now - stamps[stamps.length - 1] >= CLIENT_WINDOW || store.clients.size > CLIENT_TRACK_MAX) store.clients.delete(key);
    }
  }
  return true;
}

// FIFO slot for an upstream mint: busy periods wait briefly in line instead of failing.
async function acquireSlot(): Promise<void> {
  if (store.minting < MINT_CONCURRENCY) { store.minting++; return; }
  if (store.waiters.length >= MINT_QUEUE_MAX) throw new PlayerError('ผู้ชมเยอะมาก กำลังต่อคิว ระบบจะลองใหม่อัตโนมัติ', 503);
  await new Promise<void>((resolve, reject) => {
    const grant = () => { clearTimeout(timer); resolve(); };
    const timer = setTimeout(() => {
      const index = store.waiters.indexOf(grant);
      if (index >= 0) store.waiters.splice(index, 1);
      reject(new PlayerError('ผู้ชมเยอะมาก กำลังต่อคิว ระบบจะลองใหม่อัตโนมัติ', 503));
    }, MINT_QUEUE_WAIT);
    store.waiters.push(grant);
  });
}
function releaseSlot() {
  const next = store.waiters.shift();
  if (next) next(); // hand the slot straight to the next viewer in line
  else store.minting = Math.max(0, store.minting - 1);
}

/**
 * Mints a fresh player link for one live match, right when a viewer opens it. Every viewer gets their own
 * link (new uid per request); nothing is cached, so the link reaching the iframe is ~0.1 s old.
 */
export async function openPlayer(matchId: string, client: string): Promise<PlayerLink> {
  if (!/^\d{1,18}$/.test(matchId)) throw new PlayerError('รหัสคู่แข่งขันไม่ถูกต้อง', 400);
  const feed = await footballFeed();
  if (!feed.matches.some(match => match.id === matchId && match.state === 'live')) throw new PlayerError('คู่นี้ยังไม่ถ่ายทอดสดหรือจบแล้ว', 404);
  if (!allowClient(client)) throw new PlayerError('เปิดคู่ถี่เกินไป กรุณารอสักครู่', 429);
  await acquireSlot();
  try {
    const data = await readJSON(`https://askmebet.live/matches/${matchId}?uid=${randomUUID()}`) as { data?: unknown };
    return { id: matchId, url: validatePlayerUrl(data.data), mintedAt: Date.now() };
  } catch (error) {
    if (error instanceof PlayerError) throw error;
    throw new PlayerError('ยังเชื่อมต่อสัญญาณคู่นี้ไม่ได้ ระบบจะลองใหม่อัตโนมัติ', 502);
  } finally { releaseSlot(); }
}
