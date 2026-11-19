"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import styles from "./cashback.module.css";

/** one reward row from GET /rewards/history (Laravel `rewards` table, meta written by cashback:calculate) */
interface RewardItem {
  id: number;
  amount: string | number;
  status: "pending" | "claimed" | "expired";
  created_at: string;
  claimed_at?: string | null;
  meta?: {
    date?: string;
    loss?: number | string;
    bet?: number | string;
    win?: number | string;
    bonus_received?: number | string;
    percent?: number | string;
  } | null;
}

interface Summary {
  cashback?: { pending?: number; claimed?: number; expired?: number };
  expire_days?: number;
}

// fixed by the backend code (CalculateCashback: cron 02:00 UTC = 09:00 Thai time, rewards under 1 baht are skipped)
const CALC_TIME = "09:00 น.";
const MIN_PAYOUT = 1;

const TZ = "Asia/Bangkok";
const n = (v: unknown) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
const money = (v: number) => v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dayKey = (it: RewardItem) => it.meta?.date ?? new Date(it.created_at).toLocaleDateString("en-CA", { timeZone: TZ });
/** "2026-11-17" read as a Thai calendar day (noon avoids any timezone edge) */
const fromKey = (key: string) => new Date(`${key}T12:00:00+07:00`);
// fixed short Thai weekday labels (ICU "short" gives full names on some browsers, too wide for the date tile)
const WEEKDAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const weekdayShort = (key: string) => WEEKDAY_SHORT[new Date(`${key}T12:00:00Z`).getUTCDay()];
const weekdayLong = (key: string) => fromKey(key).toLocaleDateString("th-TH", { weekday: "long", timeZone: TZ });
const dayNum = (key: string) => fromKey(key).toLocaleDateString("th-TH", { day: "numeric", timeZone: TZ });
const dayShort = (key: string) => fromKey(key).toLocaleDateString("th-TH", { day: "numeric", month: "short", timeZone: TZ });
const dayFull = (key: string) => fromKey(key).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const monthLabel = (key: string) => fromKey(key).toLocaleDateString("th-TH", { month: "long", year: "numeric", timeZone: TZ });
const stamp = (iso: string) => new Date(iso).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ });

const Check = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
);

