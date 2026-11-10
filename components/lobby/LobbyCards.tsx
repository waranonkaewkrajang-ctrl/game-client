"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import styles from "./lobby.module.css";

/* ---------- Image with skeleton + graceful fallback (no layout shift) ---------- */
// fallbackSrc: tried once when src fails (provider cards → /default-provider.png); if that fails too, the text fallback shows.
function CardImage({ src, alt, fallback, fallbackSrc, eager = false }: { src?: string | null; alt: string; fallback: string; fallbackSrc?: string; eager?: boolean }) {
  const [current, setCurrent] = useState(src || fallbackSrc || null);
  const [state, setState] = useState<"loading" | "ready" | "error">(current ? "loading" : "error");
  const handleError = () => {
    if (fallbackSrc && current !== fallbackSrc) { setCurrent(fallbackSrc); setState("loading"); return; }
    setState("error");
  };
  return (
    <span className={styles.media}>
      {state === "loading" && <span className={styles.shimmer} aria-hidden="true" />}
      {state === "error" ? (
        <span className={styles.mediaFallback} aria-hidden="true">{fallback}</span>
      ) : (
        <img
          src={current!}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`${styles.mediaImg} ${state === "ready" ? styles.mediaImgReady : ""}`}
          onLoad={() => setState("ready")}
          onError={handleError}
        />
      )}
    </span>
  );
}

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);

/* ---------- Provider room card ----------
 * Same look as the provider card on /lobby main: square provider art filling the frame, no text on or under it
 * (the provider name is part of the art). Hover lifts the card; no play-button overlay. */
export function ProviderCard({ id, imageUrl, gameCount, gamesLabel, eager, festive }: {
  id: string; imageUrl?: string | null; gameCount: number; gamesLabel: string;
  /** kept for callers; the provider card no longer shows a play button */
  playLabel?: string;
  eager?: boolean;
  /** Christmas decoration: snow cap on the top edge + small gift at the bottom-right corner (decorative only) */
  festive?: boolean;
}) {
  return (
    <Link href={`/lobby/${id}`} className={`${styles.providerCard} ${festive ? styles.providerCardFestive : ""}`} aria-label={`${id} — ${gameCount.toLocaleString()} ${gamesLabel}`}>
      <CardImage src={imageUrl} alt={id} fallback={id} fallbackSrc="/default-provider.png" eager={eager} />
      {festive && (
        <>
          <span className={styles.xmasCardSnow} aria-hidden="true" />
          <span className={styles.xmasCardGift} aria-hidden="true" />
        </>
      )}
    </Link>
  );
}

/* ---------- Game card (recent / search results) ---------- */
export function GameCard({ href, title, provider, imageUrl }: {
  href: string; title: string; provider: string; imageUrl?: string | null;
}) {
  return (
    <Link href={href} className={styles.card} aria-label={`${title} (${provider})`}>
      <span className={`${styles.cardFrame} ${styles.cardFrameTall}`}>
        <CardImage src={imageUrl} alt={title} fallback={title.slice(0, 2)} />
        <span className={styles.providerTag}>{provider}</span>
        <span className={styles.cardOverlay} aria-hidden="true">
          <span className={styles.playBtn}><PlayIcon /></span>
        </span>
      </span>
      <span className={styles.gameName}>{title}</span>
    </Link>
  );
}

/* ---------- Grids / states ---------- */
export function CardGrid({ children, variant = "provider" }: { children: ReactNode; variant?: "provider" | "game" }) {
  return <div className={`${styles.grid} ${variant === "game" ? styles.gridGame : ""}`}>{children}</div>;
}

export function SkeletonGrid({ count = 12, variant = "provider" }: { count?: number; variant?: "provider" | "game" }) {
  return (
    <CardGrid variant={variant}>
      {Array.from({ length: count }).map((_, i) => (
        variant === "provider" ? (
          // provider cards have no text, so the skeleton is just the square
          <span key={i} className={styles.providerSkeleton} aria-hidden="true" />
        ) : (
          <div key={i} className={styles.skeletonCard} aria-hidden="true">
            <span className={`${styles.skeletonMedia} ${styles.cardFrameTall}`} />
            <span className={styles.skeletonLine} />
          </div>
        )
      ))}
    </CardGrid>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className={styles.empty} role="status">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="4" /><path d="M6 12h4M8 10v4" /><circle cx="15.5" cy="11" r="0.8" fill="currentColor" /><circle cx="17.5" cy="13" r="0.8" fill="currentColor" />
      </svg>
      <p className={styles.emptyTitle}>{title}</p>
      {hint && <p className={styles.emptyHint}>{hint}</p>}
      {action}
    </div>
  );
}

export function SectionHeader({ title, count, icon, action, id, plain }: {
  title: string; count?: string; icon?: ReactNode; action?: ReactNode; id?: string;
  /** plain: white title + count as gold text in parentheses, e.g. "เลือกค่ายเกม (41 ค่าย)" (no pill) */
  plain?: boolean;
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={`${styles.sectionTitle} ${plain ? styles.sectionTitlePlain : ""}`} id={id}>
        {icon && <span className={styles.sectionIcon} aria-hidden="true">{icon}</span>}
        {title}
        {count && (plain
          ? <span className={styles.sectionCountPlain}>({count})</span>
          : <span className={styles.sectionCount}>{count}</span>)}
      </h2>
      {action}
    </div>
  );
}
