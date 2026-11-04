import type { DecoProps } from "./types";

/**
 * Large translucent glyphs for the shortcut tiles (white via currentColor, low opacity).
 * Each tile gets its own subject so the four cards don't read as copies.
 */

export function PersonGlyph({ className = "", style, opacity = 0.22 }: DecoProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 100 90" className={className} style={{ opacity, ...style }}>
      <circle cx="56" cy="28" r="20" fill="currentColor" />
      <path d="M18 90C18 64 34 52 56 52S94 64 94 90Z" fill="currentColor" />
      <circle cx="22" cy="40" r="15" fill="currentColor" opacity=".55" />
    </svg>
  );
}

export function ArrowsGlyph({ className = "", style, opacity = 0.22 }: DecoProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 100 90" className={className} style={{ opacity, ...style }}>
      <path d="M6 30H62V12L94 38L62 64V46H6Z" fill="currentColor" />
      <path d="M94 66H50V54L24 72L50 90V78H94Z" fill="currentColor" opacity=".6" />
    </svg>
  );
}

/** Classical bank front: pediment, four columns, steps. */
export function BankGlyph({ className = "", style, opacity = 0.4 }: DecoProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 110 96" className={className} style={{ opacity, ...style }}>
      <path d="M55 4L104 28H6Z" fill="currentColor" />
      <rect x="10" y="30" width="90" height="6" rx="1" fill="currentColor" />
      {[16, 38, 60, 82].map((x) => (
        <g key={x}>
          <rect x={x} y="40" width="12" height="40" fill="currentColor" opacity=".8" />
          <rect x={x} y="40" width="4" height="40" fill="#fff" opacity=".35" />
        </g>
      ))}
      <rect x="6" y="80" width="98" height="6" fill="currentColor" />
      <rect x="0" y="88" width="110" height="8" fill="currentColor" opacity=".8" />
      <circle cx="55" cy="20" r="4" fill="#1e3a8a" opacity=".35" />
    </svg>
  );
}
