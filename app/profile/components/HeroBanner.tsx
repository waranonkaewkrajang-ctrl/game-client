"use client";
import Image from "next/image";
import type { Rank, User } from "../types";
import { baht, num } from "../lib";
import { avatarSrc } from "../avatars";
import { getAvatarPath } from "../utils/avatar";
import { FOCUS, Icon, PRESS, RankIcon, Svg } from "./ui";
import { Crown } from "./decorations";
import ProfileArt from "./ProfileArt";
import surface from "../styles/surfaces.module.css";

// measured on design-reference/desktop-1440.png: crown body ≈185px wide, centred ≈290px from the hero's right edge,
// ribbon running to the bottom edge. crown.webp is 800×491 (crown ≈62% of its width).
const CROWN = "art-crown absolute right-14 top-3 -z-10 hidden h-auto w-[200px] sm:block lg:right-[56px] lg:top-[12px] lg:w-[300px]";

interface Props {
  user: User;
  rank: Rank | null;
  /** chosen chibi avatar id ("01"…"18"), or null for the default */
  avatar: string | null;
  onChangeAvatar: () => void;
  onLogout: () => void;
}

/**
 * Membership card. Layers, back to front (surface layers in styles/surfaces.module.css):
 * brand gradient + light source + shade → translucent planes → corner hairline frame
 * → crown illustration (tablet+) → content.
 */
export default function HeroBanner({ user, rank, avatar, onChangeAvatar, onLogout }: Props) {
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
        width={800}
        height={491}
        sizes="(min-width: 1024px) 300px, 200px"
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
        {/* avatar: square frame + rank badge */}
        <div className="relative shrink-0">
          {/* tap the avatar to pick another one */}
          <button
            type="button"
            onClick={onChangeAvatar}
            aria-label="เปลี่ยนรูปโปรไฟล์"
            className={`group block rounded-2xl ${PRESS} ${FOCUS}`}
          >
            {/* frame A "Simple Square": 64/72/96px, 16px radius, sprite-navy behind the image while it loads */}
            <span className="block size-16 overflow-hidden rounded-2xl bg-[#0f1424] sm:size-[72px] lg:size-24">
              {/* the picked avatar, else the one auto-picked from the username; served straight from /avatars (no optimiser hop) */}
              <Image
                src={avatar ? avatarSrc(avatar) : getAvatarPath(user.username || "guest")}
                alt={`avatar ${user.full_name || user.username}`}
                width={96}
                height={96}
                preload
                unoptimized
                className="size-full object-cover"
              />

            </span>
            <span
              aria-hidden="true"
              className="absolute -bottom-1 -left-1 grid size-6 place-items-center rounded-full border border-white/30 bg-[#1b1030]/85 text-white shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:bg-[#2a1748] lg:size-8"
            >
              <Svg size={13}>{Icon.edit}</Svg>
            </span>
          </button>
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
