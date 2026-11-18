"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarFeed, CalendarMatch } from "@/lib/live-football/calendar";
import styles from "@/app/landing.module.css";

/** fixtures only (teams, logos, Thai kick-off time, status) — no scores, no video */
const LEAGUES = [
  { code: "all", label: "ทั้งหมด" },
  { code: "eng.1", label: "พรีเมียร์ลีก" },
  { code: "esp.1", label: "ลาลีกา" },
  { code: "ita.1", label: "เซเรียอา" },
  { code: "ger.1", label: "บุนเดสลีกา" },
  { code: "uefa.champions", label: "UCL" },
] as const;
type LeagueCode = (typeof LEAGUES)[number]["code"];

const REFRESH_MS = 5 * 60_000;
const LIVE_WINDOW_MS = 2.5 * 3600_000;
const PER_VIEW = 8;

const dayFmt = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hour12: false });

function upcoming(matches: CalendarMatch[], now: number) {
  return matches.filter((m) => {
    if (m.status === "จบการแข่งขัน" || m.status.startsWith("เลื่อน")) return false;
    return Date.parse(m.startsAt) > now - LIVE_WINDOW_MS;
  });
}

function relative(startsAt: string, now: number, status: string) {
  if (status === "กำลังแข่งขัน") return { text: "กำลังแข่ง", live: true };
  const diff = Date.parse(startsAt) - now;
  if (diff <= 0) return { text: "ถึงเวลาเตะ", live: false };
  const h = Math.floor(diff / 3600_000);
  if (h >= 24) return { text: `อีก ${Math.floor(h / 24)} วัน`, live: false };
  if (h >= 1) return { text: `อีก ${h} ชม.`, live: false };
  return { text: `อีก ${Math.max(1, Math.round(diff / 60_000))} นาที`, live: false };
}

function Crest({ src, name }: { src: string | null; name: string }) {
  if (!src) return <span className={styles.crestFallback} aria-hidden="true">{name.slice(0, 1)}</span>;
  // eslint-disable-next-line @next/next/no-img-element -- remote crest from ESPN CDN (optimizer is local-only by config)
  return <img src={src} alt="" width={36} height={36} loading="lazy" decoding="async" className={styles.crest} />;
}

export default function LeagueFixtures({ initial }: { initial: CalendarFeed | null }) {
  const [feed, setFeed] = useState(initial);
  const [league, setLeague] = useState<LeagueCode>("all");
  // `now` only exists after mount so server HTML and first client render match
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = () => alive && setNow(Date.now());
    const load = () =>
      fetch("/api/live-football/calendar", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: CalendarFeed | null) => { if (alive && data?.matches) setFeed(data); })
        .catch(() => {});
    tick();
    if (!initial) load();
    const clock = setInterval(tick, 30_000);
    const refresh = setInterval(load, REFRESH_MS);
    return () => { alive = false; clearInterval(clock); clearInterval(refresh); };
  }, [initial]);

  const list = useMemo(() => {
    if (!feed) return [];
    const ref = now ?? feed.updatedAt;
    const base = upcoming(feed.matches, ref);
    return (league === "all" ? base : base.filter((m) => m.leagueCode === league)).slice(0, PER_VIEW);
  }, [feed, league, now]);

  const counts = useMemo(() => {
    const ref = now ?? feed?.updatedAt ?? 0;
    const base = feed ? upcoming(feed.matches, ref) : [];
    return Object.fromEntries(LEAGUES.map((l) => [l.code, l.code === "all" ? base.length : base.filter((m) => m.leagueCode === l.code).length]));
  }, [feed, now]);

  return (
    <div className={styles.fixtures}>
      <div className={styles.fixtureTabs} role="tablist" aria-label="เลือกลีก">
        {LEAGUES.map((l) => (
          <button key={l.code} type="button" role="tab" aria-selected={league === l.code} onClick={() => setLeague(l.code)}>
            {l.label}
            <span>{counts[l.code] ?? 0}</span>
          </button>
        ))}
      </div>

      {!feed ? (
        <p className={styles.fixtureEmpty}>กำลังโหลดโปรแกรมการแข่งขัน…</p>
      ) : list.length === 0 ? (
        <p className={styles.fixtureEmpty}>ยังไม่มีคู่ที่กำลังจะแข่งในเดือนนี้สำหรับลีกที่เลือก</p>
      ) : (
        <ol className={styles.fixtureList} role="tabpanel">
          {list.map((m, i) => {
            const day = dayFmt.format(Date.parse(m.startsAt));
            const header = i === 0 || dayFmt.format(Date.parse(list[i - 1].startsAt)) !== day ? day : null;
            const rel = now ? relative(m.startsAt, now, m.status) : null;
            return (
              <li key={m.id}>
                {header && <p className={styles.fixtureDay}>{header}</p>}
                <div className={`${styles.fixtureRow} ${rel?.live ? styles.fixtureLive : ""}`}>
                  <span className={styles.fixtureLeague}>{m.league}</span>
                  <span className={styles.team}><span>{m.home}</span><Crest src={m.homeLogo} name={m.home} /></span>
                  <span className={styles.kickoff}>
                    <strong>{m.timeConfirmed ? timeFmt.format(Date.parse(m.startsAt)) : "รอเวลา"}</strong>
                    <small>{rel ? rel.text : "เวลาไทย"}</small>
                  </span>
                  <span className={`${styles.team} ${styles.away}`}><Crest src={m.awayLogo} name={m.away} /><span>{m.away}</span></span>
                </div>
              </li>
            );
          })}
        </ol>
      )}

    </div>
  );
}
