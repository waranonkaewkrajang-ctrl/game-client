"use client";
import { memo, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getNotificationSnapshot, getServerNotificationSnapshot, markAllRead, markRead, startNotifications, subscribeNotifications,
} from "@/lib/notifications/store";
import type { AppNotification } from "@/lib/notifications/types";
import navStyles from "./Navbar.module.css";
import styles from "./NotificationBell.module.css";

const RING: Keyframe[] = [
  { transform: "rotate(0)" }, { transform: "rotate(14deg)" }, { transform: "rotate(-12deg)" }, { transform: "rotate(8deg)" },
  { transform: "rotate(-6deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0)" },
];

/** Team crest from the feed; falls back to the team's first letter when missing or it fails to load. */
function TeamCrest({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className={`${styles.crest} ${styles.crestFallback}`}>{name.trim().charAt(0) || "?"}</span>;
  return (
    <span className={styles.crest}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote crest, same pattern as the /live fixtures */}
      <img src={src} alt="" width={26} height={26} loading="lazy" decoding="async" onError={() => setFailed(true)} />
    </span>
  );
}

const NotificationItem = memo(function NotificationItem({ item, read, onOpen }: { item: AppNotification; read: boolean; onOpen: (id: string) => void }) {
  const teams = item.title.split(" VS ");
  const body = (
    <>
      {item.images ? (
        <span className={styles.crests} aria-hidden="true">
          {item.images.slice(0, 2).map((src, index) => <TeamCrest key={index} src={src} name={teams[index] ?? ""} />)}
        </span>
      ) : (
        <span className={styles.crests} aria-hidden="true"><span className={`${styles.crest} ${styles.crestFallback}`}>!</span></span>
      )}
      <span className={styles.text}>
        {item.context && <span className={styles.context}>{item.context}</span>}
        <span className={styles.title}>{item.title}</span>
        <span className={styles.meta}>
          {item.status && <span className={`${styles.status} ${item.status.tone === "live" ? styles.statusLive : styles.statusSoon}`}>{item.status.label}</span>}
          <span className={styles.metaText}>{item.body}</span>
        </span>
      </span>
      {item.action && <span className={styles.action} aria-hidden="true">{item.action} ›</span>}
    </>
  );
  const className = `${styles.item} ${read ? styles.itemRead : styles.itemUnread}`;
  return (
    <li className={styles.row}>
      {item.href ? (
        <Link href={item.href} className={className} onClick={() => onOpen(item.id)} aria-label={`${item.context ? `${item.context} ` : ""}${item.title} ${item.body}${read ? "" : " (ยังไม่อ่าน)"}`}>{body}</Link>
      ) : (
        <button type="button" className={className} onClick={() => markRead(item.id)}>{body}</button>
      )}
      {!read && (
        <button type="button" className={styles.markOne} onClick={() => markRead(item.id)} aria-label={`ทำเครื่องหมายว่าอ่านแล้ว: ${item.title}`} title="ทำเครื่องหมายว่าอ่านแล้ว">
          <span className={styles.unreadDot} aria-hidden="true" />
        </button>
      )}
    </li>
  );
});

/** Header bell: unread count (1–9+), one gentle ring per new batch, dropdown with per-item and "mark all" read. */
export default function NotificationBell({ username }: { username: string }) {
  const snap = useSyncExternalStore(subscribeNotifications, getNotificationSnapshot, getServerNotificationSnapshot);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // Ring counter already seen at mount — a remount (page navigation) must not replay an old ring.
  const seenRing = useRef(getNotificationSnapshot().ring);
  const panelId = useId();

  const openItem = useCallback((id: string) => { markRead(id); setOpen(false); }, []);

  useEffect(() => startNotifications(username), [username]);

  useEffect(() => {
    if (snap.ring === seenRing.current) return;
    seenRing.current = snap.ring;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    imgRef.current?.animate?.(RING, { duration: 900, easing: "ease-in-out", iterations: 1 });
  }, [snap.ring]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!wrapRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);

  const count = snap.unread > 9 ? "9+" : String(snap.unread);
  const label = snap.unread ? `แจ้งเตือน (ยังไม่อ่าน ${snap.unread} รายการ)` : "แจ้งเตือน";

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <button
        ref={buttonRef}
        type="button"
        className={navStyles.bell}
        aria-label={label}
        title="แจ้งเตือน"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(value => !value)}
      >
        {/* gold bell artwork: transparent cut-out of public/icons/notification-bell.webp (169×192, lossless) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- existing bell artwork, unchanged */}
        <img ref={imgRef} src="/icons/notification-bell-cut.webp" alt="" width={26} height={26} className={`${navStyles.bellImg} ${styles.bellImg}`} draggable={false} decoding="async" />
        {snap.unread > 0 && <span className={styles.badge} aria-hidden="true">{count}</span>}
      </button>

      {open && (
        <div id={panelId} className={styles.panel} role="dialog" aria-label="การแจ้งเตือน">
          <div className={styles.head}>
            <strong className={styles.heading}>การแจ้งเตือน{snap.unread > 0 && <span className={styles.headCount}>{snap.unread}</span>}</strong>
            <button type="button" className={styles.markAll} onClick={markAllRead} disabled={snap.unread === 0}>อ่านทั้งหมด</button>
          </div>

          {snap.items.length === 0 ? (
            <p className={styles.empty}>{snap.failed ? "กำลังเชื่อมต่อการแจ้งเตือน ระบบจะลองใหม่อัตโนมัติ" : "ยังไม่มีการแจ้งเตือน"}</p>
          ) : (
            <ul className={styles.list}>
              {snap.items.map(item => (
                <NotificationItem key={item.id} item={item} read={snap.isRead(item.id)} onOpen={openItem} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
