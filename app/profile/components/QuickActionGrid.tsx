"use client";
import type { MouseEvent, ReactNode } from "react";
import { prefersReducedMotion } from "../lib";
import QuickActionTile, { type TileVariant } from "./QuickActionTile";

/** Lucide icon geometry (ISC), inlined: lucide-react is not a dependency of this project. */
function Lucide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const UserCircle = (
  <Lucide>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </Lucide>
);
const ArrowRightLeft = (
  <Lucide>
    <path d="m16 3 4 4-4 4" />
    <path d="M20 7H4" />
    <path d="m8 21-4-4 4-4" />
    <path d="M4 17h16" />
  </Lucide>
);
const Landmark = (
  <Lucide>
    <path d="M10 18v-7" />
    <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
    <path d="M14 18v-7" />
    <path d="M18 18v-7" />
    <path d="M3 22h18" />
    <path d="M6 18v-7" />
  </Lucide>
);
const Gift = (
  <Lucide>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
  </Lucide>
);

const TILES: { variant: TileVariant; title: string; subtitle: string; icon: ReactNode; href: string }[] = [
  { variant: "profile", title: "ข้อมูลส่วนตัว", subtitle: "เบอร์โทร สถานะบัญชี", icon: UserCircle, href: "#personal" },
  { variant: "tx", title: "ธุรกรรม", subtitle: "ประวัติฝาก ถอน", icon: ArrowRightLeft, href: "/history" },
  { variant: "bank", title: "บัญชีธนาคาร", subtitle: "บัญชีรับเงิน", icon: Landmark, href: "#bank" },
  { variant: "reward", title: "รับรางวัล", subtitle: "วงล้อเสี่ยงโชค", icon: Gift, href: "/spin-wheel" },
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
