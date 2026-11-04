import { useId } from "react";
import type { DecoProps } from "./types";

/** Mix a #rrggbb colour toward white (t > 0) or black (t < 0). Non-hex input falls back to silver. */
function tint(hex: string, t: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = parseInt(m ? m[1] : "c0c4cc", 16);
  const target = t > 0 ? 255 : 0;
  const k = Math.abs(t);
  const ch = (s: number) => Math.round(((n >> s) & 255) + (target - ((n >> s) & 255)) * k);
  return `rgb(${ch(16)} ${ch(8)} ${ch(0)})`;
}

const C = 100;
const SPIKES = 8;
const star = Array.from({ length: SPIKES * 2 }, (_, i) => {
  const r = i % 2 ? 66 : 80;
  const a = (Math.PI / SPIKES) * i - Math.PI / 2;
  return `${(C + r * Math.cos(a)).toFixed(1)},${(C + r * Math.sin(a)).toFixed(1)}`;
}).join(" ");

/** Laurel leaves on the left arc (mirrored for the right), bottom → top-left. */
const LEAVES = Array.from({ length: 9 }, (_, i) => {
  const deg = 102 + i * 14;
  const rad = (deg * Math.PI) / 180;
  const r = 88 + (i % 2 ? 4 : -2);
  return {
    x: +(C + r * Math.cos(rad)).toFixed(1),
    y: +(C + r * Math.sin(rad)).toFixed(1),
    rot: deg + 90 + (i % 2 ? 28 : -22),
    s: 1 - i * 0.04,
  };
});
const LEAF = "M0 0C5-6 14-6 20 0C14 6 5 6 0 0Z";

/**
 * Rank medallion frame: gold laurel → metallic star-edged ring (tinted from the rank colour) → plate.
 * The emblem itself (rank.image_url or the fallback) is HTML laid over the centre; inset ≈ 24%.
 */
export default function Medallion({ className = "", style, opacity = 1, tone = "#c0c4cc" }: DecoProps & { tone?: string }) {
  const id = useId();
  const metal = `${id}m`;
  const rim = `${id}r`;
  const plate = `${id}p`;
  const gold = `${id}g`;

  const branch = (
    <g>
      <path d="M90 186C40 176 12 130 22 72" fill="none" stroke="#a16207" strokeWidth="3" strokeLinecap="round" />
      {LEAVES.map((l, i) => (
        <path key={i} d={LEAF} fill={`url(#${gold})`} stroke="#854d0e" strokeOpacity=".5" strokeWidth=".8" transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`} />
      ))}
    </g>
  );

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 200 200" className={className} style={{ opacity, ...style }}>
      <defs>
        <linearGradient id={metal} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={tint(tone, 0.8)} />
          <stop offset=".45" stopColor={tint(tone, 0.2)} />
          <stop offset=".7" stopColor={tint(tone, -0.35)} />
          <stop offset="1" stopColor={tint(tone, 0.35)} />
        </linearGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(tone, -0.55)} />
          <stop offset="1" stopColor={tint(tone, -0.2)} />
        </linearGradient>
        <radialGradient id={plate} cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor={tint(tone, 0.85)} />
          <stop offset=".6" stopColor={tint(tone, 0.25)} />
          <stop offset="1" stopColor={tint(tone, -0.3)} />
        </radialGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset=".5" stopColor="#eab308" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
      </defs>

      {branch}
      <g transform="translate(200 0) scale(-1 1)">{branch}</g>
      {/* ribbon tie */}
      <path d="M82 184L100 176L118 184L112 194L100 188L88 194Z" fill={`url(#${gold})`} stroke="#854d0e" strokeOpacity=".5" />

      <circle cx={C} cy={C + 4} r="78" fill="#000" opacity=".35" />
      <polygon points={star} fill={`url(#${metal})`} stroke={tint(tone, -0.5)} strokeOpacity=".6" strokeWidth="1.2" />
      <circle cx={C} cy={C} r="62" fill={`url(#${rim})`} />
      <circle cx={C} cy={C} r="57" fill={`url(#${plate})`} />
      <circle cx={C} cy={C} r="57" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
      {/* glint on the ring */}
      <path d="M52 52A68 68 0 0 1 100 32" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
