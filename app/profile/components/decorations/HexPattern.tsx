import { useId } from "react";
import type { DecoProps } from "./types";

/** Honeycomb outline pattern that fills its box. Used behind the hero (VIP-card texture). */
export default function HexPattern({ className = "", style, opacity = 0.12, cell = 14, strokeWidth = 1 }: DecoProps & { cell?: number; strokeWidth?: number }) {
  const id = useId();
  const w = cell * 2;
  const h = cell * 3.464; // 2·√3 — one pointy-top hex + the half below it
  const s = cell * 0.577; // side offset (1/√3)
  return (
    <svg aria-hidden="true" focusable="false" className={className} style={{ opacity, ...style }} width="100%" height="100%">
      <defs>
        <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
          <path
            d={`M${cell} 0 L${w} ${s} V${s + 2 * s} L${cell} ${4 * s} L0 ${s + 2 * s} V${s} Z M${cell} ${4 * s} V${h}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
