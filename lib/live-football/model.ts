export type MatchState = 'live' | 'checking' | 'ended';
export type FootballMatch = {
  id: string;
  home: string;
  away: string;
  league: string;
  homeLogo: string | null;
  awayLogo: string | null;
  startsAt: string;
  clock: string;
  score: { home: number | null; away: number | null };
  state: MatchState;
  missingChecks: number;
  homeEn?: string;
  awayEn?: string;
  leagueEn?: string;
};
export type FootballFeed = {
  matches: FootballMatch[];
  updatedAt: number;
  stale: boolean;
  message: string | null;
};
/** A freshly minted upstream player link. It must be loaded right away — upstream rejects it after a few seconds. */
export type PlayerLink = {
  id: string;
  url: string;
  mintedAt: number;
};

type ObjectValue = Record<string, unknown>;
function object(value: unknown): ObjectValue {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ObjectValue : {};
}
function text(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 180) : '';
}
function name(value: unknown): string {
  const item = object(value);
  return text(item.th) || text(item.en) || 'ไม่ระบุชื่อ';
}
function logo(value: unknown): string | null {
  try {
    const url = new URL(text(object(value).flagUrl));
    return url.protocol === 'https:' && url.hostname === 'cmbi.laner220.com' ? url.href : null;
  } catch { return null; }
}
function score(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
export function isFinished(clock: string): boolean {
  return /^(FT|AET|PEN(?:ALTIES)? ENDED|FINISHED|ENDED|FULL TIME|จบการแข่งขัน)$/i.test(clock.trim());
}

// Reject malformed feeds instead of interpreting an upstream error as "all matches ended".
export function parseFeed(payload: unknown): FootballMatch[] {
  const groups = object(payload).results;
  if (!Array.isArray(groups)) throw new Error('รูปแบบข้อมูลคู่สดเปลี่ยนไป');
  const result = new Map<string, FootballMatch>();
  for (const value of groups) {
    const group = object(value);
    if (!Array.isArray(group.matches)) throw new Error('ข้อมูลคู่สดไม่ครบ');
    for (const raw of group.matches) {
      const match = object(raw);
      const id = String(match.matchId ?? '');
      if (!/^\d{1,18}$/.test(id)) throw new Error('รหัสคู่แข่งขันไม่ถูกต้อง');
      const clock = text(match.liveTime);
      const scores = object(match.score);
      result.set(id, {
        id, home: name(match.home), away: name(match.away),
        league: name(group.leagueName), homeLogo: logo(match.home), awayLogo: logo(match.away),
        startsAt: text(match.startTime), clock,
        homeEn: text(object(match.home).en), awayEn: text(object(match.away).en), leagueEn: text(object(group.leagueName).en),
        score: { home: score(scores.home), away: score(scores.away) },
        state: isFinished(clock) ? 'ended' : 'live', missingChecks: 0,
      });
    }
  }
  if (result.size > 500) throw new Error('รายการมากเกินขอบเขตที่รองรับ');
  return [...result.values()];
}

export function reconcileFeed(previous: FootballMatch[], incoming: FootballMatch[]): FootballMatch[] {
  const next = new Map(incoming.map(match => [match.id, match]));
  for (const match of previous) {
    if (!next.has(match.id)) next.set(match.id, {
      ...match, state: match.state === 'ended' ? 'ended' : 'checking',
      missingChecks: match.missingChecks + 1,
    });
  }
  return [...next.values()];
}

export function liveIds(matches: FootballMatch[]): Set<string> {
  return new Set(matches.filter(match => match.state === 'live').map(match => match.id));
}

// Keep the playing match while it is live (or only briefly missing); after it ends, optionally move to the
// first live match in `ready` (every live match can be opened — links are minted on demand).
export function chooseMatch(currentId: string | null, matches: FootballMatch[], ready: Set<string>, autoNext: boolean): string | null {
  const current = matches.find(match => match.id === currentId);
  if (currentId && !current) return currentId;
  if (current && current.state !== 'ended') return current.id;
  if (!autoNext) return null;
  return matches.find(match => match.state === 'live' && ready.has(match.id))?.id ?? null;
}

export function validatePlayerUrl(value: unknown): string {
  if (typeof value !== 'string') throw new Error('ยังไม่มีลิงก์ตัวเล่น');
  const url = new URL(value);
  if (url.protocol !== 'https:' || !['www.87333378.com', '87333378.com'].includes(url.hostname) || !url.pathname.startsWith('/livetv/') || url.username || url.password || url.port) {
    throw new Error('ผู้ให้บริการเปลี่ยนรูปแบบตัวเล่น ต้องตรวจสอบก่อน');
  }
  return url.href;
}
