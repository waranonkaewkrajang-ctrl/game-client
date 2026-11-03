"use client";
import type { ReactNode } from "react";
import { copyText } from "../lib";

/** Shared glass surface: purple → pink, pink hairline, 3D inset depth. */
export const GLASS =
  "relative rounded-3xl border border-pink-500/20 bg-linear-to-br from-purple-900/60 to-pink-900/50 backdrop-blur-xl " +
  "shadow-[0_12px_24px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,0.1),inset_0_-4px_6px_rgba(0,0,0,0.4)]";

/** Tap feedback used on every pressable element. */
export const PRESS = "transition-transform duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

export const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200";

export function Section({ id, title, children, className = "" }: { id?: string; title: string; children: ReactNode; className?: string }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`scroll-mt-[calc(var(--ds-header-h)+16px)] ${className}`}>
      <h2 id={headingId} className="mb-3 px-1 text-[15px] font-semibold text-fuchsia-100/90">{title}</h2>
      {children}
    </section>
  );
}

export function Row({ label, children, last = false }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={`flex min-h-[56px] items-center justify-between gap-3 py-2 ${last ? "" : "border-b border-white/[0.07]"}`}>
      <span className="text-sm text-fuchsia-100/70">{label}</span>
      <div className="flex min-w-0 items-center gap-1 text-right text-[15px] font-medium text-white">{children}</div>
    </div>
  );
}

export function CopyButton({ value, label }: { value?: string | null; label: string }) {
  const disabled = !value || value === "-";
  return (
    <button
      type="button"
      onClick={() => copyText(value, label)}
      disabled={disabled}
      aria-label={`คัดลอก${label}`}
      className={`grid size-11 shrink-0 place-items-center rounded-xl text-fuchsia-200/70 hover:bg-white/10 hover:text-white disabled:opacity-30 ${PRESS} ${FOCUS}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

/** Accessible switch (role="switch"). */
export function Toggle({ checked, onChange, label, disabled = false }: { checked: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-11 w-[64px] shrink-0 rounded-full ${FOCUS} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {/* visual track is 32px tall inside a 44px hit area */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-1.5 h-8 rounded-full border shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)] transition-colors duration-200 ${
          checked ? "border-emerald-300/60 bg-linear-to-b from-emerald-500 to-emerald-700" : "border-white/15 bg-black/35"
        }`}
      />
      <span
        aria-hidden="true"
        className={`absolute top-[9px] size-[26px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_-2px_2px_rgba(0,0,0,0.1)] transition-[left] duration-200 motion-reduce:transition-none ${
          checked ? "left-[35px]" : "left-[3px]"
        }`}
      />
    </button>
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
};

export function Svg({ children, size = 20, className = "" }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {children}
    </svg>
  );
}
