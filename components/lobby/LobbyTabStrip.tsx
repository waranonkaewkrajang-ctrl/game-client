'use client';

import { useEffect, useId, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import styles from './lobby.module.css';

export default function LobbyTabStrip({ activeKey, children }: { activeKey: string; children: ReactNode }) {
  const strip = useRef<HTMLDivElement>(null);
  const id = useId();
  const drag = useRef<{ x: number; left: number; pointer: number } | null>(null);
  const dragged = useRef(false);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });

  useEffect(() => {
    const element = strip.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      const end = Math.max(0, element.scrollWidth - element.clientWidth);
      const next = { overflow: end > 4, left: element.scrollLeft > 4, right: element.scrollLeft < end - 4 };
      setEdges(previous => previous.overflow === next.overflow && previous.left === next.left && previous.right === next.right ? previous : next);
    };
    const measure = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    element.addEventListener('scroll', measure, { passive: true });
    let mounted = true;
    void document.fonts.ready.then(() => { if (mounted) measure(); });
    measure();
    return () => { mounted = false; observer.disconnect(); element.removeEventListener('scroll', measure); cancelAnimationFrame(frame); };
  }, [children]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = strip.current;
      const active = element?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!element || !active || element.scrollWidth <= element.clientWidth) return;
      const outer = element.getBoundingClientRect(), inner = active.getBoundingClientRect();
      const delta = inner.left < outer.left ? inner.left - outer.left : inner.right > outer.right ? inner.right - outer.right : 0;
      if (delta) element.scrollBy({ left: delta, behavior: 'auto' });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeKey]);

  function move(direction: number) {
    const element = strip.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.max(120, element.clientWidth * 0.8), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    dragged.current = false;
    // Touch uses native inertial scrolling; mouse dragging is an extra desktop affordance.
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, pointer: event.pointerId };
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || event.pointerId !== start.pointer || !(event.buttons & 1)) return;
    const delta = event.clientX - start.x;
    if (!dragged.current && Math.abs(delta) < 6) return;
    dragged.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.scrollLeft = start.left - delta;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
  }

  return <div className={`${styles.tabsFrame} ${edges.overflow ? styles.tabsScrollable : ''}`}>
    <button type="button" className={styles.tabArrow} aria-label="เลื่อนหมวดหมู่ไปทางซ้าย" aria-controls={id} disabled={!edges.left} onClick={() => move(-1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg></button>
    <div ref={strip} id={id} className={styles.tabs} role="group" aria-label="หมวดหมู่ใน Lobby" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={event => { endDrag(event); dragged.current = false; }} onClickCapture={event => { if (dragged.current) { event.preventDefault(); event.stopPropagation(); dragged.current = false; } }}>{children}</div>
    <button type="button" className={styles.tabArrow} aria-label="เลื่อนหมวดหมู่ไปทางขวา" aria-controls={id} disabled={!edges.right} onClick={() => move(1)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></button>
  </div>;
}
