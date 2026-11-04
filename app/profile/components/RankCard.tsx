"use client";
import type { Rank } from "../types";
import { GOLD } from "../types";
import { baht, num } from "../lib";
import { Icon, RankIcon, Svg } from "./ui";
import { Medallion } from "./decorations";
import ProfileArt from "./ProfileArt";
import surface from "../styles/surfaces.module.css";
import type { CSSProperties } from "react";

/**
 * Membership rank (Next Rank + Tier merged).
 * Narrow: centred medallion → name → bar → current→next path → remaining.
 * Wide (@sm, card content ≥ 384px): medallion beside name + amount inside a lit panel, then the bar with its % and the remaining line.
 * The emblem comes from rank.image_url (colour-circle fallback); the medallion frame is tinted from the rank colour.
 */
export default function RankCard({ rank, className = "" }: { rank: Rank | null; className?: string }) {
  const current = rank?.current_rank;
  const next = rank?.next_rank;
  const progress = Math.min(100, Math.max(0, num(rank?.progress)));
  const atTop = !!current && !next;
  const pct = atTop ? 100 : progress;
  // same remaining-deposit calculation as before, floored at 0
  const remaining = Math.max(0, num(next?.min_deposit) - num(rank?.total_deposit));
  const tone = current?.color || "#c0c4cc";
  const deposit = `฿${baht(rank?.total_deposit, 0)}`;

  return (
    <section
      id="rank"
      aria-labelledby="rank-title"
      className={`${surface.rank} @container relative isolate flex flex-col overflow-hidden rounded-[var(--radius-card)] p-4 sm:p-5 lg:p-6 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="rank-title" className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Svg size={20} className="text-[var(--accent-gold)]">{Icon.trophy}</Svg>
          ระดับสมาชิก
        </h2>
        {(current || next) && <span className="text-sm font-semibold tabular-nums text-[var(--accent-gold)] @sm:hidden">{pct}%</span>}
      </div>

      {!current && !next ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <span className="grid size-16 place-items-center rounded-full border border-dashed border-white/15 text-[var(--text-muted)]">
            <Svg size={28}>{Icon.trophy}</Svg>
          </span>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">ยังไม่มีข้อมูลระดับ ฝากเงินครั้งแรกเพื่อเริ่มสะสมระดับ</p>
        </div>
      ) : (
        <>
          {/* showcase */}
          <div
            // reference (1440): medal ≈160px, disc centred ≈150px from the card edge; text column starts 270px in; % at the panel's lower right
            className={`${surface.rankShowcase} relative isolate mt-0 flex flex-col @sm:mt-5 items-center overflow-hidden @sm:flex-row @sm:gap-10 @sm:rounded-[var(--radius-inner)] @sm:px-10`}
            style={{ "--rank-tone": tone } as CSSProperties}
          >
            <div className="relative aspect-square w-[120px] shrink-0 @sm:w-[150px]">
              {/* laurel behind the frame, wider than it so the leaves frame the sides (reference) */}
              <ProfileArt
                name="laurel-wreath"
                width={400}
                height={367}
                sizes="200px"
                className="absolute -left-[6%] -top-[2%] h-auto w-[112%] max-w-none @sm:-left-[17%] @sm:top-0 @sm:w-[134%]"
                fallback={null}
              />
              {/* the exported frame is silver; the SVG fallback is tinted from the rank colour */}
              <ProfileArt
                name="medal-silver"
                width={320}
                height={320}
                sizes="150px"
                className="absolute inset-0 size-full"
                fallback={<Medallion tone={tone} className="absolute inset-0 size-full" />}
              />
              <div className="absolute inset-[24%] grid place-items-center">
                <RankIcon info={current} fallbackColor="#c0c4cc" className="size-full text-[26px] @sm:text-[32px]" />
              </div>
            </div>
            <p className="absolute bottom-2 right-3 hidden text-sm font-semibold tabular-nums text-[var(--accent-gold)] @sm:block">{pct}%</p>
            <div className="mt-1 min-w-0 text-center @sm:mt-0 @sm:text-left">
              <p className="truncate text-2xl font-bold leading-tight text-[var(--text-primary)] @sm:text-[32px]">{current?.name || "ยังไม่มีระดับ"}</p>
              <p className="text-sm text-[var(--text-secondary)] @sm:mt-1">
                ยอดฝากสะสม<span className="@sm:hidden"> {deposit}</span>
              </p>
              <p className="hidden text-2xl font-semibold tabular-nums text-[var(--text-primary)] @sm:block">{deposit}</p>
            </div>
          </div>

          {/* progress */}
          <div className="mt-3 @sm:mt-1">
            <div
              className="h-2.5 overflow-hidden rounded-full bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
              role="progressbar"
              aria-label="ความคืบหน้าสู่ระดับถัดไป"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
            >
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#6d28d9,#a855f7_70%,#d8b4fe)]" style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
          </div>

          {/* current → next (narrow cards; the wide layout says it in the sentence below) */}
          {next && (
            <div className="mt-3 flex items-center justify-center gap-2 @sm:hidden">
              <span className="flex min-w-0 items-center gap-1.5">
                <RankIcon info={current} fallbackColor="#c0c4cc" className="size-6 text-xs" />
                <span className="truncate text-sm font-medium text-[var(--text-secondary)]">{current?.name || "-"}</span>
              </span>
              <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true" className="shrink-0 text-[var(--accent-gold)]">
                <path d="M1 6h22M18 1.5 23.5 6 18 10.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex min-w-0 items-center gap-1.5">
                <RankIcon info={next} fallbackColor={GOLD} className="size-6 text-xs" />
                <span className="truncate text-sm font-semibold" style={{ color: next.color || GOLD }}>{next.name}</span>
              </span>
            </div>
          )}

          <div aria-hidden="true" className="flex-1" />
          {next ? (
            <p className="mt-3 text-center text-sm text-[var(--text-secondary)] @sm:mt-3 @sm:text-base">
              ฝากอีก <b className="text-base font-semibold tabular-nums text-[var(--accent-gold)]">฿{baht(remaining, 0)}</b> เพื่อเลื่อนเป็น{" "}
              <b className="font-semibold text-[var(--accent-gold)]">{next.name}</b>
            </p>
          ) : (
            <p className="mt-3 text-center text-sm font-medium text-[var(--accent-gold)]">คุณอยู่ระดับสูงสุดแล้ว</p>
          )}
        </>
      )}
    </section>
  );
}
