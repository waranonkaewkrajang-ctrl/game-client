"use client";
import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { FOCUS } from "./ui";
import s from "./QuickActionTile.module.css";

export type TileVariant = "profile" | "tx" | "bank" | "reward";

interface Props {
  /** Lucide icon (24×24 stroke SVG) */
  icon: ReactNode;
  title: string;
  subtitle: string;
  variant: TileVariant;
  /** a route, or "#<section-id>" for an in-page jump (handled by onClick) */
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/** Quick action tile — V1 "Dropped Heavy": muted gradient, glossy streak, halftone corner, sparkle, large icon top-right. */
export default function QuickActionTile({ icon, title, subtitle, variant, href, onClick }: Props) {
  return (
    <Link href={href} onClick={onClick} className={`${s.tile} ${s[variant]} ${FOCUS}`}>
      <svg className={s.sparkle} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
      </svg>
      <span className={s.iconMain} aria-hidden="true">
        {icon}
      </span>
      <span className={s.content}>
        <span className={s.title}>{title}</span>
        <span className={s.sub}>{subtitle}</span>
      </span>
    </Link>
  );
}
