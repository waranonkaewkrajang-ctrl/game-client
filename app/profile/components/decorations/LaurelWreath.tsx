import type { DecoProps } from "./types";

const CX = 60;
const CY = 52;
const R = 44;
const LEAVES = 8;

/** Leaves along the left arc, from the bottom (105°) up to the top-left (235°). */
const leaves = Array.from({ length: LEAVES }, (_, i) => {
  const deg = 108 + (i * (232 - 108)) / (LEAVES - 1);
  const rad = (deg * Math.PI) / 180;
  const x = CX + R * Math.cos(rad);
  const y = CY + R * Math.sin(rad);
  // tangent to the arc, tilted outward so the leaves fan like a wreath
  const rot = deg + 90 - 28;
  const size = 1 - i * 0.045; // leaves shrink toward the tip
  return { x: +x.toFixed(2), y: +y.toFixed(2), rot: +rot.toFixed(1), rx: +(8 * size).toFixed(2), ry: +(3.4 * size).toFixed(2) };
});

function Branch() {
  return (
    <g>
      <path d={`M${CX - 6} ${CY + R - 1}A${R} ${R} 0 0 1 ${CX - R * 0.62} ${CY - R * 0.79}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot} ${l.x} ${l.y})`} fill="currentColor" />
      ))}
    </g>
  );
}

/** Two mirrored laurel branches framing a centred emblem (the rank showcase). */
export default function LaurelWreath({ className = "", style, opacity = 0.5 }: DecoProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 120 104" className={className} style={{ opacity, ...style }}>
      <Branch />
      <g transform="translate(120 0) scale(-1 1)">
        <Branch />
      </g>
      {/* tie at the base */}
      <path d="M52 98q8-6 16 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
