"use client";
import type { ReactNode } from "react";
import type { CategoryItem } from "@/components/lobby/types";
import styles from "./GameSidebar.module.css";

interface GameSidebarProps {
  items: CategoryItem[];
  selected: string;
  onSelect: (id: string) => void;
  /** Extra content rendered under the categories on desktop (quick links). */
  footer?: ReactNode;
  ariaLabel?: string;
  /** "sidebar" = desktop list only, "chips" = mobile row only, "both" (default). */
  variant?: "both" | "sidebar" | "chips";
}

/**
 * Category navigation.
 *  - ≥1024px: sticky vertical sidebar
 *  - <1024px: horizontal, swipeable chip row
 * Both share the same items + selection state.
 */
export default function GameSidebar({ items, selected, onSelect, footer, ariaLabel = "Game categories", variant = "both" }: GameSidebarProps) {
  return (
    <>
      {variant !== "chips" && (
      <nav className={styles.sidebar} aria-label={ariaLabel}>
        <ul className={styles.list}>
          {items.map((cat) => {
            const active = selected === cat.id;
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
