import 'server-only';
import { randomUUID } from 'node:crypto';
import { parseFeed, reconcileFeed, isFinished, validatePlayerUrl } from './model';
import type { FootballFeed, FootballMatch, PreparedPlayer, Preparation } from './model';

const FEED_ORIGIN = 'https://api-streaming-channels.askmebet.live';
const FEED_TTL = 10_000;
const PLAYER_TTL = 90_000; // Our refresh policy, NOT a claimed upstream token expiry.
const SESSION_IDLE = 15 * 60_000;
type Session = { touched: number; lastAttempt: number; players: Map<string, PreparedPlayer>; pending?: Promise<void> };
type Store = {
  feed?: FootballFeed; attemptedAt: number; refreshing?: Promise<FootballFeed>;
  sessions: Map<string, Session>; minting: number; confirmationCursor: number;
};
const globalStore = globalThis as typeof globalThis & { __snakeFootball?: Store };
const store: Store = globalStore.__snakeFootball ??= { attemptedAt: 0, sessions: new Map(), minting: 0, confirmationCursor: 0 };
store.confirmationCursor ??= 0;

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

export function viewerSession(candidate?: string): { id: string; session: Session } {
  const now = Date.now();
  for (const [id, session] of store.sessions) if (now - session.touched > SESSION_IDLE && !session.pending) store.sessions.delete(id);
  let id = candidate && store.sessions.has(candidate) ? candidate : randomUUID();
  let session = store.sessions.get(id);
  if (!session) {
    if (store.sessions.size >= 200) throw new Error('คิวเตรียมสัญญาณเต็ม กรุณารอสักครู่');
    id = randomUUID();
    session = { touched: now, lastAttempt: 0, players: new Map() };
    store.sessions.set(id, session);
  }
  session.touched = now;
  return { id, session };
}

async function mint(match: FootballMatch, session: Session) {
  if (store.minting >= 4) return;
  store.minting++;
  try {
    const data = await readJSON(`https://askmebet.live/matches/${match.id}?uid=${randomUUID()}`) as { data?: unknown };
    const url = validatePlayerUrl(data.data);
    session.players.set(match.id, { id: match.id, url, state: 'ready', expiresAt: Date.now() + PLAYER_TTL });
  } catch {
    const existing = session.players.get(match.id);
    if (!existing?.url || existing.expiresAt <= Date.now()) session.players.set(match.id, { id: match.id, url: null, state: 'error', expiresAt: Date.now() + 30_000 });
  } finally { store.minting--; }
}

// Called by the page's background loop, never by its match-click handler.
// Work is bounded: two concurrent mints, four matches per batch, four globally.
export async function preparePlayers(session: Session): Promise<Preparation> {
  const feed = await footballFeed();
  const live = feed.matches.filter(match => match.state === 'live');
  const liveIds = new Set(live.map(match => match.id));
  for (const id of session.players.keys()) if (!liveIds.has(id)) session.players.delete(id);
  if (!feed.stale && !session.pending && Date.now() - session.lastAttempt >= 4000) {
    session.lastAttempt = Date.now();
    const queued = live.filter(match => {
      const player = session.players.get(match.id);
      return !player || player.expiresAt <= Date.now() + (player.state === 'error' ? 0 : 20_000);
    }).sort((a, b) => {
      const first = session.players.get(a.id), second = session.players.get(b.id);
      if (!first) return second ? -1 : 0;
      if (!second) return 1;
      return first.expiresAt - second.expiresAt;
    }).slice(0, 4);
    if (queued.length) {
      session.pending = (async () => {
        for (let i = 0; i < queued.length; i += 2) await Promise.all(queued.slice(i, i + 2).map(match => mint(match, session)));
      })();
      try { await session.pending; } finally { session.pending = undefined; }
    }
  } else if (session.pending) await session.pending;
  const players = live.map(match => session.players.get(match.id) ?? { id: match.id, state: 'waiting' as const, url: null, expiresAt: 0 });
  return { players, pending: players.filter(player => player.state !== 'ready' || player.expiresAt <= Date.now()).length };
}
