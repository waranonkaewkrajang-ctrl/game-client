"use client";
import Image from "next/image";
import type { Rank, User } from "../types";
import { GOLD } from "../types";
import { baht, num } from "../lib";
import { FOCUS, Icon, PRESS, Svg } from "./ui";
import styles from "../profile.module.css";

interface Props {
  user: User;
  rank: Rank | null;
  onLogout: () => void;
}

export default function HeroBanner({ user, rank, onLogout }: Props) {
  const current = rank?.current_rank;
  const next = rank?.next_rank;
  const ringColor = current?.color || "#a855f7";
  const progress = Math.min(100, Math.max(0, num(rank?.progress)));
  const atTop = !!current && !next;

  return (
    <header
      className={
        "relative overflow-hidden rounded-3xl border border-pink-400/25 bg-linear-to-br from-purple-900/80 via-fuchsia-800/70 to-pink-900/80 p-4 pb-5 backdrop-blur-xl " +
        "shadow-[0_16px_32px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-6px_14px_rgba(0,0,0,0.35),inset_0_0_40px_rgba(236,72,153,0.18)]"
      }
    >
      <span className={styles.sheen} aria-hidden="true" />

      <button
        type="button"
        onClick={onLogout}
        aria-label="ออกจากระบบ"
        className={`absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-2xl text-fuchsia-100/80 hover:bg-black/25 hover:text-white ${PRESS} ${FOCUS}`}
      >
        <Svg size={20}>{Icon.logout}</Svg>
      </button>

      <div className="relative flex items-center gap-4 pr-10">
        {/* avatar with rank-colour conic ring + rank emblem */}
        <div className="relative shrink-0">
          <div
            className="grid size-[76px] place-items-center rounded-full p-[3px]"
            style={{ background: `conic-gradient(${ringColor}, #9333ea, #ec4899, ${ringColor})` }}
          >
            <div className="grid size-full place-items-center overflow-hidden rounded-full bg-[#09090b]">
              <Image
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username || "game")}&backgroundColor=09090b`}
                alt=""
                width={58}
                height={58}
                unoptimized
                className="size-[58px]"
              />
            </div>
          </div>
          {current?.image_url && (
            <Image
              src={current.image_url}
              alt={current.name || ""}
              width={30}
              height={30}
              unoptimized
              className="absolute -bottom-1 -right-1 size-[30px] object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
            />
          )}
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold leading-tight text-white">{user.full_name || "สมาชิกทั่วไป"}</h1>
          <p className="truncate text-sm text-fuchsia-100/70">@{user.username}</p>
          <span
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{ borderColor: `${current?.color || GOLD}66`, background: `${current?.color || GOLD}22`, color: current?.color || GOLD }}
          >
            <span className="size-1.5 rounded-full" style={{ background: current?.color || GOLD }} aria-hidden="true" />
            Level {current?.name || "-"}
          </span>
        </div>
      </div>

      {/* XP bar */}
      {rank && (
        <div className="relative mt-4">
          <div className="mb-1.5 flex items-baseline justify-between gap-2 text-xs">
            <span className="text-fuchsia-100/75">
              {next ? (
                <>
                  <span className="font-semibold text-[#eab308]">฿{baht(rank.total_deposit, 0)}</span>
                  {" / "}฿{baht(next.min_deposit, 0)}
                </>
              ) : atTop ? "ถึงระดับสูงสุดแล้ว" : "ยอดฝากสะสม"}
            </span>
            <span className="font-semibold text-[#eab308] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{atTop ? 100 : progress}%</span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-black/45 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            role="progressbar"
            aria-label="ความคืบหน้าระดับ"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={atTop ? 100 : progress}
          >
            <div
              className={`${styles.barFill} bg-linear-to-r from-[#eab308] to-pink-500`}
              style={{ width: `${atTop ? 100 : Math.max(progress, 2)}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
