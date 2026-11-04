"use client";
import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { FOCUS } from "./ui";
import s from "./QuickActionTile.module.css";

export type TileVariant = "profile" | "tx" | "bank" | "reward";

const iconMap: Record<TileVariant, string> = {
  profile: "/profile/artwork/tile-person.webp",
  tx: "/profile/artwork/tile-arrows.webp",
  bank: "/profile/artwork/bank-building.webp",
  reward: "/profile/artwork/gift-red.webp",
};

interface Props {
  title: string;
  subtitle: string;
  variant: TileVariant;
  /** a route, or "#<section-id>" for an in-page jump (handled by onClick) */
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** Quick action tile — V1 "Dropped Heavy": muted gradient, glossy streak, halftone corner, sparkle, artwork icon on the right. */
export default function QuickActionTile({ title, subtitle, variant, href, onClick }: Props) {
  return (
    <Link href={href} onClick={onClick} className={`${s.tile} ${s[variant]} ${FOCUS}`}>
      <svg className={s.sparkle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
      </svg>
      <Image src={iconMap[variant]} alt="" width={60} height={60} unoptimized aria-hidden className={s.icon} />
      <span className={s.content}>
        <span className={s.title}>{title}</span>
        <span className={s.sub}>{subtitle}</span>
      </span>
    </Link>
  );
}
