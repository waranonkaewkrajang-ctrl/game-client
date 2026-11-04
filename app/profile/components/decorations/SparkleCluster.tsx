import type { DecoProps } from "./types";

/** 4-point concave star centred on (cx, cy). */
const star = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;

/** Three static sparkles of different sizes. No animation by design. */
export default function SparkleCluster({ className = "", style, opacity = 0.7 }: DecoProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 48 48" className={className} style={{ opacity, ...style }} fill="currentColor">
      <path d={star(30, 16, 12)} />
      <path d={star(12, 32, 6)} opacity=".7" />
      <path d={star(38, 38, 4)} opacity=".5" />
    </svg>
  );
}
