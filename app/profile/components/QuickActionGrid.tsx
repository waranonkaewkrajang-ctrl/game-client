"use client";
import type { MouseEvent } from "react";
import { prefersReducedMotion } from "../lib";
import QuickActionTile, { type TileVariant } from "./QuickActionTile";

const TILES: { variant: TileVariant; title: string; subtitle: string; href: string }[] = [
  { variant: "profile", title: "ข้อมูลส่วนตัว", subtitle: "เบอร์โทร สถานะบัญชี", href: "#personal" },
  { variant: "tx", title: "ธุรกรรม", subtitle: "ประวัติฝาก ถอน", href: "/history" },
  { variant: "bank", title: "บัญชีธนาคาร", subtitle: "บัญชีรับเงิน", href: "#bank" },
  { variant: "reward", title: "รับรางวัล", subtitle: "วงล้อเสี่ยงโชค", href: "/spin-wheel" },
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

function onSection(e: MouseEvent<HTMLAnchorElement>, id: string) {
  e.preventDefault();
  jump(id);
}

export default function QuickActionGrid() {
  return (
    <nav aria-label="เมนูลัด" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TILES.map((t) => (
        <QuickActionTile
          key={t.variant}
          {...t}
          onClick={t.href.startsWith("#") ? (e) => onSection(e, t.href.slice(1)) : undefined}
        />
      ))}
    </nav>
  );
}
