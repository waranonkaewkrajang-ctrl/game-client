import { useId } from "react";
import type { DecoProps } from "./types";

const PALETTES = {
  purple: { top: ["#f0abfc", "#c026d3"], left: ["#c026d3", "#7e22ce"], right: ["#9333ea", "#4c1d95"] },
  red: { top: ["#fecaca", "#ef4444"], left: ["#ef4444", "#991b1b"], right: ["#b91c1c", "#7f1d1d"] },
} as const;

/**
 * Three-quarter gift box with a gold ribbon and bow, plus a few coins (referral card; red variant on the
 * rewards shortcut). Light from the top-left: top face brightest, right face darkest.
 */
export default function GiftBox({
  className = "",
  style,
  opacity = 1,
  palette = "purple",
  coins = true,
}: DecoProps & { palette?: keyof typeof PALETTES; coins?: boolean }) {
  const id = useId();
  const p = PALETTES[palette];
  const g = (k: string) => `${id}${k}`;

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 170 160" className={className} style={{ opacity, ...style }}>
      <defs>
        <linearGradient id={g("t")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={p.top[0]} /><stop offset="1" stopColor={p.top[1]} /></linearGradient>
        <linearGradient id={g("l")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.left[0]} /><stop offset="1" stopColor={p.left[1]} /></linearGradient>
        <linearGradient id={g("r")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.right[0]} /><stop offset="1" stopColor={p.right[1]} /></linearGradient>
        <linearGradient id={g("au")} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1b8" /><stop offset=".5" stopColor="#facc15" /><stop offset="1" stopColor="#a16207" /></linearGradient>
        <radialGradient id={g("c")} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff4c2" /><stop offset=".55" stopColor="#facc15" /><stop offset="1" stopColor="#a16207" /></radialGradient>
      </defs>

      <ellipse cx="86" cy="146" rx="62" ry="8" fill="#000" opacity=".3" />

      {/* body */}
      <path d="M36 80L84 96V146L36 128Z" fill={`url(#${g("l")})`} />
      <path d="M84 96L134 78V128L84 146Z" fill={`url(#${g("r")})`} />
      {/* ribbon down each face */}
      <path d="M55 86.6L65 90V139.6L55 136Z" fill={`url(#${g("au")})`} />
      <path d="M104 88.8L114 85.2V135.2L104 138.8Z" fill="#ca8a04" />

      {/* lid */}
      <path d="M30 66L84 84V98L30 80Z" fill={`url(#${g("l")})`} />
      <path d="M84 84L140 64V78L84 98Z" fill={`url(#${g("r")})`} />
      <path d="M30 66L86 46L140 64L84 84Z" fill={`url(#${g("t")})`} />
      <path d="M30 66L86 46L140 64" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      <path d="M53 74L63 77.4V91.4L53 88Z" fill={`url(#${g("au")})`} />
      <path d="M106 76.2L116 72.6V86.6L106 90.2Z" fill="#ca8a04" />
      {/* ribbon across the lid */}
      <path d="M58 76L112 56" stroke={`url(#${g("au")})`} strokeWidth="10" />
      <path d="M58 56L111 74" stroke={`url(#${g("au")})`} strokeWidth="10" />

      {/* bow */}
      <path d="M85 64C70 40 46 38 50 52C53 62 72 66 85 64Z" fill={`url(#${g("au")})`} stroke="#854d0e" strokeOpacity=".4" />
      <path d="M85 64C98 38 124 38 120 52C117 62 98 66 85 64Z" fill={`url(#${g("au")})`} stroke="#854d0e" strokeOpacity=".4" />
      <path d="M84 64L74 88L80 86L84 92Z M86 64L98 86L92 85L88 91Z" fill="#ca8a04" />
      <ellipse cx="85" cy="63" rx="8" ry="6" fill={`url(#${g("c")})`} />

      {coins && (
        <>
          <g transform="rotate(-18 148 128)">
            <ellipse cx="148" cy="130" rx="13" ry="13" fill="#a16207" />
            <ellipse cx="146" cy="128" rx="13" ry="13" fill={`url(#${g("c")})`} />
            <circle cx="146" cy="128" r="8.5" fill="none" stroke="#a16207" strokeOpacity=".5" strokeWidth="1.5" />
          </g>
          <ellipse cx="22" cy="138" rx="11" ry="4.5" fill="#a16207" />
          <ellipse cx="22" cy="136" rx="11" ry="4.5" fill={`url(#${g("c")})`} />
          <path d="M150 30l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5Z" fill="#fffbe6" />
          <path d="M22 46l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fffbe6" opacity=".8" />
        </>
      )}
    </svg>
  );
}
