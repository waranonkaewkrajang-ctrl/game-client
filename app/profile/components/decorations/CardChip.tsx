import { useId } from "react";
import type { DecoProps } from "./types";

/** EMV-style chip for the bank card. */
export default function CardChip({ className = "", style, opacity = 1 }: DecoProps) {
  const id = useId();
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 40 30" className={className} style={{ opacity, ...style }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset=".5" stopColor="#eab308" />
          <stop offset="1" stopColor="#a16207" />
        </linearGradient>
      </defs>
      <rect x=".5" y=".5" width="39" height="29" rx="6" fill={`url(#${id})`} stroke="#713f12" strokeOpacity=".5" />
      <path d="M0 10h12M0 20h12M28 10h12M28 20h12M12 0v30M28 0v30M12 15h16" stroke="#713f12" strokeOpacity=".45" fill="none" />
    </svg>
  );
}
