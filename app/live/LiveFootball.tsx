'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { chooseMatch, liveIds } from '@/lib/live-football/model';
import type { FootballFeed, FootballMatch, PlayerLink } from '@/lib/live-football/model';
import styles from './live.module.css';
import { useMonthlyCalendar } from './MonthlyFixtures';
import FixtureBrowser, { FixtureRow } from './FixtureBrowser';
import type { Fixture } from './FixtureBrowser';
import MatchPreview from './MatchPreview';
import { visibleProgrammes } from '@/lib/live-football/schedule';
import type { ScheduleFeed } from '@/lib/live-football/schedule';
import { resolveCalendarLink } from '@/lib/live-football/matching';
import type { MatchLink, MatchLinks } from '@/lib/live-football/matching';
import { STREAM_BRAND } from '@/lib/live-football/brand';

type Viewing = { id: string; url: string; match: FootballMatch };
const initialFeed: FootballFeed = { matches: [], updatedAt: 0, stale: false, message: null };
type FullscreenSection = HTMLElement & { webkitRequestFullscreen?: () => void | Promise<void> };
type FullscreenDocument = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void | Promise<void> };

export default function LiveFootball({ initialMatchId }: { initialMatchId?: string }) {
  const calendar = useMonthlyCalendar();
  const [feed, setFeed] = useState(initialFeed);
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const [started, setStarted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [expandedFallback, setExpandedFallback] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [notice, setNotice] = useState('กำลังเชื่อมต่อรายการถ่ายทอดสด');
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [checkedAt, setCheckedAt] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleFeed | null>(null);
  const [scheduleNow, setScheduleNow] = useState(0);
  const [links, setLinks] = useState<MatchLink[]>([]);
  const feedRef = useRef(initialFeed);
  const viewingRef = useRef<Viewing | null>(null);
  const autoRef = useRef(true);
  const startedRef = useRef(false);
  const linksRef = useRef<MatchLink[]>([]);
  const calendarRef = useRef(calendar.feed);
  const playerSectionRef = useRef<HTMLElement>(null);
  const expanded = fullscreen || expandedFallback;
  useEffect(() => { calendarRef.current = calendar.feed; }, [calendar.feed]);

  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function updateSchedule() {
      if (!active) return;
      if (document.visibilityState === 'hidden') { timer = setTimeout(updateSchedule, 5000); return; }
      setScheduleNow(Date.now());
      try {
        const response = await fetch('/api/live-football/schedule', { cache: 'no-store', signal: abort.signal });
        if (!response.ok) throw new Error('Schedule unavailable');
        const data: ScheduleFeed = await response.json();
        if (active) setSchedule(data);
      } catch { /* Keep the last schedule; retry silently in the background. */ }
      finally { if (active) timer = setTimeout(updateSchedule, 60_000); }
    }
    void updateSchedule();
    return () => { active = false; abort.abort(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const changed = () => setFullscreen((document.fullscreenElement || (document as FullscreenDocument).webkitFullscreenElement) === playerSectionRef.current);
    document.addEventListener('fullscreenchange', changed);
    document.addEventListener('webkitfullscreenchange', changed);
    return () => { document.removeEventListener('fullscreenchange', changed); document.removeEventListener('webkitfullscreenchange', changed); };
  }, []);

  useEffect(() => {
    if (!expandedFallback) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpandedFallback(false); };
    document.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', escape); };
  }, [expandedFallback]);

  async function leaveFullscreen() {
    try {
      if (document.fullscreenElement === playerSectionRef.current) await document.exitFullscreen();
      else if ((document as FullscreenDocument).webkitFullscreenElement === playerSectionRef.current) await (document as FullscreenDocument).webkitExitFullscreen?.();
    } catch { /* Closing the player also removes it from the fullscreen tree. */ }
    setExpandedFallback(false);
    setFullscreen(false);
  }

  async function toggleFullscreen() {
    if (expanded) { await leaveFullscreen(); return; }
    const section = playerSectionRef.current as FullscreenSection | null;
    if (!section) return;
    try {
      if (section.requestFullscreen) await section.requestFullscreen();
      else if (section.webkitRequestFullscreen) await section.webkitRequestFullscreen();
      else setExpandedFallback(true);
    } catch { setExpandedFallback(true); }
  }

  useEffect(() => {
    let active = true;
    let feedTimer: ReturnType<typeof setTimeout>;
    let linkTimer: ReturnType<typeof setTimeout>;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let opening: string | null = null; // match id whose link is being minted right now
    let retryAt = 0;
    let failures = 0;
    let needsReconnect = false; // the playing link was interrupted (offline, sleep, back-navigation)
    const abort = new AbortController();

    type OpenMode = 'open' | 'switch' | 'reconnect';
    // Upstream links die a few seconds after minting, so a link is requested only at the moment a match is
    // opened and goes straight into the iframe. A playing iframe is never reloaded (it keeps playing) —
    // except to reconnect after the connection or the device was interrupted, again with a fresh link.
    async function openMatch(match: FootballMatch, mode: OpenMode) {
      opening = match.id;
      setNotice(mode === 'reconnect' ? 'กำลังเชื่อมต่อสัญญาณใหม่ให้อัตโนมัติ' : `กำลังเชื่อมต่อสัญญาณ ${match.home} พบ ${match.away}`);
      try {
        const response = await fetch('/api/live-football/prepare', {
          method: 'POST', cache: 'no-store', signal: abort.signal,
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: match.id }),
        });
        const data = await response.json() as PlayerLink & { error?: string };
        if (!active) return;
        if (!response.ok || !data.url) throw Error(data.error || 'ยังเชื่อมต่อสัญญาณไม่ได้');
        failures = 0;
        needsReconnect = false;
        const current = feedRef.current.matches.find(item => item.id === match.id) ?? match;
        startedRef.current = true;
        setStarted(true);
        viewingRef.current = { id: match.id, url: data.url, match: current };
        setViewing(viewingRef.current);
        setFrameLoaded(false);
        setNotice(mode === 'switch' ? `เปลี่ยนคู่ให้อัตโนมัติ: ${current.home} พบ ${current.away}`
          : mode === 'reconnect' ? `เชื่อมต่อใหม่แล้ว: ${current.home} พบ ${current.away}`
          : `กำลังรับชม ${current.home} พบ ${current.away}`);
      } catch (error) {
        if (!active) return;
        failures++;
        const wait = Math.min(15_000, 2000 * failures); // 2 s, 4 s, 6 s … capped
        retryAt = Date.now() + wait;
        setNotice(!navigator.onLine
          ? 'อินเทอร์เน็ตหลุด — จะเชื่อมต่อให้อัตโนมัติเมื่อกลับมา'
          : `${error instanceof Error && error.message ? error.message : 'ยังเชื่อมต่อสัญญาณไม่ได้'} — ลองใหม่อัตโนมัติ`);
        clearTimeout(retryTimer);
        retryTimer = setTimeout(reconcile, wait);
      } finally { if (opening === match.id) opening = null; }
    }

    function reconcile() {
      if (!active || opening || Date.now() < retryAt) return;
      if (!startedRef.current) {
        const event = calendarRef.current?.matches.find(match => match.id === initialMatchId);
        const targetId = initialMatchId?.startsWith('espn:')
          ? resolveCalendarLink(event, linksRef.current, feedRef.current.matches)
          : initialMatchId;
        const chosen = feedRef.current.matches.find(match => match.id === targetId && match.state === 'live');
        if (chosen) void openMatch(chosen, 'open');
        return;
      }
      const next = chooseMatch(viewingRef.current?.id ?? null, feedRef.current.matches, liveIds(feedRef.current.matches), autoRef.current);
      if (next && next === viewingRef.current?.id) {
        // Score/feed refresh never reloads a playing iframe; only an interrupted one gets a fresh link.
        const match = needsReconnect && feedRef.current.matches.find(item => item.id === next && item.state === 'live');
        if (match) void openMatch(match, 'reconnect');
        return;
      }
      if (!next) {
        if (viewingRef.current) {
          viewingRef.current = null;
          setViewing(null);
          setFrameLoaded(false);
          setNotice(autoRef.current ? 'คู่เดิมจบแล้ว กำลังรอการแข่งขันสดคู่ถัดไป' : 'คู่เดิมจบแล้ว เลือกคู่ถัดไปได้จากรายการ');
        }
        return;
      }
      const match = feedRef.current.matches.find(item => item.id === next);
      if (match) void openMatch(match, viewingRef.current ? 'switch' : 'open');
    }

    // The player's stream cannot survive a dropped connection or a sleeping device, and its old link has
    // expired by then, so reconnect the same match with a fresh link as soon as we can.
    function interrupted() {
      if (!viewingRef.current) return;
      needsReconnect = true;
      retryAt = 0;
      failures = 0;
      clearTimeout(retryTimer);
      retryTimer = setTimeout(reconcile, 1000); // let the network settle for a moment
    }
    let wentOffline = false;
    const onOffline = () => {
      wentOffline = true;
      if (viewingRef.current) { setFrameLoaded(false); setNotice('อินเทอร์เน็ตหลุด — จะเชื่อมต่อให้อัตโนมัติเมื่อกลับมา'); }
    };
    const onOnline = () => { if (wentOffline) { wentOffline = false; interrupted(); } };
    // Back/forward cache restores the page with the old (expired) iframe link.
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) interrupted(); };
    // Sleep detection: timers stop while a computer sleeps or a phone is locked. Hidden tabs are throttled
    // to about one tick per minute, so only a gap well beyond that counts as the device having slept.
    let lastTick = Date.now();
    const wakeTimer = setInterval(() => {
      const now = Date.now();
      const gap = now - lastTick;
      lastTick = now;
      if (gap > (document.visibilityState === 'hidden' ? 150_000 : 30_000)) interrupted();
    }, 5000);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);

    async function read<T>(path: string): Promise<T> {
      const response = await fetch(path, { cache: 'no-store', signal: abort.signal });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'ต้นทางไม่พร้อมให้บริการ');
      return data;
    }
    async function updateFeed() {
      if (!active) return;
      if (document.visibilityState === 'hidden') { feedTimer = setTimeout(updateFeed, 2000); return; }
      try {
        const data = await read<FootballFeed>('/api/live-football');
        if (!active) return;
        feedRef.current = data;
        setFeed(data);
        setCheckedAt(Date.now());
        reconcile();
      } catch { /* Keep the last feed and the playing iframe; the next poll retries. */ } finally { if (active) feedTimer = setTimeout(updateFeed, 10_000); }
    }
    async function updateLinks() {
      if (!active) return;
      if (document.visibilityState === 'hidden') { linkTimer = setTimeout(updateLinks, 2000); return; }
      try {
        const data = await read<MatchLinks>('/api/live-football/links');
        if (!active) return;
        linksRef.current = data.links;
        setLinks(data.links);
        reconcile();
      } catch { /* Retain confirmed links; the resolver still validates the latest feed. */ }
      finally { if (active) linkTimer = setTimeout(updateLinks, 10_000); }
    }
    void updateFeed();
    void updateLinks();
    return () => {
      active = false; abort.abort(); clearTimeout(feedTimer); clearTimeout(linkTimer); clearTimeout(retryTimer); clearInterval(wakeTimer);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [initialMatchId]);

  const live = feed.matches.filter(match => match.state === 'live');
  const programmeNow = Math.max(scheduleNow, checkedAt);
  const endedIds = new Set(feed.matches.filter(match => match.state === 'ended').map(match => match.id));
  const upcoming = visibleProgrammes(schedule?.matches ?? [], programmeNow).filter(match => !live.some(item => item.id === match.id) && !endedIds.has(match.id));
  const bridged = new Map((calendar.feed?.matches ?? []).flatMap(event => {
    const id = resolveCalendarLink(event, links, live);
    const match = id && live.find(item => item.id === id);
    return match ? [[event.id, match] as const] : [];
  }));
  const mergedAmbIds = new Set([...bridged.values()].map(match => match.id));
  const fixtures: Fixture[] = [
    ...live.filter(match => !mergedAmbIds.has(match.id)).map(match => ({ ...match, live: true, status: match.clock || 'กำลังถ่ายทอดสด', timeConfirmed: true })),
    ...upcoming.map(match => ({ ...match, live: false, awaitingSignal: Date.parse(match.startsAt) <= programmeNow, status: Date.parse(match.startsAt) <= programmeNow ? 'รอสัญญาณถ่ายทอดสด' : 'ยังไม่เริ่มแข่ง', timeConfirmed: true })),
    ...(calendar.feed?.matches ?? []).map(event => {
      const match = bridged.get(event.id);
      return match ? { ...event, ambId: match.id, live: true, status: match.clock || 'กำลังถ่ายทอดสด' } : { ...event, live: false };
    }),
  ];
  const current = feed.matches.find(match => match.id === viewing?.id) ?? viewing?.match;
  const selected = fixtures.find(match => match.id === (viewing?.id ?? initialMatchId) || (viewing && match.ambId === viewing.id));
  const showFrame = viewing && current?.state !== 'ended';
  const player = <section ref={playerSectionRef} className={`${styles.broadcast} ${expanded ? styles.expanded : ''}`} aria-label="วิดีโอถ่ายทอดสด">
    <div className={styles.broadcastTop}><span className={styles.liveBadge}>{showFrame ? 'LIVE' : 'MATCH'}</span><span className={styles.broadcastLeague}>{selected?.league ?? 'ศูนย์รวมถ่ายทอดสด'}</span><button type="button" className={styles.fullscreenButton} onClick={toggleFullscreen} aria-pressed={expanded} aria-label={expanded ? 'ออกจากเต็มจอ' : 'ดูเต็มจอ'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={expanded ? 'M8 3v5H3m18 0h-5V3M3 16h5v5m8 0v-5h5' : 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5'} /></svg>{expanded ? 'ออกจากเต็มจอ' : 'เต็มจอ'}</button></div>
    {selected && <div className={styles.watchMatchHeader}><FixtureRow match={selected} selected /></div>}
    <div className={styles.stage}>{showFrame ? <>
      {/* No iframe fullscreen: the player's own fullscreen would leave our logo layer behind. Fullscreen goes through the button above. */}
      <iframe key={viewing.url} src={viewing.url} title={`ถ่ายทอดสด ${current?.home} พบ ${current?.away}`} allow="autoplay; picture-in-picture; encrypted-media" onLoad={() => setFrameLoaded(true)} />
      <div className={styles.streamBrandFrame} aria-hidden="true"><div className={styles.streamBrand}>
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static overlay; skip the image optimizer */}
        <img src={STREAM_BRAND.logo} alt="" decoding="async" draggable={false} />
        {STREAM_BRAND.tagline && <span>{STREAM_BRAND.tagline}</span>}
      </div></div>
    </> : <MatchPreview match={selected} loading={!calendar.feed && !feed.updatedAt} />}</div>
    {(showFrame || started) && <div className={styles.playerDetails}>{showFrame && <p>{frameLoaded ? 'เปิดเสียงได้จากตัวเล่น · ดูเต็มจอกดปุ่ม “เต็มจอ” ด้านบน' : notice}</p>}{started && <div className={styles.autoControl}><span>เล่นคู่ถัดไปอัตโนมัติ</span><button type="button" role="switch" aria-label="เปลี่ยนคู่ถัดไปอัตโนมัติ" aria-checked={autoNext} className={`${styles.switch} ${autoNext ? styles.switchOn : ''}`} onClick={() => { autoRef.current = !autoRef.current; setAutoNext(autoRef.current); }}><span /></button></div>}</div>}
  </section>;
  return <main className={`${styles.page} ${initialMatchId ? styles.watchPage : ''}`}><div className={styles.container}>
    {initialMatchId && <nav className={`${styles.breadcrumb} ${styles.watchBreadcrumb}`} aria-label="เส้นทางหน้าเว็บ"><Link href="/lobby">หน้าหลัก</Link><span>/</span><Link href="/live">ถ่ายทอดสด</Link><span>/ รับชมฟุตบอล</span></nav>}
    {!initialMatchId && <header className={styles.hero}>
      <Image className={styles.heroPhoto} src="/images/live-football/design-c-football-action.webp" alt="" fill sizes="100vw" preload unoptimized />
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.heroPanel} aria-hidden="true" />
      <div className={styles.heroInner}>
        <nav className={styles.breadcrumb} aria-label="เส้นทางหน้าเว็บ"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z" /></svg><Link href="/lobby">หน้าหลัก</Link><span>/</span><span aria-current="page">ถ่ายทอดสด</span></nav>
        <div className={styles.heroCopy}>
          <div className={styles.heroEyebrow}><span /> LIVE FOOTBALL<i aria-hidden="true" /></div>
          <h1>ถ่ายทอดสด<span>ฟุตบอล</span></h1>
          <p><span aria-hidden="true">/</span>เลือกคู่ที่ใช่ ดูสดทุกจังหวะ</p>
        </div>
        <div className={styles.heroFooter}><svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="9" width="22" height="18" rx="3" /><path d="m25 15 8-5v16l-8-5" /></svg><span>ดูบอลสดแบบเรียลไทม์</span></div>
      </div>
    </header>}
    <div className={styles.content}>
    <div className={styles.sectionBar}>{initialMatchId ? <h1 className={styles.watchTitle}>รับชมฟุตบอล</h1> : <h2 className={styles.sectionTitle}>ถ่ายทอดสด</h2>}<span className={styles.sportTag}>⚽ ฟุตบอล</span><span className={styles.liveTotal}><i /> {live.length} คู่กำลังถ่ายทอดสด</span></div>
    {initialMatchId ? <div className={styles.watchLayout}><div className={styles.watchMain}>{player}<div className={styles.watchHelp}><Link href="/live">← ดูตารางการแข่งขันทั้งหมด</Link><a href="https://lin.ee/rjOBayDx" target="_blank" rel="noopener noreferrer">ติดต่อเจ้าหน้าที่ ↗</a></div></div><aside className={styles.watchSidebar}><FixtureBrowser matches={fixtures} loading={!calendar.feed && !feed.updatedAt} compact selectedId={selected?.id} today={calendar.today} /></aside></div>
      : <><FixtureBrowser matches={fixtures} loading={!calendar.feed && !feed.updatedAt} today={calendar.today} /></>}
    </div>
  </div></main>;
}
