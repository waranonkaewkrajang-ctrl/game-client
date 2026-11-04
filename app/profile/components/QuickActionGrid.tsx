"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { prefersReducedMotion } from "../lib";
import { FOCUS, Icon, Svg } from "./ui";
import { ArrowsGlyph, BankGlyph, GiftBox, PersonGlyph } from "./decorations";
import styles from "../profile.module.css";
import surface from "../styles/surfaces.module.css";

interface Tile {
  label: string;
  /** desktop description (two lines) */
  hint: string;
  /** mobile description (one line) */
  short: string;
  icon: ReactNode;
  /** base gradient + this tile's own texture (no two tiles share one) */
  background: string;
  art: ReactNode;
  /** in-page section id, or a route */
  target: { section: string } | { href: string };
}

// desktop only: the mobile/tablet tiles are too narrow to carry art beside the text
const ART = "pointer-events-none absolute -z-10 hidden h-auto lg:block";

const TILES: Tile[] = [
  {
    label: "ข้อมูลส่วนตัว",
    hint: "เบอร์โทร และสถานะบัญชีของคุณ",
    short: "เบอร์โทร สถานะบัญชี",
    icon: Icon.user,
    // concentric rings
    background:
      "repeating-radial-gradient(circle at 100% 100%, rgba(255,255,255,0.07) 0 1px, transparent 1px 14px), linear-gradient(135deg, #fb923c 0%, #f97316 45%, #ea580c 100%)",
    art: <PersonGlyph className={`${ART} -bottom-1 right-1 w-[78px] text-white lg:w-[92px]`} />,
    target: { section: "personal" },
  },
  {
    label: "ธุรกรรม",
    hint: "ประวัติการทำรายการทั้งหมดของคุณ",
    short: "ประวัติฝาก ถอน",
    icon: Icon.scroll,
    // diagonal hatching
    background:
      "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 12px), linear-gradient(135deg, #34d399 0%, #10b981 45%, #047857 100%)",
    art: <ArrowsGlyph className={`${ART} bottom-2 right-2 w-[76px] text-white lg:w-[88px]`} />,
    target: { href: "/history" },
  },
  {
    label: "บัญชีธนาคาร",
    hint: "จัดการบัญชีธนาคารของคุณ",
    short: "บัญชีรับเงิน",
    icon: <path d="M3 21h18M5 21V11M19 21V11M9 21V11M15 21V11M2 9l10-6 10 6Z" />,
    // fine grid
    background:
      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px) 0 0/16px 16px, linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px) 0 0/16px 16px, linear-gradient(135deg, #60a5fa 0%, #3b82f6 45%, #1d4ed8 100%)",
    art: <BankGlyph className={`${ART} bottom-1 right-2 w-[80px] text-sky-100 lg:w-[96px]`} />,
    target: { section: "bank" },
  },
  {
    label: "รับรางวัล",
    hint: "วงล้อเสี่ยงโชค และรางวัลของคุณ",
    short: "วงล้อเสี่ยงโชค",
    icon: Icon.gift,
    // scattered dots
    background:
      "radial-gradient(rgba(255,255,255,0.12) 1.2px, transparent 1.6px) 0 0/18px 18px, linear-gradient(135deg, #f87171 0%, #ef4444 45%, #b91c1c 100%)",
    art: <GiftBox palette="red" coins={false} className={`${ART} -bottom-3 -right-3 w-[96px] lg:w-[108px]`} />,
    target: { href: "/spin-wheel" },
  },
];

/** Scroll to an in-page section, respecting reduced motion, and move focus to its heading. */
export function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  const heading = document.getElementById(`${id}-title`);
  heading?.setAttribute("tabindex", "-1");
  heading?.focus({ preventScroll: true });
}

const TILE =
  `${styles.lift} ${FOCUS} relative isolate flex min-h-[118px] w-full min-w-0 flex-col items-start gap-2 overflow-hidden rounded-[var(--radius-card)] ` +
  // no CSS border: the 1px edge is the rim span below (padding +1px keeps the content where the 1px border had it)
  "p-[13px] text-left text-white shadow-[var(--shadow-card)] lg:min-h-[136px] lg:flex-row lg:gap-3 lg:p-[17px]";

function Body({ t }: { t: Tile }) {
  return (
    <>
      {t.art}
      {/* light from the top-left */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_0%_0%,rgba(255,255,255,0.18),transparent_55%)]" />
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/25 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] lg:size-12">
        <Svg size={22}>{t.icon}</Svg>
      </span>
      <span className="block min-w-0 max-w-full lg:max-w-[56%] lg:pt-0.5">
        <span className="block truncate text-base font-bold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] lg:text-lg">{t.label}</span>
        <span className="mt-0.5 block truncate text-xs text-white/85 lg:hidden">{t.short}</span>
        <span className="mt-1 hidden text-[13px] leading-snug text-white/85 lg:line-clamp-2">{t.hint}</span>
      </span>
      <Svg size={14} className="absolute bottom-3 left-4 hidden text-white/70 lg:block">
        <path d="M7 17 17 7M8 7h9v9" />
      </Svg>
      <span aria-hidden="true" className={surface.rim} />
    </>
  );
}

export default function QuickActionGrid() {
  return (
    // reference: 172×118 tiles, 12px column / 16px row gaps at 390; 4 across with 16px gaps on desktop
    <nav aria-label="เมนูลัด" className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-3 lg:gap-4">
      {TILES.map((t) =>
        "href" in t.target ? (
          <Link key={t.label} href={t.target.href} className={TILE} style={{ background: t.background }}>
            <Body t={t} />
          </Link>
        ) : (
          <button key={t.label} type="button" onClick={() => jump((t.target as { section: string }).section)} className={TILE} style={{ background: t.background }}>
            <Body t={t} />
          </button>
        ),
      )}
    </nav>
  );
}
