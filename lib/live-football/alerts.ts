// Pure rules for football bell alerts. Shared by the server (building the feed) and tests.
import type { FootballMatch } from './model';
import type { ScheduledMatch } from './schedule';

export const SOON_LEAD = 15 * 60_000;    // "about to kick off" appears 15 minutes before kickoff
export const SOON_GRACE = 10 * 60_000;   // …and stays a little past kickoff in case the live signal starts late
export const LIVE_WINDOW = 45 * 60_000;  // "just started" stays for the first ~half, then expires
export const MAX_ALERTS = 50;

export type FootballAlert = {
  id: string;            // provider match id (same id the /live/watch/[id] page uses)
  kind: 'soon' | 'live';
  home: string;
  away: string;
  league: string;
  homeLogo: string | null;
  awayLogo: string | null;
  startsAt: string;
  at: number;
  expiresAt: number;
};
export type AlertsFeed = { alerts: FootballAlert[]; updatedAt: number; stale: boolean };

/** Kickoff only from explicit-timezone timestamps (same rule as the programme list). */
export function kickoffTime(value: string): number | null {
  if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

/**
 * Keep the earliest moment each match was confirmed live; forget matches no longer live.
 * Used when the provider's kickoff time is missing or in the future.
 */
export function trackFirstLive(firstLive: Map<string, number>, matches: FootballMatch[], now: number): void {
  const live = new Set(matches.filter(match => match.state === 'live').map(match => match.id));
  for (const id of live) if (!firstLive.has(id)) firstLive.set(id, now);
  for (const id of firstLive.keys()) if (!live.has(id)) firstLive.delete(id);
}

/**
 * One alert per match: "live" only for matches the live API confirms as live (state 'live', never 'checking'
 * or 'ended'); otherwise "soon" for programmes kicking off within SOON_LEAD. A live alert replaces the soon one.
 */
export function buildAlerts(live: FootballMatch[], programmes: ScheduledMatch[], now: number, firstLive: Map<string, number>): FootballAlert[] {
  const alerts = new Map<string, FootballAlert>();
  for (const match of live) {
    if (match.state !== 'live' || alerts.has(match.id)) continue;
    const start = kickoffTime(match.startsAt);
    const at = start !== null && start <= now ? start : firstLive.get(match.id) ?? now;
    if (now - at >= LIVE_WINDOW) continue; // live for a while already — not "just started"
    alerts.set(match.id, { id: match.id, kind: 'live', home: match.home, away: match.away, league: match.league, homeLogo: match.homeLogo, awayLogo: match.awayLogo, startsAt: match.startsAt, at, expiresAt: at + LIVE_WINDOW });
  }
  const ended = new Set(live.filter(match => match.state === 'ended').map(match => match.id));
  for (const match of programmes) {
    if (match.ended || ended.has(match.id) || alerts.has(match.id)) continue;
    const start = kickoffTime(match.startsAt);
    if (start === null || now < start - SOON_LEAD || now >= start + SOON_GRACE) continue;
    alerts.set(match.id, { id: match.id, kind: 'soon', home: match.home, away: match.away, league: match.league, homeLogo: match.homeLogo, awayLogo: match.awayLogo, startsAt: match.startsAt, at: start - SOON_LEAD, expiresAt: start + SOON_GRACE });
  }
  return [...alerts.values()].sort((a, b) => b.at - a.at || a.id.localeCompare(b.id)).slice(0, MAX_ALERTS);
}

/** Team crests only from the provider's https logo host (same allow-list as the live feed parser). */
export function teamLogo(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 500) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'cmbi.laner220.com' ? url.href : null;
  } catch { return null; }
}

/** Validate an alerts payload from the network/localStorage; drops malformed rows instead of throwing. */
export function parseAlerts(payload: unknown): AlertsFeed | null {
  if (!payload || typeof payload !== 'object') return null;
  const value = payload as Record<string, unknown>;
  if (!Array.isArray(value.alerts) || typeof value.updatedAt !== 'number') return null;
  const alerts: FootballAlert[] = [];
  for (const raw of value.alerts.slice(0, MAX_ALERTS)) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const str = (key: string) => (typeof row[key] === 'string' ? (row[key] as string).slice(0, 180) : '');
    if (!/^\d{1,18}$/.test(str('id')) || (row.kind !== 'soon' && row.kind !== 'live')) continue;
    if (typeof row.at !== 'number' || typeof row.expiresAt !== 'number' || !Number.isFinite(row.at) || !Number.isFinite(row.expiresAt)) continue;
    alerts.push({ id: str('id'), kind: row.kind, home: str('home'), away: str('away'), league: str('league'), homeLogo: teamLogo(row.homeLogo), awayLogo: teamLogo(row.awayLogo), startsAt: str('startsAt'), at: row.at, expiresAt: row.expiresAt });
  }
  return { alerts, updatedAt: value.updatedAt, stale: value.stale === true };
}
