import 'server-only';
import { footballFeed } from './server';
import { footballProgrammes } from './schedule-server';
import { buildAlerts, trackFirstLive } from './alerts';
import type { AlertsFeed } from './alerts';
import type { FootballMatch } from './model';
import type { ScheduledMatch } from './schedule';

// Built only from the existing in-memory feeds (live: 10 s TTL, programmes: 60 s TTL), which are already
// single-flight. This adds no upstream requests of its own and never touches player links. The small result is
// memoised so any number of concurrent viewers share one computation per TTL.
const TTL = 15_000;
type Store = { feed?: AlertsFeed; builtAt: number; pending?: Promise<AlertsFeed>; firstLive: Map<string, number>; live?: FootballMatch[]; programmes?: ScheduledMatch[] };
const shared = globalThis as typeof globalThis & { __snakeAlerts?: Store };
const store: Store = shared.__snakeAlerts ??= { builtAt: 0, firstLive: new Map() };

export async function footballAlerts(): Promise<AlertsFeed> {
  if (store.pending) return store.pending;
  if (store.feed && Date.now() - store.builtAt < TTL) return store.feed;
  store.pending = (async () => {
    const [live, programmes] = await Promise.allSettled([footballFeed(), footballProgrammes()]);
    const now = Date.now();
    // On a failed refresh keep the last confirmed data so alerts don't flicker away during an upstream hiccup.
    if (live.status === 'fulfilled') { store.live = live.value.matches; trackFirstLive(store.firstLive, live.value.matches, now); }
    if (programmes.status === 'fulfilled') store.programmes = programmes.value.matches;
    if (!store.live && !store.programmes) throw new Error('Alert sources unavailable');
    const stale = live.status === 'rejected' || programmes.status === 'rejected' || (live.status === 'fulfilled' && live.value.stale);
    store.feed = { alerts: buildAlerts(store.live ?? [], store.programmes ?? [], now, store.firstLive), updatedAt: now, stale };
    store.builtAt = now;
    return store.feed;
  })();
  try { return await store.pending; } finally { store.pending = undefined; }
}
