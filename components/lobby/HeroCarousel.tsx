"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./HeroCarousel.module.css";

// Banner payload from GET /banners — accepted in the same shapes the old lobby
// handled: a plain URL string or an object with image_url / image.
export type BannerLike = string | { image_url?: string | null; image?: string | null; [key: string]: unknown };

const srcOf = (b: BannerLike): string =>
  typeof b === "string" ? b : (b?.image_url || b?.image || "") as string;

const CLONES = 2;
const AUTOPLAY_MS = 5000;
const SWIPE_PX = 40;

interface HeroCarouselProps {
  banners: BannerLike[];
  href?: string;
  loading?: boolean;
  label?: string;
}

export default function HeroCarousel({ banners, href = "/promotions", loading = false, label = "Promotions" }: HeroCarouselProps) {
  const n = banners.length;
  const looping = n > 1;
  // Extended list: [..last CLONES, ...real, ..first CLONES] for a seamless loop.
  const slides: BannerLike[] = looping
    ? [...Array.from({ length: CLONES }, (_, i) => banners[(n - CLONES + i + n * CLONES) % n]),
       ...banners,
       ...Array.from({ length: CLONES }, (_, i) => banners[i % n])]
    : banners;
  const offset = looping ? CLONES : 0;

  const [pos, setPos] = useState(offset);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);          // hover / focus
  const [userPaused, setUserPaused] = useState(false);  // explicit pause button (WCAG 2.2.2)
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failed, setFailed] = useState<Record<string, true>>({});
  const pointerX = useRef<number | null>(null);
  const dragged = useRef(false);

  // reset when the banner set changes (adjust state during render — no effect)
  const [prevN, setPrevN] = useState(n);
  if (prevN !== n) {
    setPrevN(n);
    setAnimate(false);
    setPos(offset);
  }

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // re-enable the transition one frame after an instant jump
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const go = useCallback((delta: number) => {
    if (!looping) return;
    setAnimate(true);
    setPos((p) => {
      // normalise first in case a transitionend was missed (e.g. hidden tab)
      let base = p;
      if (base >= n + offset) base -= n;
      if (base < offset) base += n;
      return base + delta;
    });
  }, [looping, n, offset]);

  // autoplay
  useEffect(() => {
    if (!looping || paused || userPaused || reducedMotion) return;
    const t = setInterval(() => { if (!document.hidden) go(1); }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [looping, paused, userPaused, reducedMotion, go]);

  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform" || !looping) return;
    if (pos >= n + offset) { setAnimate(false); setPos(pos - n); }
    else if (pos < offset) { setAnimate(false); setPos(pos + n); }
  };

  const activeReal = looping ? (((pos - offset) % n) + n) % n : 0;

  if (loading) {
    return <div className={styles.root} aria-hidden="true"><div className={styles.viewport}><div className={`${styles.slide} ${styles.skeleton}`} /></div></div>;
  }
  if (n === 0) return null;

  return (
    <section
      className={styles.root}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={styles.viewport}
        onPointerDown={(e) => { pointerX.current = e.clientX; dragged.current = false; }}
        onPointerUp={(e) => {
          if (pointerX.current === null) return;
          const dx = e.clientX - pointerX.current;
          pointerX.current = null;
          if (Math.abs(dx) > SWIPE_PX) { dragged.current = true; go(dx < 0 ? 1 : -1); }
        }}
        onPointerCancel={() => { pointerX.current = null; }}
      >
        <div
          className={styles.track}
          style={{ ["--pos" as string]: pos, transition: animate ? undefined : "none" }}
          onTransitionEnd={onTransitionEnd}
        >
          {slides.map((b, i) => {
            const src = srcOf(b);
            const isActive = i === pos;
            const realIndex = looping ? (((i - offset) % n) + n) % n : i;
            const isClone = looping && (i < offset || i >= n + offset);
            const broken = !src || failed[src];
            return (
              <div
                key={i}
                className={`${styles.slide} ${isActive ? styles.slideActive : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${realIndex + 1} / ${n}`}
                aria-hidden={!isActive || isClone}
              >
                <Link
                  href={href}
                  className={styles.link}
                  tabIndex={isActive ? 0 : -1}
                  draggable={false}
                  onClick={(e) => { if (dragged.current) { e.preventDefault(); dragged.current = false; } }}
                >
                  {broken ? (
                    <span className={styles.fallback} />
                  ) : (
                    <>
                      <span className={styles.backdrop} style={{ backgroundImage: `url("${src}")` }} aria-hidden="true" />
                      <img
                        src={src}
                        alt={`Banner ${realIndex + 1}`}
                        className={styles.img}
                        draggable={false}
                        decoding="async"
                        loading={i === offset ? "eager" : "lazy"}
                        fetchPriority={i === offset ? "high" : "auto"}
                        onError={() => setFailed((f) => ({ ...f, [src]: true }))}
                      />
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {looping && (
        <>
          <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`} onClick={() => go(-1)} aria-label="Previous banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} onClick={() => go(1)} aria-label="Next banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </button>
          {!reducedMotion && (
            <button
              type="button"
              className={styles.pause}
              onClick={() => setUserPaused((v) => !v)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={userPaused}
            >
              {userPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              )}
            </button>
          )}
          <div className={styles.dots}>
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                className={styles.dot}
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === activeReal}
                onClick={() => { setAnimate(true); setPos(i + offset); }}
              >
                <span className={`${styles.dotPill} ${i === activeReal ? styles.dotPillActive : ""}`} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
