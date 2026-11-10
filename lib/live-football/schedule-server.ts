import 'server-only';
import { footballFeed } from './server';
import { parseSchedule, visibleProgrammes } from './schedule';
import type { ScheduleFeed, ScheduledMatch } from './schedule';

const ORIGIN = 'https://api-streaming-channels.askmebet.live';
const MINUTE = 60_000;
const RETAIN_UNSEEN = 24 * 60 * MINUTE;
type Snapshot = { rows: ScheduledMatch[]; attempted: number; updated: number; failed: boolean };
type League = { id: string; en: string };
type Store = {
  version: 1; feed?: ScheduleFeed; attempted: number; pending?: Promise<ScheduleFeed>;
  sources: Map<string, Snapshot>; records: Map<string, { row: ScheduledMatch; seenAt: number }>;
  ended: Map<string, number>; leagues: League[]; leagueAttempt: number; leagueUpdated: number; leagueFailed: boolean;
};
const shared = globalThis as typeof globalThis & { __snakeProgrammes?: Store };
const store: Store = shared.__snakeProgrammes ??= {
  version: 1, attempted: 0, sources: new Map(), records: new Map(), ended: new Map(),
  leagues: [], leagueAttempt: 0, leagueUpdated: 0, leagueFailed: false,
};
async function json(path: string): Promise<unknown> {
  const response = await fetch(ORIGIN + path, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Programme source unavailable');
  return response.json();
}
function parseLeagues(payload: unknown): League[] {
  const results = (payload as { results?: unknown } | null)?.results;
  if (!Array.isArray(results) || results.length > 500) throw new Error('Invalid league catalogue');
  const leagues = new Map<string, League>();
  for (const value of results) {
    if (!value || typeof value !== 'object') throw new Error('Invalid league');
    const raw = value as Record<string, unknown>;
    if (!/^[0-9]{1,18}$/.test(String(raw.id)) || typeof raw.en !== 'string' || !raw.en.trim() || raw.en.length > 180) throw new Error('Invalid league');
    leagues.set(String(raw.id), { id: String(raw.id), en: raw.en.trim() });
  }
  return [...leagues.values()];
}
async function catalogue(now: number) {
  if (store.leagueAttempt && now - store.leagueAttempt < 5 * MINUTE) return;
  store.leagueAttempt = now;
  try {
    store.leagues = parseLeagues(await json('/leagues-sort-streaming-channel/soccer'));
    store.leagueUpdated = now; store.leagueFailed = false;
  } catch { store.leagueFailed = true; }
}
async function source(key: string, path: string, ttl: number, now: number) {
  const previous = store.sources.get(key);
  if (previous && now - previous.attempted < ttl) return;
  try {
    const rows = parseSchedule(await json(path));
    store.sources.set(key, { rows, attempted: now, updated: now, failed: false });
    // Stamp observations only on a successful upstream response, not each cached page request.
    for (const row of rows) {
      if (row.ended) { store.ended.set(row.id, now); store.records.delete(row.id); }
      else store.records.set(row.id, { row, seenAt: now });
    }
  } catch { store.sources.set(key, { rows: previous?.rows ?? [], attempted: now, updated: previous?.updated ?? 0, failed: true }); }
}
function response(now: number): ScheduleFeed {
  const feed = store.feed!;
  return { ...feed, matches: visibleProgrammes(feed.matches, now) };
}
export async function footballProgrammes(): Promise<ScheduleFeed> {
  if (store.pending) return store.pending;
  const now = Date.now();
  if (store.feed && now - store.attempted < MINUTE) return response(now);
  if (!store.feed && store.attempted && now - store.attempted < MINUTE) throw new Error('Programme sources unavailable');
  store.attempted = now;
  store.pending = (async () => {
    await Promise.all([
      catalogue(now),
      source('today', '/matches-streaming-channel/soccer/today', MINUTE, now),
      source('early', '/matches-streaming-channel/soccer/early', 5 * MINUTE, now),
    ]);
    // Refresh oldest/unseen leagues first, eight per cycle, maximum two requests concurrently.
    // A large catalogue rotates across cycles instead of creating unbounded fan-out or dropping the tail forever.
    const due = store.leagues.filter(league => {
      const snapshot = store.sources.get(`league:${league.id}`);
      return !snapshot || now - snapshot.attempted >= 3 * MINUTE;
    }).sort((a, b) => (store.sources.get(`league:${a.id}`)?.attempted ?? 0) - (store.sources.get(`league:${b.id}`)?.attempted ?? 0)).slice(0, 8);
    for (let i = 0; i < due.length; i += 2) await Promise.all(due.slice(i, i + 2).map(league => source(
      `league:${league.id}`, `/search-channel/soccer?search=${encodeURIComponent(league.en)}`, 3 * MINUTE, now,
    )));
    let liveIds = new Set<string>();
    try {
      const live = await footballFeed();
      liveIds = new Set(live.matches.filter(match => match.state === 'live').map(match => match.id));
      for (const match of live.matches) if (match.state === 'ended') store.ended.set(match.id, now);
    } catch { /* Metadata collection remains independent of the live API's availability. */ }
    for (const [id, endedAt] of store.ended) if (now - endedAt > RETAIN_UNSEEN) store.ended.delete(id);
    for (const [id, entry] of store.records) {
      if (store.ended.has(id) || now - entry.seenAt > RETAIN_UNSEEN || !visibleProgrammes([entry.row], now).length) store.records.delete(id);
    }
    const activeKeys = ['today', 'early', ...store.leagues.map(league => `league:${league.id}`)];
    const checked = store.leagues.filter(league => !!store.sources.get(`league:${league.id}`)?.updated).length;
    const anySuccess = activeKeys.some(key => !!store.sources.get(key)?.updated);
    if (!anySuccess && !store.feed) throw new Error('Programme sources unavailable');
    const stale = store.leagueFailed || activeKeys.some(key => !store.sources.get(key)?.updated || store.sources.get(key)?.failed);
    const matches = [...store.records.values()].map(entry => entry.row).filter(row => !liveIds.has(row.id));
    store.feed = { matches: visibleProgrammes(matches, now), updatedAt: now, stale,
      coverage: { leagues: store.leagues.length, checked, pending: store.leagues.length - checked } };
    return response(now);
  })();
  try { return await store.pending; } finally { store.pending = undefined; }
}
