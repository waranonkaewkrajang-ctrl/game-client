import type { CalendarMatch } from './calendar';
import type { FootballFeed, FootballMatch } from './model';

export type MatchLink = { espnId: string; ambId: string | null; state: 'unmatched' | 'confirming' | 'linked' | 'ambiguous'; reason: string; eventKey?: string };
export type MatchLinks = { links: MatchLink[]; updatedAt: number; stale: boolean };
export type LinkObservation = { ambId: string; fingerprint: string; observations: number; observedAt: number; touchedAt: number };
export const MAX_KICKOFF_DELTA = 30 * 60_000;
const MIN_OBSERVATION_GAP = 8000;

export function normalizeTeam(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
const leagueNames: Record<string, string[]> = {
  'eng.1': ['พรีเมียร์ลีก อังกฤษ', 'English Premier League', 'England Premier League'],
  'esp.1': ['ลาลีกา สเปน', 'Spanish La Liga', 'Spain La Liga', 'LaLiga', 'LaLiga EA Sports'],
  'ita.1': ['เซเรียอา อิตาลี', 'Italian Serie A', 'Italy Serie A'],
  'ger.1': ['บุนเดสลีกา เยอรมนี', 'German Bundesliga', 'Germany Bundesliga'],
  'uefa.champions': ['ยูฟ่า แชมเปียนส์ลีก', 'UEFA Champions League'],
};
// Reviewed, league-scoped alternatives only. Never remove "United", "Real", B, II or age markers.
const teamAliases: Record<string, string[][]> = {
  'eng.1': [['Manchester United', 'Manchester Utd'], ['Newcastle United', 'Newcastle Utd'], ['Nottingham Forest', 'Nottingham Forest FC'], ['Wolverhampton Wanderers', 'Wolves'], ['Brighton & Hove Albion', 'Brighton Hove Albion']],
  'esp.1': [['Atletico Madrid', 'Atletico de Madrid'], ['Athletic Club', 'Athletic Bilbao'], ['Celta Vigo', 'Celta de Vigo']],
  'ita.1': [['Internazionale', 'Inter Milan'], ['AC Milan', 'Milan'], ['AS Roma', 'Roma']],
  'ger.1': [['Bayern Munich', 'Bayern Munchen', 'FC Bayern Munchen'], ['Borussia Monchengladbach', 'Borussia Mgladbach'], ['FC Cologne', 'FC Koln', '1 FC Koln']],
};
function leagueCode(value: string): string | undefined {
  const normalized = normalizeTeam(value);
  return Object.entries(leagueNames).find(([, names]) => names.some(name => normalizeTeam(name) === normalized))?.[0];
}
function category(name: string): string {
  const normalized = normalizeTeam(name);
  const age = normalized.match(/(?:^|\s)(?:u|under)\s?([0-9]{2})(?:\s|$)/)?.[1] ?? 'senior';
  const gender = /(?:^|\s)(?:women|woman|ladies|female|wfc)(?:\s|$)|หญิง/.test(normalized) ? 'women' : 'open';
  const reserve = /(?:^|\s)(?:reserves?|ii)(?:\s|$)|\sb$/.test(normalized) ? 'reserve' : 'first';
  return `${gender}:${age}:${reserve}`;
}
function canonical(name: string, league: string): string {
  const normalized = normalizeTeam(name);
  const reviewed = league === 'uefa.champions' ? Object.values(teamAliases).flat() : teamAliases[league];
  const alternatives = reviewed?.find(names => names.some(value => normalizeTeam(value) === normalized));
  return alternatives ? normalizeTeam(alternatives[0]) : normalized;
}
function sameTeam(first: string, second: string, league: string): boolean {
  if (!first || !second || category(first) !== category(second)) return false;
  return canonical(first, league) === canonical(second, league);
}
export function candidateMatches(event: CalendarMatch, matches: FootballMatch[]): FootballMatch[] {
  const code = event.leagueCode ?? leagueCode(event.league);
  if (!code || !event.timeConfirmed || !['ยังไม่เริ่มแข่ง', 'กำลังแข่งขัน'].includes(event.status)) return [];
  const timestamp = (value: string) => /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? Date.parse(value) : NaN;
  const start = timestamp(event.startsAt);
  if (!Number.isFinite(start)) return [];
  return matches.filter(match => {
    if (match.state !== 'live') return false;
    if (leagueCode(match.leagueEn || match.league) !== code) return false;
    const matchStart = timestamp(match.startsAt);
    if (!Number.isFinite(matchStart) || Math.abs(start - matchStart) > MAX_KICKOFF_DELTA) return false;
    return sameTeam(event.home, match.homeEn || match.home, code) && sameTeam(event.away, match.awayEn || match.away, code);
  });
}
function fingerprint(event: CalendarMatch, match: FootballMatch): string {
  return JSON.stringify([event.id, event.homeTeamId, event.awayTeamId, event.home, event.away, event.league, event.startsAt,
    match.id, match.homeEn || match.home, match.awayEn || match.away, match.leagueEn || match.league, match.startsAt]);
}
function eventKey(event: CalendarMatch): string {
  return JSON.stringify([event.id, event.homeTeamId, event.awayTeamId, event.home, event.away, event.league, event.startsAt]);
}
export function resolveCalendarLink(event: CalendarMatch | undefined, links: MatchLink[], matches: FootballMatch[]): string | undefined {
  if (!event) return undefined;
  const accepted = links.filter(link => link.espnId === event.id && link.state === 'linked' && link.ambId && link.eventKey === eventKey(event));
  if (accepted.length !== 1) return undefined;
  const candidates = candidateMatches(event, matches);
  return candidates.length === 1 && candidates[0].id === accepted[0].ambId ? candidates[0].id : undefined;
}
// Pure matching + caller-owned process memory. Repeated requests for one feed snapshot cannot confirm a link.
export function reconcileLinks(events: CalendarMatch[], feed: FootballFeed, memory: Map<string, LinkObservation>, now: number): MatchLinks {
  const eventIds = new Set(events.map(event => event.id));
  for (const [id, entry] of memory) if (!eventIds.has(id) || now - entry.touchedAt > 6 * 60 * 60_000) memory.delete(id);
  const candidates = new Map(events.map(event => [event.id, candidateMatches(event, feed.matches)]));
  const reverse = new Map<string, Set<string>>();
  for (const [id, matches] of candidates) for (const match of matches) {
    const owners = reverse.get(match.id) ?? new Set<string>(); owners.add(id); reverse.set(match.id, owners);
  }
  const links = events.map((event): MatchLink => {
    const matches = candidates.get(event.id)!;
    if (!matches.length) {
      memory.delete(event.id);
      return { espnId: event.id, ambId: null, state: 'unmatched', reason: 'no-confirmed-live-candidate' };
    }
    if (matches.length !== 1 || reverse.get(matches[0].id)!.size !== 1) {
      memory.delete(event.id);
      return { espnId: event.id, ambId: null, state: 'ambiguous', reason: 'multiple-candidates-or-owners' };
    }
    const match = matches[0], signature = fingerprint(event, match);
    const previous = memory.get(event.id);
    if (feed.stale) {
      // Never accept a new match or advance confirmation while upstream is stale.
      const linked = previous?.fingerprint === signature && previous.observations >= 2;
      return { espnId: event.id, ambId: linked ? match.id : null, state: linked ? 'linked' : 'unmatched', reason: 'upstream-stale', eventKey: linked ? eventKey(event) : undefined };
    }
    let entry = previous?.fingerprint === signature ? previous : undefined;
    if (!entry) entry = { ambId: match.id, fingerprint: signature, observations: 1, observedAt: feed.updatedAt, touchedAt: now };
    else if (feed.updatedAt - entry.observedAt >= MIN_OBSERVATION_GAP) entry = { ...entry, observations: Math.min(2, entry.observations + 1), observedAt: feed.updatedAt, touchedAt: now };
    memory.set(event.id, entry);
    const linked = entry.observations >= 2;
    return { espnId: event.id, ambId: linked ? match.id : null, state: linked ? 'linked' : 'confirming', reason: linked ? 'league-teams-kickoff-confirmed-twice' : 'awaiting-second-fresh-observation', eventKey: linked ? eventKey(event) : undefined };
  });
  return { links, updatedAt: feed.updatedAt, stale: feed.stale };
}
