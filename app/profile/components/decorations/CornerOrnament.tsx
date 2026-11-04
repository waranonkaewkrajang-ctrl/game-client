import type { DecoProps } from "./types";

const ROTATE = { tl: 0, tr: 90, br: 180, bl: 270 } as const;

/** Bracket flourish for card corners (passport / certificate feel). Drawn top-left, rotated per corner. */
export default function CornerOrnament({ className = "", style, opacity = 0.5, corner = "tl" }: DecoProps & { corner?: keyof typeof ROTATE }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 64 64"
      className={className}
      style={{ opacity, transform: `rotate(${ROTATE[corner]}deg)`, ...style }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
    >
      {/* outer bracket with a rounded inner turn */}
      <path d="M4 44V14a10 10 0 0 1 10-10h30" strokeWidth="2" />
      {/* inner hairline */}
      <path d="M12 36V18a6 6 0 0 1 6-6h18" strokeWidth="1" opacity=".6" />
      {/* curl that closes the corner */}
      <path d="M12 18c0-4 2-6 6-6M18 18a3 3 0 1 1 0.01 0" strokeWidth="1.5" />
      {/* diamond studs at the ends */}
      <path d="M44 0.5 47.5 4 44 7.5 40.5 4Z M4 40.5 7.5 44 4 47.5 0.5 44Z" fill="currentColor" stroke="none" />
      <circle cx="52" cy="4" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="52" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
