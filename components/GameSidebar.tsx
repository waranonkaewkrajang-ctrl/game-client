"use client";
import type { ReactNode } from "react";
import type { CategoryItem } from "@/components/lobby/types";
import styles from "./GameSidebar.module.css";

// Christmas (desktop artwork cards), measured on each artwork's alpha channel:
//  top — the card body's top edge as a fraction of the image height (characters poke above the card, so the
//        image top is not the card top); the snow rests on that edge
//  l/r — the crown / hair / hat / shark / cards cross that edge between l% and r% of the width: the long snow
//        piece ends at l%, a short different piece starts at r%, so snow piles up beside the artwork instead of
//        covering it (CARD: r = 92 keeps the snow off the right playing card's top edge)
const SNOW_FIT: Record<string, { top: number; l: number; r: number }> = {
  "/images/game-categories/hot-game.webp": { top: 15 / 189, l: 68, r: 80 },
  "/images/game-categories/casino.webp": { top: 28 / 200, l: 65, r: 89 },
  "/images/game-categories/slot.webp": { top: 16 / 179, l: 61, r: 83 },
  "/images/game-categories/fishing.webp": { top: 10 / 173, l: 66, r: 80 },
  "/images/game-categories/card.webp": { top: 6 / 176, l: 66, r: 92 },
  "/images/game-categories/sport.webp": { top: 15 / 185, l: 55, r: 76 },
};
const DEFAULT_SNOW_FIT = { top: 0.08, l: 60, r: 88 };

interface GameSidebarProps {
  items: CategoryItem[];
  selected: string;
  onSelect: (id: string) => void;
  /** Extra content rendered under the categories on desktop (quick links). */
  footer?: ReactNode;
  ariaLabel?: string;
  /** "sidebar" = desktop list only, "chips" = mobile row only, "rail" = compact mobile vertical rail, "both" (default). */
  variant?: "both" | "sidebar" | "chips" | "rail";
}

/**
 * Category navigation.
 *  - ≥1024px: sticky vertical sidebar
 *  - <1024px: horizontal, swipeable chip row
 * Both share the same items + selection state.
 */
export default function GameSidebar({ items, selected, onSelect, footer, ariaLabel = "Game categories", variant = "both" }: GameSidebarProps) {
  // Compact mobile rail: character crop (no baked-in text) + the category name as real HTML text.
  if (variant === "rail") {
    return (
      <nav className={styles.rail} aria-label={ariaLabel}>
        <ul className={styles.railList}>
          {items.map((cat) => {
            const active = selected === cat.id;
            const hasCount = typeof cat.count === "number" && cat.count > 0;
            return (
              <li key={cat.id || "all"} className={styles.railLi}>
                {/* Christmas: the single Santa hat sits on the active category's upper-left corner (outside the
                    button, whose overflow clips the art); decorative only */}
                {active && <span className={styles.railHat} aria-hidden="true" />}
                <button
                  type="button"
                  className={`${styles.railItem} ${active ? styles.railItemActive : ""}`}
                  aria-pressed={active}
                  onClick={() => onSelect(cat.id)}
                >
                  {/* one unified card: the artwork fills the whole button, the label sits on its lower part */}
                  <img
                    src={cat.thumb ?? cat.icon}
                    alt=""
                    width={cat.thumb ? 234 : 40}
                    height={cat.thumb ? 186 : 40}
                    className={cat.thumb ? styles.railImg : styles.railIcon}
                    decoding="async"
                    draggable={false}
                  />
                  <span className={styles.railLabel}>{cat.label}</span>
                  {hasCount && <span className={styles.srOnly}> ({cat.count!.toLocaleString()} games)</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <>
      {variant !== "chips" && (
      <nav className={styles.sidebar} aria-label={ariaLabel}>
        <ul className={styles.list}>
          {items.map((cat) => {
            const active = selected === cat.id;
            const hasCount = typeof cat.count === "number" && cat.count > 0;
            // Design C: the card artwork already shows the English + Thai label, so the text (and count) stay
            // in the button for screen readers only — nothing is drawn on top of the art.
            if (cat.art) {
              const fit = SNOW_FIT[cat.art.src] ?? DEFAULT_SNOW_FIT;
              return (
                <li
                  key={cat.id || "all"}
                  className={styles.artLi}
                  style={{ ["--card-top" as string]: fit.top, ["--snow-l" as string]: fit.l, ["--snow-r" as string]: fit.r }}
                >
                  {/* Christmas: same Santa hat as the mobile rail, on the active card's upper-left corner */}
                  {active && <span className={styles.artHat} aria-hidden="true" />}
                  <button
                    type="button"
                    className={`${styles.artItem} ${active ? styles.artItemActive : ""}`}
                    aria-pressed={active}
                    onClick={() => onSelect(cat.id)}
                  >
                    <img
                      src={cat.art.src}
                      alt=""
                      width={cat.art.width}
                      height={cat.art.height}
                      className={styles.artImg}
                      decoding="async"
                      loading="lazy" /* the desktop sidebar is display:none on phones — lazy keeps them from downloading there */
                      draggable={false}
                    />
                    <span className={styles.srOnly}>
                      {cat.title} {cat.label}{hasCount ? ` (${cat.count!.toLocaleString()} games)` : ""}
                    </span>
                  </button>
                </li>
              );
            }
            return (
              <li key={cat.id || "all"}>
                <button
                  type="button"
                  className={`${styles.item} ${active ? styles.itemActive : ""}`}
                  aria-pressed={active}
                  onClick={() => onSelect(cat.id)}
                >
                  <span className={styles.iconWrap}>
                    <img src={cat.icon} alt="" width={40} height={40} className={styles.icon} />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.title}>{cat.title}</span>
                    <span className={styles.label}>{cat.label}</span>
                  </span>
                  {typeof cat.count === "number" && cat.count > 0 && (
                    <span className={styles.count} aria-label={`${cat.count} games`}>{cat.count.toLocaleString()}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {footer && <div className={styles.footer}>{footer}</div>}
      </nav>
      )}

      {variant !== "sidebar" && (
      <nav className={styles.chips} aria-label={ariaLabel}>
        {items.map((cat) => {
          const active = selected === cat.id;
          return (
            <button
              key={cat.id || "all"}
              type="button"
              className={`${styles.chip} ${active ? styles.chipActive : ""}`}
              aria-pressed={active}
              onClick={(e) => {
                onSelect(cat.id);
                // bring the chosen chip fully into view on narrow screens
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                e.currentTarget.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
              }}
            >
              <img src={cat.icon} alt="" width={26} height={26} className={styles.chipIcon} />
              <span className={styles.chipLabel}>{cat.label}</span>
              {typeof cat.count === "number" && cat.count > 0 && (
                <span className={styles.chipCount}>{cat.count.toLocaleString()}</span>
              )}
            </button>
          );
        })}
      </nav>
      )}
    </>
  );
}
