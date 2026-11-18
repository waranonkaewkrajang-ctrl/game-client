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

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      element.dataset.revealed = "true";
      observer.disconnect();
    }, { threshold: 0.12 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.reveal} ${className ?? ""}`} data-direction={direction}>
      {children}
    </div>
  );
}
