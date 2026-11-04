import { useId } from "react";
import type { DecoProps } from "./types";

/**
 * Hero illustration: a gold crown with purple jewels resting on a sweep of purple silk.
 * Light comes from the top-left (same as the coin stack, medallion and gift box).
 */
export default function Crown({ className = "", style, opacity = 1 }: DecoProps) {
  const id = useId();
  const gold = `${id}g`;
  const goldDark = `${id}d`;
  const ball = `${id}b`;
  const jewel = `${id}j`;
  const silk = `${id}s`;
  const silkHi = `${id}h`;

  const tips: [number, number, number][] = [
    [42, 64, 7],
    [80, 50, 7.5],
    [120, 30, 9],
    [160, 50, 7.5],
    [198, 64, 7],
  ];

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 260 200" className={className} style={{ opacity, ...style }}>
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#fff4c2" />
          <stop offset=".35" stopColor="#fcd34d" />
          <stop offset=".7" stopColor="#eab308" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id={goldDark} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ca8a04" />
          <stop offset="1" stopColor="#713f12" />
        </linearGradient>
        <radialGradient id={ball} cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset=".45" stopColor="#facc15" />
          <stop offset="1" stopColor="#a16207" />
        </radialGradient>
        <radialGradient id={jewel} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#f5d0fe" />
          <stop offset=".4" stopColor="#a855f7" />
          <stop offset="1" stopColor="#3b0764" />
        </radialGradient>
        <linearGradient id={silk} x1="0" y1="0" x2="1" y2=".3">
          <stop offset="0" stopColor="#7c3aed" stopOpacity="0" />
          <stop offset=".3" stopColor="#9333ea" />
          <stop offset=".7" stopColor="#c026d3" />
          <stop offset="1" stopColor="#6b21a8" />
        </linearGradient>
        <linearGradient id={silkHi} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f0abfc" stopOpacity="0" />
          <stop offset=".5" stopColor="#f5d0fe" stopOpacity=".75" />
          <stop offset="1" stopColor="#f0abfc" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* silk, behind the crown */}
      <path d="M0 182C50 150 96 178 146 160S226 112 260 118V150C228 150 206 176 160 186S58 182 0 200Z" fill={`url(#${silk})`} />
      <path d="M30 176C74 158 108 178 150 166S222 128 252 128" fill="none" stroke={`url(#${silkHi})`} strokeWidth="3" strokeLinecap="round" />

      {/* soft contact shadow */}
      <ellipse cx="128" cy="168" rx="82" ry="9" fill="#2e1065" opacity=".45" />

      <g transform="rotate(-9 120 110)">
        {/* back rim (inside of the band) */}
        <path d="M52 122Q120 108 188 122L188 128Q120 116 52 128Z" fill={`url(#${goldDark})`} />
        {/* points */}
        <path d="M52 124L42 64L64 100L80 50L100 94L120 30L140 94L160 50L176 100L198 64L188 124Q120 112 52 124Z" fill={`url(#${gold})`} />
        {/* shaded right half of each point for volume */}
        <path d="M120 30L140 94L124 96Z M80 50L100 94L86 97Z M160 50L176 100L164 100Z M198 64L188 124L178 112Z" fill="#92400e" opacity=".28" />
        {/* ridge highlights */}
        <path d="M120 36L112 94M80 56L72 98M160 56L154 98" stroke="#fffbe6" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
        {/* centre jewel on the body */}
        <path d="M120 74L130 88L120 102L110 88Z" fill={`url(#${jewel})`} stroke="#fde68a" strokeWidth="2" />

        {/* band */}
        <path d="M50 120Q120 134 190 120L192 146Q120 162 48 146Z" fill={`url(#${gold})`} />
        <path d="M50 120Q120 134 190 120" fill="none" stroke="#fffbe6" strokeOpacity=".7" strokeWidth="2" />
        <path d="M48 146Q120 162 192 146" fill="none" stroke="#713f12" strokeOpacity=".6" strokeWidth="2" />
        {/* band jewels */}
        <ellipse cx="120" cy="141" rx="12" ry="9" fill={`url(#${jewel})`} stroke="#fde68a" strokeWidth="2" />
        <ellipse cx="82" cy="137" rx="7" ry="6" fill={`url(#${jewel})`} stroke="#fde68a" strokeWidth="1.5" />
        <ellipse cx="158" cy="137" rx="7" ry="6" fill={`url(#${jewel})`} stroke="#fde68a" strokeWidth="1.5" />
        <circle cx="62" cy="134" r="3" fill="#fffbe6" opacity=".8" />
        <circle cx="178" cy="134" r="3" fill="#fffbe6" opacity=".8" />

        {/* orbs on the tips; the centre one is a jewel */}
        {tips.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={`url(#${i === 2 ? jewel : ball})`} stroke={i === 2 ? "#fde68a" : "none"} strokeWidth="2" />
        ))}
      </g>

      {/* glints */}
      <path d="M210 40l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" fill="#fffbe6" />
      <path d="M58 30l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#fffbe6" opacity=".8" />
    </svg>
  );
}
