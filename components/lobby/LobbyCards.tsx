"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import styles from "./lobby.module.css";

/* ---------- Image with skeleton + graceful fallback (no layout shift) ---------- */
function CardImage({ src, alt, fallback, eager = false }: { src?: string | null; alt: string; fallback: string; eager?: boolean }) {
  const [state, setState] = useState<"loading" | "ready" | "error">(src ? "loading" : "error");
  return (
    <span className={styles.media}>
      {state === "loading" && <span className={styles.shimmer} aria-hidden="true" />}
      {state === "error" ? (
        <span className={styles.mediaFallback} aria-hidden="true">{fallback}</span>
      ) : (
        <img
          src={src!}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`${styles.mediaImg} ${state === "ready" ? styles.mediaImgReady : ""}`}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
        />
      )}
    </span>
  );
}

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);

/* ---------- Provider room card ---------- */
export function ProviderCard({ id, imageUrl, gameCount, gamesLabel, playLabel, eager }: {
  id: string; imageUrl?: string | null; gameCount: number; gamesLabel: string; playLabel: string; eager?: boolean;
}) {
  return (
    <Link href={`/lobby/${id}`} className={styles.card} aria-label={`${id} — ${gameCount} ${gamesLabel}`}>
      <span className={styles.cardFrame}>
        <CardImage src={imageUrl} alt={id} fallback={id.slice(0, 2)} eager={eager} />
        <span className={styles.cardOverlay} aria-hidden="true">
          <span className={styles.playBtn}><PlayIcon />{playLabel}</span>
        </span>
      </span>
      <span className={styles.cardMeta}>
        <span className={styles.cardName}>{id}</span>
        <span className={styles.cardCount}>{gameCount.toLocaleString()} {gamesLabel}</span>
      </span>
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
        <div key={i} className={styles.skeletonCard} aria-hidden="true">
          <span className={`${styles.skeletonMedia} ${variant === "game" ? styles.cardFrameTall : ""}`} />
          <span className={styles.skeletonLine} />
        </div>
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

export function SectionHeader({ title, count, icon, action, id }: {
  title: string; count?: string; icon?: ReactNode; action?: ReactNode; id?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle} id={id}>
        {icon && <span className={styles.sectionIcon} aria-hidden="true">{icon}</span>}
        {title}
        {count && <span className={styles.sectionCount}>{count}</span>}
      </h2>
      {action}
    </div>
  );
}
