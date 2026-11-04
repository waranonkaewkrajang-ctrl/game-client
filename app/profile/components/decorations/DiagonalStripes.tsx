import { useId } from "react";
import type { DecoProps } from "./types";

/** 45° stripes that fill their box. Quick-action tiles use it in the top-right corner. */
export default function DiagonalStripes({ className = "", style, opacity = 0.1, gap = 8, width = 3, angle = 45 }: DecoProps & { gap?: number; width?: number; angle?: number }) {
  const id = useId();
  return (
    <svg aria-hidden="true" focusable="false" className={className} style={{ opacity, ...style }} width="100%" height="100%">
      <defs>
        <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
          <rect width={width} height={gap} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
