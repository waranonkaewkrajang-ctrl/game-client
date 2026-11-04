"use client";
import Link from "next/link";
import type { Rewards, User } from "../types";
import { baht, num } from "../lib";
import { CopyButton, FOCUS, GOLD_BTN, Icon, PRESS, Svg } from "./ui";
import { GiftBox } from "./decorations";
import surface from "../styles/surfaces.module.css";

/** Referral card: purple → magenta with light streaks, gift illustration on the right (replaces the i.ibb.co image). */
export default function ReferCard({ user, rewards, className = "" }: { user: User; rewards: Rewards | null; className?: string }) {
  const pending = num(rewards?.referral?.pending);

  return (
    <section
      id="refer"
      aria-labelledby="refer-title"
      className={`${surface.refer} relative isolate overflow-hidden rounded-[var(--radius-card)] p-4 sm:p-5 lg:flex lg:flex-col lg:justify-center ${className}`}
    >
      <GiftBox className="pointer-events-none absolute -right-1 top-2 -z-10 h-auto w-[104px] sm:w-[136px] lg:right-6 lg:top-1/2 lg:w-[196px] lg:-translate-y-1/2" />

      <div className="pr-24 sm:pr-32 lg:pr-56">
        <h2 id="refer-title" className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)] sm:text-lg">
          <Svg size={20} className="text-[var(--accent-gold)]">{Icon.users}</Svg>
          ชวนเพื่อน รับค่าคอม
        </h2>
        <p className="mt-1 text-sm text-white/75">แชร์รหัสแนะนำให้เพื่อนสมัคร แล้วรับค่าคอมมิชชันจากยอดเล่นของเพื่อนทุกวัน</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 lg:mt-5 lg:pr-56">
        <span className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-white/10 bg-black/30 pl-4 pr-0.5">
          <span className="text-xs text-[var(--text-secondary)]">รหัส</span>
          <b className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">{user.referral_code || "-"}</b>
          <CopyButton value={user.referral_code} label="รหัสแนะนำเพื่อน" />
        </span>
        <span className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-black/30 px-4 text-sm">
          <span className="text-xs text-[var(--text-secondary)]">รอรับ</span>
          <b className={`font-semibold tabular-nums ${pending > 0 ? "text-[var(--accent-gold)]" : "text-[var(--text-primary)]"}`}>฿{baht(pending)}</b>
        </span>
        <Link href="/rewards/referral" className={`${GOLD_BTN} ${PRESS} ${FOCUS} bg-[image:var(--gradient-gold)] shadow-[0_4px_12px_rgba(234,179,8,0.25)] sm:ml-auto lg:ml-2`}>
          ดูรายละเอียด
        </Link>
      </div>
    </section>
  );
}
