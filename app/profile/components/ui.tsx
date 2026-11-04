"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { RankInfo } from "../types";
import { copyText } from "../lib";
import surface from "../styles/surfaces.module.css";

/** Card surface: plum gradient lit from the top-left, 1px edge lifted at the top/upper-left, thin shadow. See styles/surfaces.module.css. */
export const CARD = `${surface.card} rounded-[var(--radius-card)]`;

/** Inner element surface (rows, stat tiles). */
export const INNER = "rounded-[var(--radius-inner)] border border-white/[0.07] bg-[var(--bg-card-elevated)]";

/** Tap feedback for small controls (cards use styles.lift instead). */
export const PRESS = "transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

export const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300";

/** Gold pill button (primary action). */
export const GOLD_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent-gold)] px-5 text-sm font-semibold text-[#1b1030] hover:brightness-110";

/** A titled card, as in the reference: icon + heading inside the card, optional action on the right. */
export function Card({ id, title, icon, action, children, className = "" }: {
  id?: string;
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`${CARD} scroll-mt-[calc(var(--ds-header-h,64px)+16px)] p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <h2 id={headingId} className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)] sm:text-lg">
          <span className="text-[var(--accent-gold)]">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Row({ label, children, last = false }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={`flex min-h-12 items-center justify-between gap-3 py-1.5 ${last ? "" : "border-b border-white/[0.06]"}`}>
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="flex min-w-0 items-center gap-1 text-right text-[15px] font-medium text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

export function CopyButton({ value, label, className = "" }: { value?: string | null; label: string; className?: string }) {
  const disabled = !value || value === "-";
  return (
    <button
      type="button"
      onClick={() => copyText(value, label)}
      disabled={disabled}
      aria-label={`คัดลอก${label}`}
      className={`grid size-11 shrink-0 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-white/10 hover:text-white disabled:opacity-30 ${PRESS} ${FOCUS} ${className}`}
    >
      <Svg size={18}>{Icon.copy}</Svg>
    </button>
  );
}

/** iOS-style switch: 44×24 track, 20px thumb, inside a 44px-tall hit area. */
export function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative grid h-11 w-14 shrink-0 place-items-center rounded-full ${FOCUS} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <span
        aria-hidden="true"
        className="relative block h-6 w-11 rounded-full transition-colors duration-200 motion-reduce:transition-none"
        style={{ background: checked ? "linear-gradient(90deg, #7c3aed, #c026d3)" : "#3f3f46" }}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-[left] duration-200 motion-reduce:transition-none ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Rank emblem from the API's `image_url`. When it's missing or fails to load,
 * shows a circle in the rank colour with the first letter. No local paths.
 */
export function RankIcon({ info, className = "", fallbackColor = "#71717a" }: { info?: RankInfo | null; className?: string; fallbackColor?: string }) {
  const [failed, setFailed] = useState(false);
  const url = info?.image_url?.trim();
  if (url && !failed) {
    return (
      <Image
        src={url}
        alt={info?.name || ""}
        width={96}
        height={96}
        unoptimized
        onError={() => setFailed(true)}
        className={`shrink-0 object-contain ${className}`}
      />
    );
  }
  const color = info?.color || fallbackColor;
  return (
    <span
      role="img"
      aria-label={info?.name || "ไม่มีระดับ"}
      className={`grid shrink-0 place-items-center rounded-full font-bold text-[#120a20] ${className}`}
      style={{
        // metallic: highlight top-left, darker rim bottom-right
        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.75), transparent 45%), radial-gradient(circle at 70% 75%, rgba(0,0,0,0.28), transparent 60%), ${color}`,
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.25)",
      }}
    >
      <span className="leading-none">{info?.name?.charAt(0).toUpperCase() || "-"}</span>
    </span>
  );
}

export const Icon = {
  user: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
  card: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>,
  scroll: <><path d="M8 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8" /><path d="M8 3a2 2 0 0 0-2 2v14a2 2 0 1 1-4 0v-2h4M12 8h4M12 12h4" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  refresh: <><path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></>,
  wheel: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M12 3v7M12 14v7M3 12h7M14 12h7M5.6 5.6l5 5M13.4 13.4l5 5M18.4 5.6l-5 5M10.6 13.4l-5 5" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>,
  coins: <><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
};

export function Svg({ children, size = 20, className = "" }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}
