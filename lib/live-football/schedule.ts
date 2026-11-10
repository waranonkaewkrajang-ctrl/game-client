import { parseFeed } from './model';
import type { FootballMatch } from './model';

export type ScheduledMatch = Pick<FootballMatch, 'id' | 'home' | 'away' | 'homeLogo' | 'awayLogo' | 'league' | 'startsAt'> & { ended?: boolean };
export type ScheduleFeed = { matches: ScheduledMatch[]; updatedAt: number; stale: boolean; coverage?: { leagues: number; checked: number; pending: number } };
export const AWAITING_SIGNAL_WINDOW = 6 * 60 * 60_000;
export function visibleProgrammes(matches: ScheduledMatch[], now: number): ScheduledMatch[] {
  return matches.filter(match => {
    // Only accept explicit timestamps, never interpret a timezone-less value as server local time.
    if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(match.startsAt)) return false;
    const start = Date.parse(match.startsAt);
    // Provider programme categories cross Thai midnight. Kickoff is not evidence that video exists or a match ended.
    return !match.ended && Number.isFinite(start) && start >= now - AWAITING_SIGNAL_WINDOW;
  }).sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
/** @deprecated Use visibleProgrammes. Kept for internal callers during migration. */
export const upcomingToday = visibleProgrammes;
export function parseSchedule(payload: unknown): ScheduledMatch[] {
  return parseFeed(payload).map(({ id, home, away, homeLogo, awayLogo, league, startsAt, state }) => ({ id, home, away, homeLogo, awayLogo, league, startsAt, ended: state === 'ended' }));
}
