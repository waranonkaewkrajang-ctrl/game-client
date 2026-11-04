"use client";
import Link from "next/link";
import type { Rewards, Wallet } from "../types";
import { baht, num } from "../lib";
import { FOCUS, Icon, PRESS, Svg } from "./ui";
import { CoinStack, SparkleCluster } from "./decorations";
import { jump } from "./QuickActionGrid";
import styles from "../profile.module.css";
import ProfileArt from "./ProfileArt";
import surface from "../styles/surfaces.module.css";

// reference: coins 110×86 flush with the right edge, 50px down (390); 180×150, 18px from the right, 77px down (1440)
const COINS = "art-coins pointer-events-none absolute right-0 top-[50px] z-0 h-auto w-[100px] opacity-[0.22] @sm:w-[128px] @lg:top-[60px] @lg:w-[184px]";

interface Props {
  wallet: Wallet | null;
  rewards: Rewards | null;
  acceptPromo: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  className?: string;
}

/** Inner panel used on wide cards (@lg); on narrow cards the same elements sit flat on the card. */
const PANEL = "@lg:rounded-[var(--radius-inner)] @lg:border @lg:border-[rgba(196,150,255,0.11)] @lg:bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] @lg:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

/**
 * The money card — the only gold-bordered surface on the page.
 * Narrow (mobile/tablet column): figure → refresh → ledger row.
 * Wide (@lg, desktop): "สถิติ" header, the balance in an inner panel, two stat boxes, coins on the right.
 */
export default function CreditCard({ wallet, rewards, acceptPromo, refreshing, onRefresh, className = "" }: Props) {
  const cashback = num(rewards?.cashback?.pending);
  const balance = baht(wallet?.balance);

  return (
    <section
      id="credit"
      aria-labelledby="credit-title"
      className={`${surface.credit} @container relative isolate flex flex-col overflow-hidden rounded-[var(--radius-feature)] p-4 ${className}`}
    >
      <ProfileArt
        name="coins"
        width={480}
        height={474}
        sizes="(min-width: 1024px) 184px, 128px"
        className={COINS}
        fallback={<CoinStack className={`pointer-events-none ${COINS}`} />}
      />
      <SparkleCluster opacity={0.85} className="pointer-events-none absolute right-[118px] top-4 -z-10 size-6 text-[var(--accent-gold-soft)] @sm:right-[140px] @lg:right-[30%] @lg:top-10 @lg:size-8" />

      <div className="relative z-[1] flex items-center justify-between gap-2">
        <h2 id="credit-title" className="flex items-center gap-2 text-[15px] font-semibold text-[var(--accent-gold-soft)] @lg:text-base @lg:text-[var(--text-primary)]">
          <Svg size={18} className="@lg:hidden">{Icon.coins}</Svg>
          <Svg size={20} className="hidden text-[var(--accent-gold)] @lg:block">{Icon.chart}</Svg>
          <span className="@lg:hidden">ยอดเครดิต</span>
          <span className="hidden @lg:inline">สถิติ</span>
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={refreshing ? "กำลังอัปเดตยอด" : "อัปเดตยอด"}
          className={`group inline-flex shrink-0 items-center rounded-full disabled:opacity-60 ${PRESS} ${FOCUS}`}
        >
          <span className="inline-flex h-6 items-center gap-1 rounded-full border border-[var(--border-gold)] bg-black/20 px-2 text-xs font-medium text-[var(--accent-gold-soft)] group-hover:bg-black/35">
            <Svg size={13} className={refreshing ? styles.spin : ""}>{Icon.refresh}</Svg>
            {refreshing ? "กำลังอัปเดต" : "อัปเดตยอด"}
          </span>
        </button>
        {/* promo status; tapping it goes to the setting that changes it */}
        <button type="button" onClick={() => jump("settings")} className={`inline-flex shrink-0 items-center ${PRESS} ${FOCUS} rounded-full`}>
          <span
            className={`inline-flex h-6 items-center gap-0.5 rounded-full border pl-2 pr-1 text-xs font-semibold ${
              acceptPromo ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-300" : "border-white/10 bg-white/10 text-[var(--text-secondary)]"
            }`}
          >
            {acceptPromo ? "รับโปรโมชัน" : "ไม่รับโปรโมชัน"}
            <Svg size={14}>{Icon.chevron}</Svg>
          </span>
        </button>
        </div>
      </div>

      {/* balance */}
      {/* reference (1440): panel ≈70% of the card, figure ≈302px wide (66px type); the refresh control sits in the panel's corner */}
      <div className={`relative z-[1] mt-2 max-w-[64%] @lg:mt-4 @lg:max-w-[70%] @lg:px-4 @lg:py-3 ${PANEL}`}>
        <p className="mb-0.5 hidden items-center gap-1.5 text-sm font-medium text-[var(--accent-gold-soft)] @lg:flex">
          <Svg size={16}>{Icon.coins}</Svg>
          ยอดเครดิต
        </p>
        <p
          className={`relative z-[2] min-w-0 break-all text-[length:clamp(24px,6cqi,32px)] font-semibold leading-[1.1] tracking-tight text-[var(--accent-gold)] [text-shadow:0_2px_10px_rgba(234,179,8,0.14)]`}
          aria-live="polite"
        >
          <span className="mr-0.5 align-top text-[0.55em] font-semibold">฿</span>
          {balance}
        </p>
      </div>

      {/* narrow: pushes the ledger to the bottom; wide: the stat boxes follow the panel directly */}
      <div aria-hidden="true" className="pointer-events-none flex-1 @lg:hidden" />

      {/* ledger: a divided row on narrow cards, two stat boxes on wide ones */}
      <div className="relative z-[1] mt-3 grid grid-cols-[1fr_1fr] border-t border-solid border-[rgba(255,255,255,0.08)] pt-3 @lg:max-w-[70%] @lg:gap-4">
        <div className={`min-w-0 py-1.5 pr-3 @lg:px-4 @lg:py-3 ${PANEL}`}>
          <p className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <Svg size={14} className="shrink-0 text-[var(--accent-gold)]">{Icon.trophy}</Svg>
            <span className="truncate">คะแนนสะสม</span>
          </p>
          <p className="mt-0.5 truncate text-lg font-semibold text-[var(--text-primary)] @lg:text-xl">{num(wallet?.point_balance).toLocaleString("th-TH")}</p>
        </div>
        <Link
          href="/rewards/cashback"
          className={`${styles.lift} ${FOCUS} block min-w-0 rounded-[var(--radius-inner)] border-l border-white/[0.08] py-1.5 pl-3 @lg:px-4 @lg:py-3 ${PANEL}`}
        >
          <p className="flex items-center justify-between gap-1 text-xs text-[var(--text-secondary)]">
            <span className="flex min-w-0 items-center gap-1.5">
              <Svg size={14} className="shrink-0 text-[var(--accent-gold)]">{Icon.gift}</Svg>
              <span className="truncate">ยอดเสียรอรับ</span>
            </span>
            <Svg size={14} className="shrink-0">{Icon.chevron}</Svg>
          </p>
          <p className={`mt-0.5 truncate text-lg font-semibold @lg:text-xl ${cashback > 0 ? "text-[var(--accent-gold)]" : "text-[var(--text-primary)]"}`}>฿{baht(cashback)}</p>
        </Link>
      </div>
    </section>
  );
}
