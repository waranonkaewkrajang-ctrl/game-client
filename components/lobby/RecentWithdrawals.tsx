"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { WithdrawalItem } from "./recentWithdrawals.demo";
import { ReceiptDialog, ReceiptThumb } from "./WithdrawalReceipt";
import { STATUS_LABEL, demoReference, formatWithdrawalAmount } from "./withdrawalFormat";
import styles from "./RecentWithdrawals.module.css";

interface RecentWithdrawalsProps {
  items: WithdrawalItem[];
  /** true only when `items` comes from a genuine feed (sets data-demo on the section otherwise) */
  live?: boolean;
  /** rows shown at once */
  visible?: number;
  /** ms between steps (one row per step) */
  interval?: number;
}

const SLIDE_MS = 600; // keep in sync with .shifting transition in the CSS module

/**
 * "Recent withdrawals" panel — presentation only; the data source is passed in.
 * Shows `visible` rows; every `interval` ms the list slides up by one row and the next entry comes in at the bottom.
 * Rotation pauses while the tab is hidden or the panel is hovered/focused; with reduced motion the rows swap without sliding.
 */
export default function RecentWithdrawals({ items, live = false, visible = 5, interval = 5000 }: RecentWithdrawalsProps) {
  const [start, setStart] = useState(0);
  const [shifting, setShifting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [held, setHeld] = useState(false);
  // open sample receipt: only the entry id + its DEMO reference; the item itself is read from `items`,
  // so the receipt always shows the same data object as the row
  const [receipt, setReceipt] = useState<{ id: string; reference: string } | null>(null);
  const receiptItem = receipt ? items.find((w) => w.id === receipt.id) : undefined;
  const rotates = items.length > visible;

  // warm the cache with every distinct avatar once (18 × ~1.5 KB), so rows inserted by the rotation never appear blank
  useEffect(() => {
    for (const src of new Set(items.map((w) => w.avatar))) {
      const img = new window.Image();
      img.src = src;
    }
  }, [items]);

  useEffect(() => {
    const sync = () => setHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (!rotates || hidden || held) return;
    let slideTimer: number | undefined;
    const tick = window.setInterval(() => {
      const advance = () => { slideTimer = undefined; setStart((s) => (s + 1) % items.length); setShifting(false); };
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { advance(); return; }
      setShifting(true);
      slideTimer = window.setTimeout(advance, SLIDE_MS);
    }, interval);
    return () => {
      window.clearInterval(tick);
      if (slideTimer !== undefined) {
        // finish a slide that was cut short so the track never stays offset
        window.clearTimeout(slideTimer);
        setStart((s) => (s + 1) % items.length);
        setShifting(false);
      }
    };
  }, [rotates, hidden, held, interval, items.length]);

  // visible rows + the next one waiting below the viewport (it slides up into place)
  const count = Math.min(items.length, rotates ? visible + 1 : visible);
  const rows = Array.from({ length: count }, (_, k) => items[(start + k) % items.length]);

  return (
    <section
      className={styles.panel}
      aria-labelledby="recent-withdrawals-heading"
      data-demo={live ? undefined : "true"}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <header className={styles.head}>
        <span className={styles.wallet} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 7V5.5A1.5 1.5 0 0 0 16.5 4h-11A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5v-8A2.5 2.5 0 0 0 18.5 7H5.5A2.5 2.5 0 0 1 3 4.5" />
            <path d="M21 11h-3.5a2 2 0 0 0 0 4H21" />
          </svg>
        </span>
        <span className={styles.headDivider} aria-hidden="true" />
        <div className={styles.headText}>
          <h2 id="recent-withdrawals-heading" className={styles.title}>ยอดถอนล่าสุด</h2>
          <p className={styles.subtitle}>รายการถอนเงินของสมาชิก</p>
        </div>
        <p className={styles.indicator}>
          <span className={styles.dot} aria-hidden="true" />
          อัปเดตอัตโนมัติ
        </p>
      </header>

      <div className={styles.viewport} style={{ ["--rw-rows" as string]: Math.min(items.length, visible) }}>
        <ul className={`${styles.list} ${shifting ? styles.shifting : ""}`}>
          {rows.map((w, k) => (
            <li key={w.id} className={styles.row} aria-hidden={k >= visible || undefined}>
              {/* eager: the waiting row sits clipped under overflow:hidden, where lazy images never start loading (~1.5 KB each) */}
              <Image src={w.avatar} alt="" width={56} height={56} unoptimized loading="eager" className={styles.avatar} />
              <div className={styles.member}>
                <span className={styles.name}>{w.maskedDisplayName}</span>
                <span className={styles.time}>{w.relativeTime}</span>
              </div>
              <span className={styles.rowDivider} aria-hidden="true" />
              <ReceiptThumb
                item={w}
                className={styles.slip}
                tabIndex={k >= visible ? -1 : undefined}
                onOpen={() => setReceipt({ id: w.id, reference: demoReference(w.id) })}
              />
              <span className={styles.amount}>{formatWithdrawalAmount(w.amount)}</span>
              <span className={`${styles.status} ${w.status === "success" ? styles.statusSuccess : styles.statusPending}`}>
                <span className={styles.check} aria-hidden="true">
                  {w.status === "success" ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4.2 8.3 2.4 2.4 5.2-5.3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M8 4.5V8l2.2 1.6" />
                    </svg>
                  )}
                </span>
                {STATUS_LABEL[w.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {receipt && receiptItem && (
        <ReceiptDialog item={receiptItem} reference={receipt.reference} onClose={() => setReceipt(null)} />
      )}
    </section>
  );
}
