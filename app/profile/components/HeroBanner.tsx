"use client";
import Image from "next/image";
import type { Rank, User } from "../types";
import { baht, num } from "../lib";
import { FOCUS, Icon, PRESS, RankIcon, Svg } from "./ui";
import { Crown } from "./decorations";
import ProfileArt from "./ProfileArt";
import surface from "../styles/surfaces.module.css";

// measured on design-reference/desktop-1440.png: crown body 185×144, 113px from the hero's right edge, 16px from its top
const CROWN = "art-crown absolute -bottom-3 right-2 -z-10 hidden h-auto w-[180px] sm:block lg:-bottom-[42px] lg:right-[44px] lg:w-[300px]";

interface Props {
  user: User;
  rank: Rank | null;
  onLogout: () => void;
}

/**
 * Membership card. Layers, back to front (surface layers in styles/surfaces.module.css):
 * brand gradient + light source + shade → translucent planes → corner hairline frame
 * → crown illustration (tablet+) → content.
 */
export default function HeroBanner({ user, rank, onLogout }: Props) {
  const current = rank?.current_rank;
  const next = rank?.next_rank;
  const progress = Math.min(100, Math.max(0, num(rank?.progress)));
  const atTop = !!current && !next;
  const pct = atTop ? 100 : progress;
  const ring = current?.color || "#eab308";
  const amount = next ? (
    <>
      <b className="font-semibold text-[var(--accent-gold-soft)]">฿{baht(rank?.total_deposit, 0)}</b> / ฿{baht(next.min_deposit, 0)}
    </>
  ) : atTop ? "ระดับสูงสุด" : `${pct}%`;

  return (
    // reference: 360×160 at 390px, 1314×180 at 1440px
    <header
      className={`${surface.hero} relative isolate flex min-h-[160px] items-center overflow-hidden rounded-[var(--radius-feature)] py-4 pl-[18px] pr-4 sm:p-6 lg:min-h-[180px] lg:py-4 lg:pl-[46px] lg:pr-8`}
    >

      {/* tablet+: crown on purple silk fills the right side (hidden on mobile, as in the reference) */}
      <ProfileArt
        name="crown"
        width={520}
        height={400}
        sizes="(min-width: 1024px) 216px, 180px"
        preload
        className={CROWN}
        fallback={<Crown className={`pointer-events-none ${CROWN}`} />}
      />

      {/* ghost logout: 32/36/40px visual (mobile/tablet/desktop, per reference) inside a 44px hit area */}
      <button
        type="button"
        onClick={onLogout}
        aria-label="ออกจากระบบ"
        className={`group absolute right-[10px] top-[14px] z-10 grid size-11 place-items-center rounded-xl sm:right-3 sm:top-3 lg:right-4 lg:top-[19px] ${PRESS} ${FOCUS}`}
      >
        <span className="grid size-8 place-items-center rounded-xl border border-white/25 bg-black/15 text-white/90 group-hover:bg-white/15 group-hover:text-white sm:size-9 lg:size-10">
          <Svg size={18}>{Icon.logout}</Svg>
        </span>
      </button>

      <div className="flex w-full items-center gap-8 sm:gap-6 lg:gap-9">
        {/* avatar: rank-coloured conic ring + rank badge */}
        <div className="relative shrink-0">
          <div className="rounded-full p-[3px]" style={{ background: `conic-gradient(from 210deg, ${ring}, #fde68a, ${ring}, #7c3aed, ${ring})` }}>
            <span className="block size-[66px] overflow-hidden rounded-full bg-[var(--bg-card)] ring-2 ring-black/25 lg:size-[112px]">
              <Image
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username || "game")}&backgroundColor=1b1030`}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="size-full"
              />
            </span>
          </div>
          {rank && (
            <RankIcon
              info={current}
              className="absolute -bottom-1 -right-1 size-7 text-xs drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)] lg:size-10 lg:text-base"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="pr-10">
            <h1 className="truncate text-xl font-bold leading-tight text-white sm:text-[22px] lg:text-[30px]">{user.full_name || "สมาชิกทั่วไป"}</h1>
            <p className="truncate text-sm text-white/75 lg:text-base">@{user.username}</p>
          </div>

          {rank && (
            <div className="mt-3 sm:max-w-[calc(100%-170px)] lg:mt-[22px] lg:max-w-[570px]">
              {/* tablet+: amount sits above the bar's right end; mobile: beside the bar (reference) */}
              <div className="mb-2 flex items-center justify-between gap-2 text-xs lg:text-sm">
                <span className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-full bg-black/25 px-2.5 py-0.5 font-semibold text-white">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ background: ring }} aria-hidden="true" />
                  {current?.name || "ยังไม่มีระดับ"}
                </span>
                <span className="hidden shrink-0 tabular-nums text-white/85 sm:inline">{amount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-black/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] lg:h-2.5"
                  role="progressbar"
                  aria-label="ความคืบหน้าสู่ระดับถัดไป"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                >
                  <div className="h-full rounded-full bg-[image:var(--gradient-gold)]" style={{ width: `${Math.max(pct, 2)}%` }} />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-white/85 sm:hidden">{amount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
