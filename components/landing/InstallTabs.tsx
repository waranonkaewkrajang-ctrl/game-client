"use client";

import Link from "next/link";
import { useId, useState } from "react";
import styles from "@/app/landing.module.css";

const TABS = [
  {
    id: "android",
    label: "Android",
    steps: ["ดาวน์โหลดไฟล์ APK ทางการจากหน้าติดตั้ง", "เปิดไฟล์ snake168.apk จากการแจ้งเตือนหรือโฟลเดอร์ดาวน์โหลด", "กด \"ติดตั้ง\" แล้วเปิดแอปได้ทันที"],
    meta: "Android 7.0 ขึ้นไป · ฟรี · ไม่ได้ลงใน Play Store",
    guide: "/guide/android-app",
  },
  {
    id: "iphone",
    label: "iPhone / iPad",
    steps: ["เปิดเว็บไซต์ด้วย Safari", "แตะปุ่มแชร์ แล้วเลือก \"เพิ่มไปยังหน้าจอโฮม\"", "แตะ \"เพิ่ม\" ไอคอน SNAKE168 จะอยู่บนหน้าจอโฮม"],
    meta: "ผ่าน Safari · ไม่ต้องดาวน์โหลดไฟล์ · ฟรี",
    guide: "/guide/iphone-home-screen",
  },
] as const;

/** Accessible tabs (both panels are in the server HTML; the inactive one is `hidden`). */
export default function InstallTabs() {
  const base = useId();
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("android");

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = TABS[(TABS.findIndex((t) => t.id === active) + 1) % TABS.length].id;
    setActive(next);
    document.getElementById(`${base}-tab-${next}`)?.focus();
  };

  return (
    <div className={styles.installTabs}>
      <div role="tablist" aria-label="เลือกอุปกรณ์" className={styles.tabList} onKeyDown={onKey}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`${base}-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls={`${base}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div key={t.id} id={`${base}-panel-${t.id}`} role="tabpanel" aria-labelledby={`${base}-tab-${t.id}`} hidden={active !== t.id} className={styles.tabPanel}>
          <ol>{t.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          <p>{t.meta}</p>
          <div className={styles.tabActions}>
            <Link href={`/install?os=${t.id === "android" ? "android" : "ios"}`} className={`${styles.button} ${styles.primary}`}>ไปหน้าติดตั้ง</Link>
            <Link href={t.guide} className={styles.button}>อ่านคู่มือละเอียด</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
