"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import type { BankChangeForm } from "../types";
import { BANK_LIST } from "../types";
import { alertBox } from "../lib";
import { FOCUS, PRESS } from "./ui";
import styles from "../profile.module.css";

interface Props {
  initialBankCode: string;
  initialName: string;
  onClose: () => void;
}

type ApiError = { response?: { data?: { message?: string } } };

const FIELD =
  "w-full rounded-xl border border-white/20 bg-black/35 px-3 text-base text-white placeholder:text-white/40 " +
  "shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-none focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-300/25";

function BankLogo({ code }: { code: string }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return <span className="size-7 shrink-0" aria-hidden="true" />;
  return (
    <Image src={`/logos/${code}.webp`} alt="" width={28} height={28} className="size-7 shrink-0 rounded-md bg-white object-contain p-0.5" onError={() => setHidden(true)} />
  );
}

/** Same flow as before: POST /bank-change with { new_bank_code, new_bank_account, new_bank_name }. */
export default function BankChangeModal({ initialBankCode, initialName, onClose }: Props) {
  const [bankForm, setBankForm] = useState<BankChangeForm>({ new_bank_code: initialBankCode || "KBANK", new_bank_account: "", new_bank_name: initialName || "" });
  const [submitting, setSubmitting] = useState(false);
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const firstRef = useRef<HTMLButtonElement>(null);

  // on open: move focus into the dialog and lock page scroll; restore both on close
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    firstRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  // Escape closes the bank list first, then the dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (bankDropdownOpen) setBankDropdownOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, bankDropdownOpen]);

  const submitBankChange = async () => {
    if (!bankForm.new_bank_account || !bankForm.new_bank_name) {
      alertBox({ icon: "warning", title: "กรอกไม่ครบ", text: "กรุณากรอกให้ครบ", confirmButtonColor: "#eab308" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/bank-change", bankForm);
      onClose();
      alertBox({ icon: "success", title: "ส่งคำขอสำเร็จ", text: res.data.message, confirmButtonColor: "#10b981" });
    } catch (err) {
      alertBox({ icon: "error", title: "ไม่สำเร็จ", text: (err as ApiError).response?.data?.message || "กรุณาลองใหม่", confirmButtonColor: "#dc2626" });
    }
    setSubmitting(false);
  };

  const selected = BANK_LIST.find((b) => b.code === bankForm.new_bank_code);

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-end justify-center bg-black/70 p-4 pb-[max(16px,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-change-title"
        onClick={(e) => e.stopPropagation()}
        className={
          `${styles.dialog} max-h-[calc(100dvh-32px)] w-full max-w-[420px] overflow-y-auto rounded-3xl border border-pink-500/40 p-6 ` +
          "bg-linear-to-b from-purple-900/95 to-pink-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_2px_3px_rgba(255,255,255,0.12)]"
        }
      >
        <h2 id="bank-change-title" className="text-center text-lg font-semibold text-white">แจ้งเปลี่ยนเลขบัญชี</h2>
        <p className="mb-5 mt-1 text-center text-sm text-fuchsia-100/75">กรอกข้อมูลบัญชีใหม่ รอแอดมินตรวจสอบ</p>

        <span id="bank-picker-label" className="mb-1.5 block text-sm font-semibold text-fuchsia-100">ธนาคาร</span>
        <div className="relative mb-4">
          <button
            ref={firstRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={bankDropdownOpen}
            aria-labelledby="bank-picker-label bank-picker-value"
            onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
            className={`${FIELD} flex min-h-[50px] items-center gap-2.5 text-left ${FOCUS}`}
          >
            <BankLogo key={bankForm.new_bank_code} code={bankForm.new_bank_code} />
            <span id="bank-picker-value" className="flex-1">{selected?.name || "เลือกธนาคาร"}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className={`transition-transform ${bankDropdownOpen ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {bankDropdownOpen && (
            <ul
              role="listbox"
              aria-labelledby="bank-picker-label"
              className="absolute inset-x-0 top-[calc(100%+4px)] z-10 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            >
              {BANK_LIST.map((b) => (
                <li key={b.code} role="option" aria-selected={b.code === bankForm.new_bank_code}>
                  <button
                    type="button"
                    onClick={() => { setBankForm({ ...bankForm, new_bank_code: b.code }); setBankDropdownOpen(false); }}
                    className={`flex min-h-[44px] w-full items-center gap-2.5 px-3 text-left text-sm text-slate-900 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none ${
                      b.code === bankForm.new_bank_code ? "bg-fuchsia-50 font-semibold" : ""
                    }`}
                  >
                    <BankLogo code={b.code} />
                    {b.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label htmlFor="new-bank-account" className="mb-1.5 block text-sm font-semibold text-fuchsia-100">เลขบัญชีใหม่</label>
        <input
          id="new-bank-account"
          value={bankForm.new_bank_account}
          onChange={(e) => setBankForm({ ...bankForm, new_bank_account: e.target.value })}
          placeholder="กรอกเลขบัญชี"
          inputMode="numeric"
          autoComplete="off"
          className={`${FIELD} mb-4 h-[50px]`}
        />

        <label htmlFor="new-bank-name" className="mb-1.5 block text-sm font-semibold text-fuchsia-100">ชื่อบัญชี (ตามที่สมัคร)</label>
        <input
          id="new-bank-name"
          value={bankForm.new_bank_name}
          onChange={(e) => setBankForm({ ...bankForm, new_bank_name: e.target.value })}
          placeholder="ชื่อ-นามสกุล"
          autoComplete="name"
          className={`${FIELD} mb-6 h-[50px]`}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[50px] flex-1 rounded-2xl border border-white/25 bg-black/30 font-semibold text-white hover:bg-black/40 ${PRESS} ${FOCUS}`}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={submitBankChange}
            disabled={submitting}
            className={
              "min-h-[50px] flex-[2] rounded-2xl border border-yellow-300 bg-linear-to-b from-yellow-200 to-[#eab308] font-semibold text-yellow-950 " +
              `shadow-[0_6px_12px_rgba(202,138,4,0.4),inset_0_2px_3px_rgba(255,255,255,0.6)] disabled:cursor-not-allowed disabled:opacity-70 ${PRESS} ${FOCUS}`
            }
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำขอ"}
          </button>
        </div>
      </div>
    </div>
  );
}
