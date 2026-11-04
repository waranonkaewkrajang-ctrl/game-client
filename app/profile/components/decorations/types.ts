import type { CSSProperties } from "react";

/** Shared props for every decoration: purely visual, always aria-hidden, colour via currentColor. */
export interface DecoProps {
  className?: string;
  style?: CSSProperties;
  /** 0–1, applied to the whole graphic. Defaults per component (low — decorations stay quiet). */
  opacity?: number;
}
