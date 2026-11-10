import 'server-only';
import { calendarDay, calendarLeagues, parseCalendar } from './calendar';
import type { CalendarFeed } from './calendar';
type Store = { feed?: CalendarFeed; attempted: number; pending?: Promise<CalendarFeed> };
const globalCache = globalThis as typeof globalThis & { __snakeCalendar?: Store };
const store = globalCache.__snakeCalendar ??= { attempted: 0 };
export async function footballCalendar(): Promise<CalendarFeed> {
  if (store.pending) return store.pending;
  const month = calendarDay(Date.now()).slice(0, 7);
  if (store.feed?.month === month && Date.now() - store.attempted < 15 * 60_000) return store.feed;
  if (!store.feed && Date.now() - store.attempted < 60_000) throw new Error('Retry later');
  store.attempted = Date.now();
  store.pending = (async () => {
    const results = await Promise.allSettled(Object.entries(calendarLeagues).map(async ([code, label]) => {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${code}/scoreboard?dates=${month.replace('-', '')}&limit=1000`, {
        cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(label);
      return parseCalendar(await response.json(), label, month);
    }));
    const unavailable = Object.values(calendarLeagues).filter((_, index) => results[index].status === 'rejected');
    if (unavailable.length === results.length) {
      if (store.feed?.month === month) return store.feed = { ...store.feed, unavailable };
      throw new Error('Calendar unavailable');
    }
    const matches = results.flatMap(result => result.status === 'fulfilled' ? result.value : [])
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
    store.feed = { month, matches, updatedAt: Date.now(), unavailable };
    return store.feed;
  })();
  try { return await store.pending; } finally { store.pending = undefined; }
}
