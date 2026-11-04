import { useId } from "react";
import type { DecoProps } from "./types";

/** One flat coin seen from above at an angle: reeded edge, gold face, inner ring, glint. */
function Coin({ x, y, r, grad, edge }: { x: number; y: number; r: number; grad: string; edge: string }) {
  const ry = r * 0.4;
  const h = r * 0.22;
  return (
    <g>
      <path d={`M${x - r} ${y}v${h}a${r} ${ry} 0 0 0 ${2 * r} 0v${-h}`} fill={`url(#${edge})`} />
      {/* reeding on the edge */}
      <path d={`M${x - r + 2} ${y + h * 0.5}a${r - 2} ${ry} 0 0 0 ${2 * (r - 2)} 0`} fill="none" stroke="#713f12" strokeOpacity=".45" strokeWidth={h * 0.7} strokeDasharray="1 2.2" />
      <ellipse cx={x} cy={y} rx={r} ry={ry} fill={`url(#${grad})`} />
      <ellipse cx={x} cy={y} rx={r * 0.74} ry={ry * 0.74} fill="none" stroke="#a16207" strokeOpacity=".5" strokeWidth="1.5" />
      <ellipse cx={x - r * 0.32} cy={y - ry * 0.3} rx={r * 0.3} ry={ry * 0.2} fill="#fff" opacity=".4" />
    </g>
  );
}

/** Small crown mark, used on the standing coin's face and on top of it. */
const CROWN = "M-10 6L-12-6L-5 0L0-9L5 0L12-6L10 6Z";

/** Gold coin stack with a crown-stamped coin standing beside it (credit card illustration). */
export default function CoinStack({ className = "", style, opacity = 1 }: DecoProps) {
  const id = useId();
  const face = `${id}f`;
  const edge = `${id}e`;
  const big = `${id}b`;
  const bigEdge = `${id}be`;
  const stack = [112, 101, 90, 79, 68, 57];
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 170 140" className={className} style={{ opacity, ...style }}>
      <defs>
        <linearGradient id={face} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset=".5" stopColor="#facc15" />
          <stop offset="1" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id={edge} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a16207" />
          <stop offset=".35" stopColor="#eab308" />
          <stop offset="1" stopColor="#854d0e" />
        </linearGradient>
        <radialGradient id={big} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#fff4c2" />
          <stop offset=".5" stopColor="#facc15" />
          <stop offset="1" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id={bigEdge} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ca8a04" />
          <stop offset="1" stopColor="#713f12" />
        </linearGradient>
      </defs>

      <ellipse cx="86" cy="130" rx="70" ry="7" fill="#000" opacity=".35" />

      {stack.map((y, i) => <Coin key={y} x={i % 2 ? 58 : 56} y={y} r={36} grad={face} edge={edge} />)}

      {/* standing coin, slightly turned */}
      <g transform="rotate(10 124 84)">
        <ellipse cx="130" cy="84" rx="30" ry="38" fill={`url(#${bigEdge})`} />
        <ellipse cx="124" cy="84" rx="30" ry="38" fill={`url(#${big})`} />
        <ellipse cx="124" cy="84" rx="23" ry="30" fill="none" stroke="#a16207" strokeOpacity=".55" strokeWidth="2" />
        <path d={CROWN} transform="translate(124 86) scale(1.25)" fill="#a16207" opacity=".6" />
        <ellipse cx="114" cy="68" rx="8" ry="5" fill="#fff" opacity=".45" transform="rotate(-30 114 68)" />
      </g>

      {/* little crown resting on top */}
      <g transform="translate(132 40) rotate(14) scale(1.3)">
        <path d={CROWN} fill={`url(#${big})`} stroke="#854d0e" strokeWidth=".8" />
        <circle cx="0" cy="-9" r="2" fill="#a855f7" />
        <circle cx="-12" cy="-6" r="1.6" fill="#fde68a" />
        <circle cx="12" cy="-6" r="1.6" fill="#fde68a" />
      </g>
    </svg>
  );
}
