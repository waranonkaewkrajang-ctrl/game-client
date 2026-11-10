'use client';
import { useState } from 'react';
import Link from 'next/link';
import { calendarDay } from '@/lib/live-football/calendar';
import styles from './live.module.css';

export type Fixture = { id: string; ambId?: string; awaitingSignal?: boolean; home: string; away: string; homeLogo: string | null; awayLogo: string | null; league: string; startsAt: string; status: string; live: boolean; timeConfirmed: boolean };
export function TeamMark({ name, src }: { name: string; src: string | null }) {
  const [failed, setFailed] = useState(false);
  return <span className={styles.teamMark}>{src && !failed
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={src} alt="" width={40} height={40} loading="lazy" onError={() => setFailed(true)} /> : name.slice(0, 1)}</span>;
}
export const watchPath = (id: string) => `/live/watch/${encodeURIComponent(id.replace('espn:', 'espn-'))}`;
function LeagueMark({ league }: { league: string }) {
  const [failed, setFailed] = useState(false);
  const marks: Record<string, { src: string; label: string }> = {
    'พรีเมียร์ลีก อังกฤษ': { src: '/images/league-flags/england.svg', label: 'อังกฤษ' },
    'ลาลีกา สเปน': { src: '/images/league-flags/spain.svg', label: 'สเปน' },
    'เซเรียอา อิตาลี': { src: '/images/league-flags/italy.svg', label: 'อิตาลี' },
    'บุนเดสลีกา เยอรมนี': { src: '/images/league-flags/germany.svg', label: 'เยอรมนี' },
    'ยูฟ่า แชมเปียนส์ลีก': { src: 'https://a.espncdn.com/i/leaguelogos/soccer/500-dark/2.png', label: 'ยูฟ่า แชมเปียนส์ลีก' },
  };
  const mark = marks[league];
  return <span className={styles.leagueMark}>{mark && !failed
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={mark.src} alt={mark.label} width={24} height={18} loading="lazy" onError={() => setFailed(true)} />
    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M8 3h8v5a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 12v6m-4 3h8l-1-3H9l-1 3Z" /></svg>}</span>;
}
export function kickoff(match: Fixture) {
  return match.timeConfirmed && Number.isFinite(Date.parse(match.startsAt))
    ? new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(match.startsAt)) : 'รอเวลา';
}
export function FixtureRow({ match, selected = false }: { match: Fixture; selected?: boolean }) {
  const pending = !match.live && match.status === 'ยังไม่เริ่มแข่ง';
  return <article className={`${styles.fixtureRow} ${selected ? styles.selected : ''}`} aria-label={`${match.home} พบ ${match.away}`}>
    <div className={styles.homeTeam}><strong>{match.home}</strong><TeamMark key={match.homeLogo ?? match.home} name={match.home} src={match.homeLogo} /></div>
    <div className={styles.matchTime}><time dateTime={match.startsAt || undefined}>{kickoff(match)}</time>{match.live ? <img src="/icons/live-badge-b-animated.webp" alt="LIVE" width={76} height={24} className={styles.liveBadgeImg} /> : <span>VS</span>}</div>
    <div className={styles.awayTeam}><TeamMark key={match.awayLogo ?? match.away} name={match.away} src={match.awayLogo} /><strong>{match.away}</strong></div>
        <div className={styles.rowAction}>{!pending && <span>{match.status}</span>}<div className={styles.actionLinks}><Link href={watchPath(match.id)} prefetch={false} className={`${styles.watchLink} ${styles.watchLinkLive}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m16 10 6-3v10l-6-3z" /><circle cx="7" cy="12" r="1.3" fill="#ef4444" stroke="none" /></svg>{match.live ? 'ดูถ่ายทอดสด' : 'ดูสดตอนนี้'}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg></Link><Link href="/lobby#sport" prefetch={false} className={`${styles.sportsLink} ${styles.sportsLinkAttention}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#f5c451" stroke="#ad8c55" strokeWidth="1" /><circle cx="12" cy="12" r="7" fill="none" stroke="#c99a3a" strokeWidth=".8" /><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7a4a10" fontFamily="system-ui, sans-serif">฿</text></svg><span>เดิมพันตอนนี้</span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg></Link></div></div>    {pending && <span className={styles.pendingStatus}>{match.status}{pending && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 4h.01" /></svg>}</span>}
  </article>;
}
export default function FixtureBrowser({ matches, loading, compact = false, selectedId, today }: { matches: Fixture[]; loading: boolean; compact?: boolean; selectedId?: string; today: string }) {
  const [sort, setSort] = useState('time');
  const [onlyLive, setOnlyLive] = useState(false);
  const filtered = matches.filter(match => (!onlyLive || match.live)
    && (match.live || match.awaitingSignal || (Number.isFinite(Date.parse(match.startsAt)) && calendarDay(new Date(match.startsAt)) >= today)))
    .sort((a, b) => Number(b.live) - Number(a.live) || (sort === 'league' ? a.league.localeCompare(b.league, 'th') : 0) || Date.parse(a.startsAt) - Date.parse(b.startsAt));
  // Preserve chronological order when sorting by time; only adjacent rows share a heading.
  const groups: { key: string; title: string; date: string; matches: Fixture[] }[] = [];
  for (const match of filtered) {
    const date = Number.isFinite(Date.parse(match.startsAt)) ? calendarDay(new Date(match.startsAt)) : '';
    const key = `${match.league}:${date}:${match.live}`;
    if (groups.at(-1)?.key === key) groups.at(-1)!.matches.push(match);
    else groups.push({ key, title: match.league, date, matches: [match] });
  }
  return <section id={compact ? undefined : 'football-fixtures'} className={compact ? styles.compactBrowser : styles.fixtureBrowser} aria-label={compact ? 'เลือกคู่อื่น' : 'ตารางฟุตบอล'}>
    <div className={styles.browserTop}><h2>{compact ? 'เลือกคู่อื่น' : 'ตารางการแข่งขัน'}</h2><span>{filtered.length} คู่</span></div>
    <div className={styles.toolbar}>
      <div className={styles.sortButtons} role="group" aria-label="เรียงรายการ"><button type="button" aria-pressed={sort === 'time'} onClick={() => setSort('time')}>เรียงเวลา</button><button type="button" aria-pressed={sort === 'league'} onClick={() => setSort('league')}>เรียงลีก</button></div>
      <button type="button" className={styles.liveFilter} aria-pressed={onlyLive} onClick={() => setOnlyLive(!onlyLive)}>● กำลังถ่ายทอดสด</button>
    </div>
    <div className={styles.fixtureGroups}>{groups.map((group, i) => <section key={`${group.key}:${i}`}><div className={styles.leagueHeading}><div className={styles.leagueTitle}><LeagueMark key={group.title} league={group.title} /><h3>{group.title}</h3></div><time className={styles.fixtureDate} dateTime={group.date || undefined}>{group.date ? group.date.split('-').reverse().join(' / ') : 'สด'}</time></div><div className={styles.fixtureRows}>{group.matches.map(match => <FixtureRow key={match.id} match={match} selected={selectedId === match.id} />)}</div></section>)}</div>
    {!filtered.length && <div className={styles.empty}><span>⚽</span><h3>{loading ? 'กำลังโหลดรายการแข่งขัน' : onlyLive ? 'ยังไม่มีคู่ที่กำลังถ่ายทอดสด' : 'ยังไม่มีโปรแกรมแข่งขันถัดไป'}</h3><p>รายการจะอัปเดตอัตโนมัติเมื่อมีข้อมูลใหม่</p></div>}
  </section>;
}
