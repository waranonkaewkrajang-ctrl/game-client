export type CalendarMatch = {
  id: string; home: string; away: string; homeLogo: string | null; awayLogo: string | null;
  league: string; startsAt: string; day: string; status: string; timeConfirmed: boolean;
  homeTeamId?: string; awayTeamId?: string; leagueCode?: string;
};
export type CalendarFeed = { month: string; matches: CalendarMatch[]; updatedAt: number; unavailable: string[] };
export const calendarLeagues = {
  'eng.1': 'พรีเมียร์ลีก อังกฤษ', 'esp.1': 'ลาลีกา สเปน', 'ita.1': 'เซเรียอา อิตาลี',
  'ger.1': 'บุนเดสลีกา เยอรมนี', 'uefa.champions': 'ยูฟ่า แชมเปียนส์ลีก',
} as const;
const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' });
export function calendarDay(value: number | Date): string { return dateFormat.format(value); }
function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function text(value: unknown): string { return typeof value === 'string' ? value.slice(0, 180) : ''; }
function badge(value: unknown): string | null {
  try { const url = new URL(text(value)); return url.protocol === 'https:' && url.hostname === 'a.espncdn.com' && !url.username && !url.password && !url.port ? url.href : null; } catch { return null; }
}
export function parseCalendar(payload: unknown, league: string, month: string): CalendarMatch[] {
  const events = record(payload).events;
  if (!Array.isArray(events) || events.length > 2000) throw new Error('Invalid calendar');
  return events.flatMap(raw => {
    const event = record(raw), competitions = event.competitions;
    const competition = record(Array.isArray(competitions) ? competitions[0] : null);
    const teams = competition.competitors;
    if (!Array.isArray(teams) || !/^\d{1,18}$/.test(String(event.id))) return [];
    const home = record(record(teams.find(t => record(t).homeAway === 'home')).team);
    const away = record(record(teams.find(t => record(t).homeAway === 'away')).team);
    const startsAt = text(event.date), stamp = Date.parse(startsAt);
    if (!/(?:Z|[+-]\d{2}:\d{2})$/i.test(startsAt) || !Number.isFinite(stamp) || !text(home.displayName) || !text(away.displayName)) return [];
    const day = calendarDay(stamp);
    if (!day.startsWith(month + '-')) return [];
    const type = record(record(competition.status ?? event.status).type);
    const state = text(type.state), statusName = text(type.name);
    const status = /POSTPONED|CANCELED|CANCELLED|SUSPENDED/.test(statusName) ? 'เลื่อน / ระงับการแข่งขัน'
      : type.completed === true || state === 'post' ? 'จบการแข่งขัน' : state === 'in' ? 'กำลังแข่งขัน' : 'ยังไม่เริ่มแข่ง';
    return [{ id: `espn:${String(event.id)}`, home: text(home.displayName), away: text(away.displayName),
      homeTeamId: /^[0-9]+$/.test(String(home.id)) ? String(home.id) : undefined, awayTeamId: /^[0-9]+$/.test(String(away.id)) ? String(away.id) : undefined, leagueCode: Object.entries(calendarLeagues).find(([, title]) => title === league)?.[0],
      homeLogo: badge(home.logo), awayLogo: badge(away.logo), league, startsAt, day, status, timeConfirmed: competition.timeValid === true }];
  });
}
