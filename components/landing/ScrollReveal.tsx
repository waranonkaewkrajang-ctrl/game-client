"use client";

import { useEffect, useRef } from "react";
import styles from "@/app/landing.module.css";

export default function ScrollReveal({
  children,
  direction,
  className,
}: {
  children: React.ReactNode;
  direction: "left" | "right";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // content is hidden only after hydration and only while still below the fold,
    // so the server HTML (SEO / no-JS) and anything already on screen never disappear
    if (element.getBoundingClientRect().top < window.innerHeight * 0.85) return;

    element.dataset.state = "armed";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.dataset.state = "shown";
      observer.disconnect();
    }, { threshold: 0.2, rootMargin: "0px 0px -15% 0px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${className ?? ""}`} data-direction={direction}>
      {children}
    </div>
  );
}
