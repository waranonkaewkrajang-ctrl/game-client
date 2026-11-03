"use client";
import Image from "next/image";
import type { Rank, RankInfo } from "../types";
import { GOLD } from "../types";
import { baht, num } from "../lib";
import { GLASS, Section } from "./ui";
import styles from "../profile.module.css";

function RankMark({ info, size, fallbackColor }: { info?: RankInfo | null; size: number; fallbackColor: string }) {
  if (info?.image_url) {
    return <Image src={info.image_url} alt="" width={size} height={size} unoptimized className="object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)]" style={{ width: size, height: size }} />;
  }
  return (
    <span
      className="grid place-items-center rounded-full text-sm font-bold text-[#09090b]"
      style={{ width: size, height: size, background: info?.color || fallbackColor }}
      aria-hidden="true"
    >
      {info?.name?.charAt(0) || "-"}
    </span>
  );
}

export default function RankProgress({ rank }: { rank: Rank | null }) {
  if (!rank?.current_rank && !rank?.next_rank) return null;
  const current = rank.current_rank;
  const next = rank.next_rank;
  const progress = Math.min(100, Math.max(0, num(rank.progress)));
  // same remaining-deposit calculation as before, floored at 0
  const remaining = Math.max(0, num(next?.min_deposit) - num(rank.total_deposit));
  const nextColor = next?.color || GOLD;

  return (
    <Section id="rank" title="ระดับสมาชิก">
      <div className={`${GLASS} p-4`}>
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <RankMark info={current} size={48} fallbackColor="#71717a" />
            <span className="max-w-[96px] truncate text-xs font-semibold text-fuchsia-100/80">{current?.name || "-"}</span>
          </div>

          <div className="flex-1">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-fuchsia-100/60">{next ? "ความคืบหน้า" : "ระดับสูงสุด"}</span>
              <span className="font-semibold tabular-nums text-[#eab308]">{next ? progress : 100}%</span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-black/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              role="progressbar"
              aria-label="ความคืบหน้าสู่ระดับถัดไป"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={next ? progress : 100}
            >
              <div
                className={styles.barFill}
                style={{
                  width: `${next ? Math.max(progress, 2) : 100}%`,
                  background: `linear-gradient(90deg, ${current?.color || "#7c3aed"}, ${nextColor})`,
                }}
              />
            </div>
          </div>

          {next && (
            <div className="flex min-w-0 flex-col items-center gap-1 text-center">
              <span className="grid place-items-center rounded-full p-1" style={{ background: `${nextColor}1f`, boxShadow: `inset 0 0 0 1px ${nextColor}55` }}>
                <RankMark info={next} size={44} fallbackColor={GOLD} />
              </span>
              <span className="max-w-[96px] truncate text-xs font-semibold" style={{ color: nextColor }}>{next.name}</span>
            </div>
          )}
        </div>

        {next && (
          <p className="mt-4 rounded-2xl bg-black/25 px-3 py-2.5 text-center text-sm text-fuchsia-100/75">
            ฝากอีก <b className="text-base font-semibold tabular-nums text-[#eab308]">฿{baht(remaining, 0)}</b> เพื่อเลื่อนเป็น{" "}
            <b className="font-semibold text-white">{next.name}</b>
          </p>
        )}
      </div>
    </Section>
  );
}
