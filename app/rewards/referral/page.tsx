"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import styles from "./referral.module.css";

/** one referral reward from GET /rewards/history?type=referral (meta written by cashback:calculate; from_username arrives masked) */
interface RewardItem {
  id: number;
  amount: string | number;
  status: "pending" | "claimed" | "expired";
  created_at: string;
  claimed_at?: string | null;
  meta?: { date?: string; from_user_id?: number; from_username?: string; percent?: number | string; loss?: number | string } | null;
}
interface Summary {
  referral?: { pending?: number; claimed?: number; expired?: number };
  expire_days?: number;
  referral_expire_days?: number;
}
interface Friend { name: string; joined_at: string; active: boolean; earned: number }
interface FriendsData {
  count: number;
  friends: Friend[];
  terms: { percent: number; expire_days: number; min_payout: number };
}

// fixed by the backend code (cashback:calculate runs from crontab 02:00 UTC = 09:00 Thai time)
const CALC_TIME = "09:00 น.";

const TZ = "Asia/Bangkok";
const n = (v: unknown) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
const money = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dayKey = (it: RewardItem) => it.meta?.date ?? new Date(it.created_at).toLocaleDateString("en-CA", { timeZone: TZ });
const fromKey = (key: string) => new Date(`${key}T12:00:00+07:00`);
const WEEKDAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const weekdayShort = (key: string) => WEEKDAY_SHORT[new Date(`${key}T12:00:00Z`).getUTCDay()];
const weekdayLong = (key: string) => fromKey(key).toLocaleDateString("th-TH", { weekday: "long", timeZone: TZ });
const dayNum = (key: string) => fromKey(key).toLocaleDateString("th-TH", { day: "numeric", timeZone: TZ });
const dayShort = (key: string) => fromKey(key).toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: TZ });
const monthLabel = (key: string) => fromKey(key).toLocaleDateString("th-TH", { month: "long", year: "numeric", timeZone: TZ });
const dateFull = (iso: string) => new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const stamp = (iso: string) => new Date(iso).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ });

const CopyIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>
);
const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
);
const LineIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 5.9-3.5 8-5.9C21.4 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z" /></svg>
);

