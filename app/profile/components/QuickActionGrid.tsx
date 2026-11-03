"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { prefersReducedMotion } from "../lib";
import { FOCUS, Icon, PRESS, Svg } from "./ui";

interface TileProps {
  label: string;
  hint: string;
  icon: ReactNode;
  tone: string; // tailwind gradient for the card
  iconTone: string; // tailwind classes for the icon box
}

const TILE =
  "flex min-h-[88px] w-full items-center gap-3 rounded-2xl border p-3 text-left " +
  "shadow-[0_10px_20px_rgba(0,0,0,0.45),inset_0_2px_2px_rgba(255,255,255,0.12),inset_0_-4px_6px_rgba(0,0,0,0.4)]";

function TileBody({ label, hint, icon, iconTone }: Omit<TileProps, "tone">) {
  return (
    <>
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(0,0,0,0.25)] ${iconTone}`}>
        <Svg size={22}>{icon}</Svg>
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-tight text-white">{label}</span>
        <span className="block truncate text-xs text-white/65">{hint}</span>
      </span>
    </>
  );
}

/** Scroll to an in-page section, respecting reduced motion. */
function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  // move focus to the section heading for keyboard / screen-reader users
  const heading = document.getElementById(`${id}-title`);
  heading?.setAttribute("tabindex", "-1");
  heading?.focus({ preventScroll: true });
}

export function QuickActionTile({ label, hint, icon, tone, iconTone, target }: TileProps & { target: string }) {
  return (
    <button type="button" onClick={() => jump(target)} className={`${TILE} ${tone} ${PRESS} ${FOCUS}`}>
      <TileBody label={label} hint={hint} icon={icon} iconTone={iconTone} />
    </button>
  );
}

export default function QuickActionGrid() {
  return (
    <nav aria-label="เมนูลัด" className="grid grid-cols-2 gap-3">
      <QuickActionTile
        target="personal"
        label="ข้อมูลส่วนตัว"
        hint="เบอร์โทร รหัสแนะนำ"
        icon={Icon.user}
        tone="border-purple-400/25 bg-linear-to-br from-purple-700/70 to-purple-950/80"
        iconTone="bg-linear-to-b from-purple-400 to-purple-600 text-white"
      />
      <QuickActionTile
        target="bank"
        label="บัญชีธนาคาร"
        hint="บัญชีรับเงิน"
        icon={Icon.card}
        tone="border-pink-400/25 bg-linear-to-br from-pink-700/65 to-pink-950/80"
        iconTone="bg-linear-to-b from-pink-400 to-pink-600 text-white"
      />
      <QuickActionTile
        target="rewards"
        label="รับรางวัล"
        hint="ยอดเสีย ค่าแนะนำ"
        icon={Icon.gift}
        tone="border-yellow-400/30 bg-linear-to-br from-yellow-700/45 to-purple-950/80"
        iconTone="bg-linear-to-b from-yellow-300 to-yellow-600 text-yellow-950"
      />
      <Link
        href="/history"
        className={`${TILE} border-violet-400/20 bg-linear-to-br from-violet-900/80 to-[#1a0b2e]/90 ${PRESS} ${FOCUS}`}
      >
        <TileBody label="ประวัติ" hint="ฝาก ถอน รายการ" icon={Icon.scroll} iconTone="bg-linear-to-b from-violet-500 to-violet-800 text-white" />
      </Link>
    </nav>
  );
}
