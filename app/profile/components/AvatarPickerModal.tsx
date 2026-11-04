"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AVATARS, avatarSrc } from "../avatars";
import { FOCUS, PRESS } from "./ui";
import styles from "../profile.module.css";

interface Props {
  current: string | null;
  onSave: (id: string) => void;
  onClose: () => void;
}

/** Pick one of the 18 chibi avatars; same dialog shell and focus/scroll handling as the bank modal. */
export default function AvatarPickerModal({ current, onSave, onClose }: Props) {
  const [picked, setPicked] = useState<string | null>(current);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    firstRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose]);

  // focus lands on the current avatar (or the first one)
  const focusId = picked ?? AVATARS[0];

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end justify-center bg-black/70 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-picker-title"
        onClick={(e) => e.stopPropagation()}
        className={
          `${styles.dialog} max-h-[calc(100dvh-32px)] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-[var(--border-accent)] p-5 sm:p-6 ` +
          "bg-[var(--bg-card)] shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        }
      >
        <h2 id="avatar-picker-title" className="text-center text-lg font-semibold text-white">เลือกรูปโปรไฟล์</h2>
        <p className="mb-4 mt-1 text-center text-sm text-[var(--text-secondary)]">รูปที่เลือกจะแสดงบนเครื่องนี้</p>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-2.5">
          {AVATARS.map((id) => {
            const on = picked === id;
            return (
              <button
                key={id}
                ref={id === focusId ? firstRef : undefined}
                type="button"
                aria-pressed={on}
                aria-label={`อวตาร ${Number(id)}`}
                onClick={() => setPicked(id)}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 ${
                  on ? "border-[var(--accent-gold)] shadow-[0_0_0_3px_rgba(234,179,8,0.25)]" : "border-white/10 hover:border-white/30"
                } ${PRESS} ${FOCUS}`}
              >
                <Image src={avatarSrc(id)} alt="" width={128} height={128} unoptimized className="size-full object-cover" />
                {on && (
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-[var(--accent-gold)] text-[#1b1030]" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[50px] flex-1 rounded-full border border-white/15 bg-white/5 font-semibold text-white hover:bg-white/10 ${PRESS} ${FOCUS}`}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={!picked || picked === current}
            onClick={() => picked && onSave(picked)}
            className={
              "min-h-[50px] flex-[2] rounded-full bg-[var(--accent-gold)] font-semibold text-[#1b1030] hover:brightness-110 " +
              `disabled:cursor-not-allowed disabled:opacity-50 ${PRESS} ${FOCUS}`
            }
          >
            ใช้รูปนี้
          </button>
        </div>
      </div>
    </div>
  );
}