export default function ReferralPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<RewardItem[]>([]);
  const [friendsData, setFriendsData] = useState<FriendsData | null>(null);
  const [code, setCode] = useState("");
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState<"" | "code" | "link">("");
  const [now, setNow] = useState(() => Date.now());
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, histRes, frRes, meRes] = await Promise.all([
        api.get("/rewards/summary"),
        api.get("/rewards/history", { params: { type: "referral" } }),
        api.get("/rewards/referral/friends"),
        api.get("/auth/me"),
      ]);
      setSummary(sumRes.data.data);
      setHistory(histRes.data.data?.data || []);
      setFriendsData(frRes.data.data);
      setCode(String(meRes.data.data?.referral_code || ""));
      setLoadFailed(false);
    } catch {
      // keep what is on screen (lib/api handles 401); never show 0.00 as if it were the real amount
      setLoadFailed(true);
    }
    setNow(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    const t = setTimeout(() => { setOrigin(window.location.origin); void fetchData(); }, 0);
    return () => clearTimeout(t);
  }, [fetchData, router]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => { clearInterval(t); if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);

  const expireDays = n(summary?.referral_expire_days ?? summary?.expire_days) ?? 0;
  const expiresAt = useCallback(
    (it: RewardItem) => (expireDays > 0 ? new Date(it.created_at).getTime() + expireDays * 86_400_000 : null),
    [expireDays],
  );
  // same rule as the claim API; the server flips the status hourly
  const statusOf = useCallback(
    (it: RewardItem): RewardItem["status"] => {
      const end = expiresAt(it);
      return it.status === "pending" && end !== null && end <= now ? "expired" : it.status;
    },
    [expiresAt, now],
  );

  const terms = friendsData?.terms;
  const percent = n(terms?.percent);
  const pendingTotal = n(summary?.referral?.pending) ?? 0;
  const claimedTotal = n(summary?.referral?.claimed) ?? 0;
  const canClaim = pendingTotal > 0;
  const claimable = useMemo(() => history.filter((it) => statusOf(it) === "pending"), [history, statusOf]);

  const deadline = useMemo(() => {
    const ends = claimable.map(expiresAt).filter((v): v is number => v !== null);
    if (!ends.length) return null;
    return { end: Math.min(...ends), total: Math.max(1, expireDays * 86_400_000) };
  }, [claimable, expiresAt, expireDays]);
  const remainMs = deadline ? Math.max(0, deadline.end - now) : 0;
  const mins = Math.ceil(remainMs / 60_000);
  const days = Math.floor(mins / 1440);
  const remainText = days > 0
    ? `${days} วัน ${Math.floor((mins % 1440) / 60)} ชม.`
    : mins >= 60 ? `${Math.floor(mins / 60)} ชม. ${mins % 60} นาที` : `${mins} นาที`;

  // daily earnings: one row per calculation day, split by friend
  const days_ = useMemo(() => {
    const map = new Map<string, RewardItem[]>();
    for (const it of history) {
      const k = dayKey(it);
      map.set(k, [...(map.get(k) ?? []), it]);
    }
    return [...map.entries()].map(([key, items]) => {
      const sts = items.map(statusOf);
      const status: RewardItem["status"] = sts.includes("pending") ? "pending" : sts.every((s) => s === "expired") ? "expired" : "claimed";
      const claimedAt = items.map((i) => i.claimed_at).filter(Boolean).sort().pop() ?? null;
      return { key, items, status, claimedAt, total: items.reduce((s, i) => s + (n(i.amount) ?? 0), 0) };
    });
  }, [history, statusOf]);
  const months = useMemo(() => {
    const out: { label: string; rows: typeof days_ }[] = [];
    for (const d of days_) {
      const label = monthLabel(d.key);
      const last = out[out.length - 1];
      if (last && last.label === label) last.rows.push(d);
      else out.push({ label, rows: [d] });
    }
    return out;
  }, [days_]);

  const pendingDays = new Set(claimable.map(dayKey));
  const pendingFriends = new Set(claimable.map((i) => i.meta?.from_user_id ?? i.id));
  let fromText = canClaim ? "ค่าแนะนำที่ยังไม่ได้กดรับ" : "ยังไม่มีค่าแนะนำให้รับตอนนี้";
  if (pendingDays.size > 1) fromText = `รวมค่าแนะนำจาก ${pendingDays.size} วัน`;
  else if (pendingDays.size === 1) {
    const key = [...pendingDays][0];
    fromText = `${percent !== null ? `${percent}% ` : ""}ของยอดเสียเพื่อน ${pendingFriends.size} คน\n${weekdayLong(key)}ที่ ${dayShort(key)}`;
  }

  const link = code && origin ? `${origin}/register?ref=${code}` : "";
  const lineShare = link ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(link)}` : "";

  const copy = async (what: "code" | "link") => {
    const text = what === "code" ? code : link;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // older in-app browsers: fall back to a hidden textarea
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch { /* user can still select the text */ }
      ta.remove();
    }
    setCopied(what);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(""), 2000);
  };

  const handleClaim = async () => {
    if (claiming || !canClaim) return;
    setClaiming(true);
    setResult(null);
    try {
      const res = await api.post("/rewards/claim/referral");
      const amount = n(res.data?.data?.amount);
      const balance = n(res.data?.data?.balance);
      setResult({ ok: true, text: `รับแล้ว${amount !== null ? ` ${money(amount)} บาท` : ""}${balance !== null ? ` · ยอดในกระเป๋า ${money(balance)} บาท` : ""}` });
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setResult({ ok: false, text: message || "รับไม่สำเร็จ กรุณาลองใหม่" });
    }
    setClaiming(false);
  };

  const friends = friendsData?.friends ?? [];
  const friendCount = friendsData?.count ?? friends.length;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.topL}>
            <button type="button" className={styles.back} onClick={() => router.push("/profile")} aria-label="กลับ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <h1>แนะนำเพื่อน</h1>
          </div>
          <a href="#terms" className={styles.termsLink}>เงื่อนไข</a>
        </div>

        <div className={`${styles.col} ${styles.colA}`}>
          {loading ? (
            <div className={styles.skel} style={{ height: 250 }} aria-busy="true" aria-label="กำลังโหลด" />
          ) : loadFailed && !summary ? (
            <section className={styles.credit} role="alert">
              <div className={styles.eyebrow}>โหลดข้อมูลไม่สำเร็จ</div>
              <p className={styles.note} style={{ margin: "8px 0 16px" }}>ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p>
              <button type="button" className={styles.cta} onClick={() => { setLoading(true); void fetchData(); }}>ลองใหม่</button>
            </section>
          ) : (
            <section className={styles.credit} aria-labelledby="rf-title">
              <Image className={styles.art} src="/profile/artwork/gift-purple.webp" alt="" width={400} height={348} sizes="124px" priority unoptimized />
              <div id="rf-title" className={styles.eyebrow}>ค่าแนะนำรอรับ</div>
              <div className={`${styles.fig} ${styles.t}`}><b>{money(pendingTotal)}</b><span>บาท</span></div>
              <p className={styles.from}>{fromText}</p>
              {deadline && canClaim ? (
                <div className={styles.left}>
                  <div className={styles.leftRow}><span>รับได้อีก</span><b className={styles.t}>{remainText}</b></div>
                  <div className={styles.track} aria-hidden="true"><i style={{ width: `${Math.min(100, (remainMs / deadline.total) * 100)}%` }} /></div>
                </div>
              ) : (
                <div style={{ height: 16 }} />
              )}
              <button type="button" onClick={handleClaim} disabled={!canClaim || claiming} aria-busy={claiming} className={`${styles.cta} ${claiming ? styles.busy : ""}`}>
                {claiming ? (<><span className={styles.spin} aria-hidden="true" />กำลังโอน…</>) : canClaim ? "รับเข้ากระเป๋า" : "ยังไม่มีค่าแนะนำ"}
              </button>
              {result && (
                <p className={`${styles.msg} ${result.ok ? styles.ok : styles.err}`} role="status">
                  {result.ok && <CheckIcon size={18} />}{result.text}
                </p>
              )}
              {!canClaim && !result && (
                <p className={styles.note}>
                  {percent !== null ? `ชวนเพื่อนแล้วรับ ${percent}% ของยอดเสียเพื่อนทุกวัน` : "ชวนเพื่อนแล้วรับค่าแนะนำจากยอดเสียเพื่อนทุกวัน"}
                </p>
              )}
            </section>
          )}

          <section className={styles.block} aria-label="ชวนเพื่อน">
            <div className={styles.ticket}>
              <div className={styles.stub}>
                <div className={styles.lbl}><span>รหัสแนะนำของคุณ</span><span>เพื่อนใช้ได้ตอนสมัคร</span></div>
                <div className={styles.code}>
                  <b className={styles.t}>{code || "-"}</b>
                  <button type="button" className={styles.chip} onClick={() => copy("code")} disabled={!code}>
                    {copied === "code" ? <CheckIcon /> : <CopyIcon />}{copied === "code" ? "คัดลอกแล้ว" : "คัดลอก"}
                  </button>
                </div>
                {link && (
                  <div className={styles.link}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" style={{ flex: "none" }}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>
                    <span>{link.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                <div className={styles.share}>
                  <a className={`${styles.btn} ${styles.btnLine}`} href={lineShare || undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!lineShare}>
                    <LineIcon />ส่งทาง LINE
                  </a>
                  <button type="button" className={`${styles.btn} ${styles.btnCopy}`} onClick={() => copy("link")} disabled={!link}>
                    {copied === "link" ? <CheckIcon size={18} /> : <CopyIcon size={18} />}{copied === "link" ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
                  </button>
                </div>
                <span role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  {copied === "code" ? "คัดลอกรหัสแนะนำแล้ว" : copied === "link" ? "คัดลอกลิงก์แนะนำแล้ว" : ""}
                </span>
              </div>
              <div className={styles.perf} aria-hidden="true" />
              <div className={styles.how}>
                <h3>ได้ค่าแนะนำยังไง</h3>
                <ol className={styles.steps}>
                  <li><span>ส่งลิงก์ให้เพื่อน<small>เพื่อนกดลิงก์แล้วรหัสของคุณจะใส่ให้เองตอนสมัคร</small></span></li>
                  <li><span>เพื่อนสมัครและเล่น<small>ระบบผูกเพื่อนกับคุณถาวร</small></span></li>
                  <li><span>รับ {percent !== null ? <b>{percent}%</b> : "ค่าแนะนำ"} ของยอดเสียเพื่อนทุกวัน<small>คำนวณให้ {CALC_TIME} ของวันถัดไป</small></span></li>
                </ol>
              </div>
            </div>
          </section>

          {!loading && summary && (
            <div className={`${styles.stats} ${styles.t}`}>
              <div><small>เพื่อนทั้งหมด</small><b>{friendCount}<span>คน</span></b></div>
              <div><small>รับแล้วทั้งหมด</small><b>{money(claimedTotal)}<span>บาท</span></b></div>
            </div>
          )}
        </div>

        <div className={`${styles.col} ${styles.colB}`}>
          {!loading && summary && (
            <section className={styles.block} aria-labelledby="days-title">
              <h2 id="days-title">รายได้รายวัน <small>แยกตามเพื่อน</small></h2>
              <div className={`${styles.hist} ${styles.t}`}>
                {days_.length === 0 ? (
                  <p className={styles.empty}>ยังไม่มีค่าแนะนำ เมื่อเพื่อนเล่นเสีย ระบบจะคำนวณให้ทุกวัน {CALC_TIME}</p>
                ) : months.map((g) => (
                  <div key={g.label}>
                    <p className={styles.month}>{g.label}</p>
                    {g.rows.map((d) => (
                      <div key={d.key} className={`${styles.h} ${d.status === "expired" ? styles.exp : ""}`}>
                        <div className={styles.cal} aria-hidden="true"><small>{weekdayShort(d.key)}</small><b>{dayNum(d.key)}</b></div>
                        <div className={styles.m}>
                          จากเพื่อน {d.items.length} คน
                          <ul className={styles.who}>
                            {d.items.map((it) => (
                              <li key={it.id}><span>{it.meta?.from_username || "เพื่อน"}</span><span>{money(n(it.amount) ?? 0)}</span></li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.v}>
                          <b>{money(d.total)}</b>
                          {d.status === "claimed" && <span className={`${styles.stamp} ${styles.stOk}`}>รับแล้ว</span>}
                          {d.status === "pending" && <span className={`${styles.stamp} ${styles.stWait}`}>รอรับ</span>}
                          {d.status === "expired" && <span className={`${styles.stamp} ${styles.stExp}`}>หมดอายุ</span>}
                          {d.status === "claimed" && d.claimedAt && <span className={styles.when}>{stamp(d.claimedAt)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!loading && friendsData && (
            <section className={styles.block} aria-labelledby="fr-title">
              <h2 id="fr-title">เพื่อนของคุณ <small>{friendCount} คน</small></h2>
              <div className={`${styles.hist} ${styles.t}`}>
                {friends.length === 0 ? (
                  <div className={styles.empty}>
                    ยังไม่มีเพื่อนสมัครด้วยรหัสของคุณ
                    {lineShare && <a className={`${styles.btn} ${styles.btnLine}`} href={lineShare} target="_blank" rel="noopener noreferrer"><LineIcon />ส่งลิงก์ทาง LINE</a>}
                  </div>
                ) : friends.map((f, i) => (
                  <div key={`${f.name}-${i}`} className={`${styles.fr} ${f.active ? "" : styles.off}`}>
                    <span className={styles.av} aria-hidden="true">{f.name.replace(/\D/g, "").slice(-2) || f.name.slice(0, 1)}</span>
                    <div className={styles.m}>{f.name}<small>{f.active ? `สมัคร ${dateFull(f.joined_at)}` : "บัญชีปิดแล้ว"}</small></div>
                    <div className={styles.v}><b>{money(n(f.earned) ?? 0)}</b><small>ได้จากเพื่อนคนนี้</small></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {terms && (
            <section id="terms" className={styles.terms} aria-labelledby="terms-title">
              <h3 id="terms-title"><i aria-hidden="true">i</i>เงื่อนไขค่าแนะนำ</h3>
              <div className={styles.tiles}>
                <div className={`${styles.tile} ${styles.t1}`}>
                  <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M19 5L5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></svg></span>
                  <div><b>{percent}%</b><span>ของยอดเสีย<br />เพื่อนทุกวัน</span></div>
                </div>
                <div className={`${styles.tile} ${styles.t2}`}>
                  <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg></span>
                  <div><b>{CALC_TIME}</b><span>คำนวณให้<br />ของวันถัดไป</span></div>
                </div>
                <div className={`${styles.tile} ${styles.t3}`}>
                  <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" /></svg></span>
                  <div>
                    <b>{terms.expire_days > 0 ? `ภายใน ${terms.expire_days} วัน` : "ไม่หมดอายุ"}</b>
                    <span>{terms.expire_days > 0 ? <>ต้องกดรับ<br />ไม่งั้นหมดอายุ</> : <>กดรับได้<br />ตลอด</>}</span>
                  </div>
                </div>
                <div className={`${styles.tile} ${styles.t4}`}>
                  <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.5" /></svg></span>
                  <div><b>{terms.min_payout} บาทขึ้นไป</b><span>ต่อเพื่อน 1 คน<br />ต่อวัน</span></div>
                </div>
              </div>
              <div className={styles.formula}>
                <small>วิธีคิดค่าแนะนำ</small>
                <div className={styles.eq}>
                  <span className={styles.p}>ยอดเสียเพื่อน</span><span className={styles.o}>×</span><span className={styles.p}>{percent}%</span><span className={styles.o}>=</span><span className={styles.r}>ค่าแนะนำ</span>
                </div>
                <small>ยอดเสียเพื่อน = ยอดเดิมพัน − ยอดชนะ − โบนัสที่เพื่อนรับวันนั้น</small>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
