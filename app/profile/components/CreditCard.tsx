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
const COINS = "art-coins absolute right-0 top-[50px] -z-10 h-auto w-[100px] @sm:right-1 @sm:w-[128px] @lg:right-[16px] @lg:top-[60px] @lg:w-[184px]";

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
  // 66px (desktop) / display size (narrow) fits up to "123,456.78"; longer balances step down so they stay on one line
  const figureSize =
    balance.length <= 10 ? "text-[length:var(--text-display)] @lg:text-[66px]" : "text-[length:clamp(22px,8.5cqi,48px)] @lg:text-[52px]";

  return (
    <section
      id="credit"
      aria-labelledby="credit-title"
      className={`${surface.credit} @container relative isolate flex flex-col overflow-hidden rounded-[var(--radius-feature)] px-4 pb-3 pt-3 sm:p-5 @lg:p-6 ${className}`}
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

      <div className="flex items-center justify-between gap-2">
        <h2 id="credit-title" className="flex items-center gap-2 text-[15px] font-semibold text-[var(--accent-gold-soft)] @lg:text-base @lg:text-[var(--text-primary)]">
          <Svg size={18} className="@lg:hidden">{Icon.coins}</Svg>
          <Svg size={20} className="hidden text-[var(--accent-gold)] @lg:block">{Icon.chart}</Svg>
          <span className="@lg:hidden">ยอดเครดิต</span>
          <span className="hidden @lg:inline">สถิติ</span>
        </h2>
        {/* promo status; tapping it goes to the setting that changes it */}
        <button type="button" onClick={() => jump("settings")} className={`-my-2 inline-flex min-h-11 shrink-0 items-center ${PRESS} ${FOCUS} rounded-full`}>
          <span
            className={`inline-flex items-center gap-0.5 rounded-full border py-0.5 pl-2.5 pr-1.5 text-xs font-semibold ${
              acceptPromo ? "border-emerald-400/25 bg-emerald-500/15 text-emerald-300" : "border-white/10 bg-white/10 text-[var(--text-secondary)]"
            }`}
          >
            {acceptPromo ? "รับโปรโมชัน" : "ไม่รับโปรโมชัน"}
            <Svg size={14}>{Icon.chevron}</Svg>
          </span>
        </button>
      </div>

      {/* balance */}
      {/* reference (1440): panel ≈70% of the card, figure ≈302px wide (66px type); the refresh control sits in the panel's corner */}
      <div className={`relative mt-1 max-w-[64%] @lg:mt-4 @lg:max-w-[70%] @lg:px-4 @lg:py-3 ${PANEL}`}>
        <p className="mb-0.5 hidden items-center gap-1.5 text-sm font-medium text-[var(--accent-gold-soft)] @lg:flex">
          <Svg size={16}>{Icon.coins}</Svg>
          ยอดเครดิต
        </p>
        <p
          className={`min-w-0 break-all font-bold leading-[1.05] tracking-tight text-[var(--accent-gold)] [text-shadow:0_2px_10px_rgba(234,179,8,0.14)] ${figureSize} @lg:leading-none`}
          aria-live="polite"
        >
          <span className="mr-0.5 align-top text-[0.55em] font-semibold">฿</span>
          {balance}
        </p>
        {/* 36px (mobile) / 32px (desktop) pill per the reference, inside a 44px-tall button (the tap target) */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className={`group mt-1 inline-flex min-h-11 items-center rounded-full disabled:opacity-60 @lg:absolute @lg:right-1.5 @lg:top-1.5 @lg:mt-0 @lg:px-1.5 ${PRESS} ${FOCUS}`}
        >
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--border-gold)] bg-black/20 px-4 text-sm font-medium text-[var(--accent-gold-soft)] group-hover:bg-black/35 @lg:min-h-8 @lg:px-3 @lg:text-xs">
            <Svg size={16} className={refreshing ? styles.spin : ""}>{Icon.refresh}</Svg>
            {refreshing ? "กำลังอัปเดต" : "อัปเดตยอด"}
          </span>
        </button>
      </div>

      {/* narrow: pushes the ledger to the bottom; wide: the stat boxes follow the panel directly */}
      <div aria-hidden="true" className="pointer-events-none min-h-3 flex-1 @lg:hidden" />

      {/* ledger: a divided row on narrow cards, two stat boxes on wide ones */}
      <div className="grid grid-cols-2 border-t border-white/[0.08] pt-1 @lg:mt-3 @lg:max-w-[70%] @lg:gap-4 @lg:border-t-0 @lg:pt-0">
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
