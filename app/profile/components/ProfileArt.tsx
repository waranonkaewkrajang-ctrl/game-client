"use client";
import Image from "next/image";
import { useState, type ReactNode } from "react";

/**
 * Production illustrations live in public/profile/artwork/<name>.webp (transparent, 2× display size).
 * Flip an entry to true once its file is in place; until then the SVG fallback renders and no request
 * is made, so a missing file never shows up as a 404. If a ready file fails to load, the fallback
 * takes over as well. Names match the artwork brief (design-reference/artwork-crops/).
 */
const READY = {
  crown: true,
  coins: true,
  "medal-silver": true,
  "laurel-wreath": true,
  "gift-purple": true,
  "gift-red": true,
  "bank-building": true,
  "tile-person": true,
  "tile-arrows": true,
} as const;

export type ArtName = keyof typeof READY;

interface Props {
  name: ArtName;
  /** intrinsic size of the exported file (px), used for the aspect ratio — prevents layout shift */
  width: number;
  height: number;
  /** responsive `sizes` hint for next/image */
  sizes: string;
  className?: string;
  /** above the fold (hero crown): load immediately */
  preload?: boolean;
  fallback: ReactNode;
}

export default function ProfileArt({ name, width, height, sizes, className = "", preload = false, fallback }: Props) {
  const [failed, setFailed] = useState(false);
  if (!READY[name] || failed) return <>{fallback}</>;
  return (
    <Image
      src={`/profile/artwork/${name}.webp`}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      sizes={sizes}
      preload={preload}
      loading={preload ? undefined : "lazy"}
      onError={() => setFailed(true)}
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