export default function CashbackPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loadFailed, setLoadFailed] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, histRes] = await Promise.all([
        api.get("/rewards/summary"),
        api.get("/rewards/history", { params: { type: "cashback" } }),
      ]);
      setSummary(sumRes.data.data);
      setHistory(histRes.data.data?.data || []);
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
    const t = setTimeout(() => { void fetchData(); }, 0);
    return () => clearTimeout(t);
  }, [fetchData, router]);

  // countdown: refresh every 30 s
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const expireDays = n(summary?.expire_days) ?? 0;
  const expiresAt = useCallback(
    (it: RewardItem) => (expireDays > 0 ? new Date(it.created_at).getTime() + expireDays * 86_400_000 : null),
    [expireDays],
  );
  // same rule as the claim API (created_at >= now − expire_days); the server flips the status hourly
  const statusOf = useCallback(
    (it: RewardItem): RewardItem["status"] => {
      const end = expiresAt(it);
      return it.status === "pending" && end !== null && end <= now ? "expired" : it.status;
    },
    [expiresAt, now],
  );

  const pendingTotal = n(summary?.cashback?.pending) ?? 0;
  const claimedTotal = n(summary?.cashback?.claimed) ?? 0;
  const claimable = useMemo(() => history.filter((it) => statusOf(it) === "pending"), [history, statusOf]);
  const canClaim = pendingTotal > 0;

  // the claim window that ends first drives the countdown
  const deadline = useMemo(() => {
    const ends = claimable.map(expiresAt).filter((v): v is number => v !== null);
    if (!ends.length) return null;
    const end = Math.min(...ends);
    return { end, total: Math.max(1, expireDays * 86_400_000) };
  }, [claimable, expiresAt, expireDays]);
  const remainMs = deadline ? Math.max(0, deadline.end - now) : 0;
  const mins = Math.ceil(remainMs / 60_000);
  const remainText = mins >= 60 ? `${Math.floor(mins / 60)} ชม. ${mins % 60} นาที` : `${mins} นาที`;

  // receipt: the pending row if there is one, otherwise the latest row
  const shown = claimable[0] ?? history[0] ?? null;
  const percent = n(shown?.meta?.percent ?? history.find((it) => n(it.meta?.percent) !== null)?.meta?.percent);
  const bet = n(shown?.meta?.bet);
  const win = n(shown?.meta?.win);
  const bonus = n(shown?.meta?.bonus_received);
  const loss = n(shown?.meta?.loss);
  const split = bet !== null && bet > 0 && win !== null && loss !== null
    ? { win: (Math.max(0, win) / bet) * 100, bonus: (Math.max(0, bonus ?? 0) / bet) * 100, loss: (Math.max(0, loss) / bet) * 100 }
    : null;

  let fromText = canClaim ? "ยอดคืนที่ยังไม่ได้กดรับ" : "ยังไม่มียอดคืนให้รับตอนนี้";
  if (claimable.length > 1) fromText = `รวมยอดคืนจาก ${claimable.length} วัน`;
  else if (claimable.length === 1) {
    const key = dayKey(claimable[0]);
    fromText = `คืน${percent !== null ? ` ${percent}%` : ""} ของยอดเสีย\n${weekdayLong(key)}ที่ ${dayShort(key)}`;
  }

  const groups = useMemo(() => {
    const out: { label: string; items: RewardItem[] }[] = [];
    for (const it of history) {
      const label = monthLabel(dayKey(it));
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(it);
      else out.push({ label, items: [it] });
    }
    return out;
  }, [history]);

  const handleClaim = async () => {
    if (claiming || !canClaim) return;
    setClaiming(true);
    setResult(null);
    try {
      const res = await api.post("/rewards/claim/cashback");
      const amount = n(res.data?.data?.amount);
      const balance = n(res.data?.data?.balance);
      setResult({
        ok: true,
        text: `รับแล้ว${amount !== null ? ` ${money(amount)} บาท` : ""}${balance !== null ? ` · ยอดในกระเป๋า ${money(balance)} บาท` : ""}`,
      });
      await fetchData();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setResult({ ok: false, text: message || "รับไม่สำเร็จ กรุณาลองใหม่" });
    }
    setClaiming(false);
  };

  const shownPercent = n(shown?.meta?.percent);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.topL}>
            <button type="button" className={styles.back} onClick={() => router.push("/profile")} aria-label="กลับ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <h1>คืนยอดเสีย</h1>
          </div>
          <a href="#terms" className={styles.termsLink}>เงื่อนไข</a>
        </div>

        {loading ? (
          <div className={styles.skel} style={{ height: 250 }} aria-busy="true" aria-label="กำลังโหลด" />
        ) : loadFailed && !summary ? (
          <section className={styles.credit} role="alert">
            <div className={styles.eyebrow}>โหลดข้อมูลไม่สำเร็จ</div>
            <p className={styles.note} style={{ margin: "8px 0 16px" }}>ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง</p>
            <button type="button" className={styles.cta} onClick={() => { setLoading(true); void fetchData(); }}>ลองใหม่</button>
          </section>
        ) : (
          <section className={styles.credit} aria-labelledby="cb-title">
            <Image className={styles.coins} src="/profile/artwork/coins.webp" alt="" width={480} height={474} sizes="132px" priority unoptimized />
            <div id="cb-title" className={styles.eyebrow}>ยอดคืนรอรับ</div>
            <div className={`${styles.fig} ${styles.t}`}><b>{money(pendingTotal)}</b><span>บาท</span></div>
            <p className={styles.from} style={{ whiteSpace: "pre-line" }}>{fromText}</p>
            {deadline && canClaim ? (
              <div className={styles.left}>
                <div className={styles.leftRow}><span>รับได้อีก</span><b className={styles.t}>{remainText}</b></div>
                <div className={styles.track} aria-hidden="true"><i style={{ width: `${Math.min(100, (remainMs / deadline.total) * 100)}%` }} /></div>
              </div>
            ) : (
              <div style={{ height: 16 }} />
            )}
            <button
              type="button"
              onClick={handleClaim}
              disabled={!canClaim || claiming}
              aria-busy={claiming}
              className={`${styles.cta} ${claiming ? styles.busy : ""}`}
            >
              {claiming ? (<><span className={styles.spin} aria-hidden="true" />กำลังโอน…</>) : canClaim ? "รับเข้ากระเป๋า" : "ยังไม่มียอดคืน"}
            </button>
            {result && (
              <p className={`${styles.msg} ${result.ok ? styles.ok : styles.err}`} role="status">
                {result.ok && <Check />}
                {result.text}
              </p>
            )}
            {!canClaim && !result && <p className={styles.note}>ยอดเสียของวันนี้จะคำนวณให้พรุ่งนี้ {CALC_TIME}</p>}
          </section>
        )}

        {!loading && shown && bet !== null && (
          <section className={styles.block} aria-label="ที่มาของยอดคืน">
            <div className={`${styles.receipt} ${styles.t}`}>
              <span className={`${styles.hole} ${styles.holeL}`} /><span className={`${styles.hole} ${styles.holeR}`} />
              <div className={styles.rcTop}><b>ยอดนี้มาจาก</b><span>{weekdayLong(dayKey(shown))} {dayFull(dayKey(shown))}</span></div>
              {split && (
                <>
                  <div className={styles.split} aria-hidden="true">
                    <i className={styles.sWin} style={{ width: `${split.win}%` }} />
                    <i className={styles.sBonus} style={{ width: `${split.bonus}%` }} />
                    <i className={styles.sLoss} style={{ width: `${split.loss}%` }} />
                  </div>
                  <div className={styles.key}>
                    <span><i style={{ background: "#fecaca" }} />ชนะคืนมา</span>
                    {bonus !== null && bonus > 0 && <span><i style={{ background: "#fb923c" }} />โบนัส</span>}
                    <span><i style={{ background: "#dc2626" }} />เสียจริง</span>
                  </div>
                </>
              )}
              <div className={`${styles.ln} ${styles.bet}`}><span className={styles.op}>+</span><span>ยอดเดิมพัน</span><span>{money(bet)}</span></div>
              {win !== null && <div className={styles.ln}><span className={styles.op}>−</span><span>ยอดชนะ</span><span>{money(win)}</span></div>}
              {bonus !== null && <div className={styles.ln}><span className={styles.op}>−</span><span>โบนัสที่รับวันนั้น</span><span>{money(bonus)}</span></div>}
              {loss !== null && <div className={`${styles.ln} ${styles.net}`}><span className={styles.op}>=</span><span>ยอดเสียสุทธิ</span><span>{money(loss)}</span></div>}
              <div className={styles.payout}><span>คืน{shownPercent !== null ? ` ${shownPercent}%` : ""}</span><b>{money(n(shown.amount) ?? 0)}<small>บาท</small></b></div>
            </div>
          </section>
        )}

        {!loading && (
          <section className={styles.block} aria-labelledby="hist-title">
            <h2 id="hist-title">ประวัติ <small>รับแล้วทั้งหมด {money(claimedTotal)} บาท</small></h2>
            <div className={`${styles.hist} ${styles.t}`}>
              {history.length === 0 ? (
                <p className={styles.empty}>ยังไม่มีประวัติคืนยอดเสีย</p>
              ) : (
                groups.map((g) => (
                  <div key={g.label}>
                    <p className={styles.month}>{g.label}</p>
                    {g.items.map((it) => {
                      const key = dayKey(it);
                      const st = statusOf(it);
                      const p = n(it.meta?.percent);
                      const l = n(it.meta?.loss);
                      return (
                        <div key={it.id} className={`${styles.h} ${st === "expired" ? styles.exp : ""}`}>
                          <div className={styles.cal} aria-hidden="true"><small>{weekdayShort(key)}</small><b>{dayNum(key)}</b></div>
                          <div className={styles.m}>
                            {l !== null ? `เสีย ${money(l)}` : dayFull(key)}
                            <small>{p !== null ? `คืน ${p}%` : dayFull(key)}</small>
                          </div>
                          <div className={styles.v}>
                            <b>{money(n(it.amount) ?? 0)}</b>
                            {st === "claimed" && <span className={`${styles.stamp} ${styles.stOk}`}>รับแล้ว</span>}
                            {st === "pending" && <span className={`${styles.stamp} ${styles.stWait}`}>รอรับ</span>}
                            {st === "expired" && <span className={`${styles.stamp} ${styles.stExp}`}>หมดอายุ</span>}
                            {st === "claimed" && it.claimed_at && <span className={styles.when}>{stamp(it.claimed_at)}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* values come from the loaded summary/history — not shown until they exist, so a failed load never claims "no expiry" */}
        {summary && (
        <section id="terms" className={styles.terms} aria-labelledby="terms-title">
          <h3 id="terms-title"><i aria-hidden="true">i</i>เงื่อนไขคืนยอดเสีย</h3>
          <div className={styles.tiles}>
            <div className={`${styles.tile} ${styles.t1}`}>
              <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M19 5L5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></svg></span>
              <div><b>{percent !== null ? `${percent}%` : "ทุกวัน"}</b><span>คืนจากยอดเสีย<br />ของทุกวัน</span></div>
            </div>
            <div className={`${styles.tile} ${styles.t2}`}>
              <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg></span>
              <div><b>{CALC_TIME}</b><span>คำนวณให้<br />ของวันถัดไป</span></div>
            </div>
            <div className={`${styles.tile} ${styles.t3}`}>
              <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" /></svg></span>
              <div>
                <b>{expireDays > 0 ? `ภายใน ${expireDays} วัน` : "ไม่หมดอายุ"}</b>
                <span>{expireDays > 0 ? <>ต้องกดรับ<br />ไม่งั้นหมดอายุ</> : <>กดรับได้<br />ตลอด</>}</span>
              </div>
            </div>
            <div className={`${styles.tile} ${styles.t4}`}>
              <span className={styles.tic}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.5" /></svg></span>
              <div><b>{MIN_PAYOUT} บาทขึ้นไป</b><span>ยอดคืนต่ำกว่านี้<br />ไม่ถูกคำนวณ</span></div>
            </div>
          </div>
          <div className={styles.formula}>
            <small>วิธีคิดยอดเสีย</small>
            <div className={styles.eq}>
              <span className={styles.p}>ยอดเดิมพัน</span><span className={styles.o}>−</span><span className={styles.p}>ยอดชนะ</span><span className={styles.o}>−</span><span className={styles.p}>โบนัสวันนั้น</span><span className={styles.o}>=</span><span className={styles.r}>ยอดเสีย</span>
            </div>
          </div>
        </section>
        )}
      </div>
    </div>
  );
}
