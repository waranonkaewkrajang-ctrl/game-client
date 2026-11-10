'use client';
import { useEffect, useState } from 'react';
import { kickoff, TeamMark } from './FixtureBrowser';
import type { Fixture } from './FixtureBrowser';
import styles from './live.module.css';
export default function MatchPreview({ match, loading }: { match: Fixture | undefined; loading: boolean }) {
  const [now, setNow] = useState(0);
  useEffect(() => { const tick = () => setNow(Date.now()); tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer); }, []);
  const remaining = match && match.timeConfirmed && match.status === 'ยังไม่เริ่มแข่ง' ? Math.max(0, Math.ceil((Date.parse(match.startsAt) - now) / 1000)) : 0;
  const countdown = [['วัน', Math.floor(remaining / 86400)], ['ชั่วโมง', Math.floor(remaining / 3600) % 24], ['นาที', Math.floor(remaining / 60) % 60], ['วินาที', remaining % 60]];
  return <div className={styles.previewStage}>
    <div className={styles.pitch} aria-hidden="true"><span /></div>
    <span className={styles.previewLabel}>MATCH CENTRE</span>
    {match ? <><div className={styles.previewTeams}><div><TeamMark name={match.home} src={match.homeLogo} /><strong>{match.home}</strong></div><span>VS</span><div><TeamMark name={match.away} src={match.awayLogo} /><strong>{match.away}</strong></div></div>
      {now > 0 && remaining > 0 ? <><p>เริ่มแข่งขันใน</p><div className={styles.countdown}>{countdown.map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div></> : <p>{match.live ? 'กำลังเชื่อมต่อสัญญาณถ่ายทอดสด' : match.status === 'ยังไม่เริ่มแข่ง' ? 'ยังไม่มีสัญญาณถ่ายทอดสดสำหรับคู่นี้' : match.status}</p>}
      <span className={styles.previewDate}>{Number.isFinite(Date.parse(match.startsAt)) ? new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(match.startsAt)) : ''} · {kickoff(match)} น.</span>
    </> : <div className={styles.previewMissing}><h2>{loading ? 'กำลังตรวจสอบคู่แข่งขัน' : 'ไม่พบคู่นี้ในรายการล่าสุด'}</h2><p>หากคู่ถูกนำออกจากรายการ เลือกคู่อื่นจากตารางด้านข้างได้</p></div>}
  </div>;
}
