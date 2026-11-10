import type { SyntheticEvent } from "react";
import { resolveProviderLogo } from "./providerLogoResolver";
import styles from "./ProviderGameCard.module.css";

export interface ProviderGameCardProps {
  title: string;
  imageUrl: string | null;
  productId: string;
  category?: string | null;
  onLaunch: () => void;
  /** favorite state + toggle (the heart is a separate button: it never launches the game) */
  favorite: boolean;
  onToggleFavorite: () => void;
  /** first visible rows load eagerly, the rest lazily */
  eager?: boolean;
  /** reports the cover's natural width/height (the grid adopts the first one as its cover ratio) */
  onCoverLoad?: (width: number, height: number) => void;
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"
    fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.5s-7.5-4.6-9.3-9.6C1.6 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.4 3.3 4.3 6.4-1.8 5-9.3 9.6-9.3 9.6z" />
  </svg>
);

/**
 * Loading placeholder with the card's exact box: same frame (colour, border, radius), same cover ratio
 * (--cover-ar from the grid) and the same name line height, so swapping it for the real card changes
 * neither colour nor layout. Static (no opacity pulse): the room header already says it is loading.
 */
export function ProviderGameCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
      <span className={styles.frame}>
        <span className={styles.cover} />
      </span>
      <span className={styles.name}>&nbsp;</span>
    </div>
  );
}

/**
 * Game card for every /lobby/[provider] room (design-reference/provider-game-card-favorite-glass.png).
 *
 * Card (div, positioning context)
 * ├── launch button ─ frame ─ cover
 * │                           ├── original artwork (object-fit: contain, no filters)
 * │                           ├── soft glass backdrop (bottom ~13% only, blurred background, faded top edge)
 * │                           └── real provider logo (sharp, above the backdrop)
 * │                  └── game name below the cover
 * └── favorite button (sibling, top-right — not nested in the launch button)
 */
export default function ProviderGameCard({ title, imageUrl, productId, category, onLaunch, favorite, onToggleFavorite, eager, onCoverLoad }: ProviderGameCardProps) {
  const logo = resolveProviderLogo(productId, category);
  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) onCoverLoad?.(img.naturalWidth, img.naturalHeight);
  };

  return (
    <div className={`${styles.card} ${favorite ? styles.isFavorite : ""}`}>
      <button type="button" className={styles.launch} onClick={onLaunch} aria-label={`เล่น ${title} (${productId})`}>
        <span className={styles.frame}>
          <span className={styles.cover}>
            {imageUrl ? (
              // remote API artwork, shown as delivered (no optimiser re-encode); the box reserves its space
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className={styles.coverImg}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                onLoad={handleLoad}
              />
            ) : (
              <span className={styles.noImage}>No Image</span>
            )}
            <span className={styles.logoBackdrop} aria-hidden="true" />
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo.src} alt={logo.name} width={logo.width} height={logo.height} className={styles.logo} loading="lazy" decoding="async" />
            ) : (
              <span className={styles.logoText}>{productId}</span>
            )}
          </span>
        </span>
        <span className={styles.name}>{title}</span>
      </button>

      <button
        type="button"
        className={styles.fav}
        aria-pressed={favorite}
        aria-label={favorite ? `นำ ${title} ออกจากเกมโปรด` : `เพิ่ม ${title} เป็นเกมโปรด`}
        onClick={onToggleFavorite}
      >
        <span className={styles.favCircle}>
          <HeartIcon filled={favorite} />
        </span>
      </button>
    </div>
  );
}
