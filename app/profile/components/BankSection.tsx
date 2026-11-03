"use client";
import Image from "next/image";
import { useState } from "react";
import type { User } from "../types";
import { BANK_LIST } from "../types";
import { CopyButton, FOCUS, GLASS, Icon, PRESS, Section, Svg } from "./ui";

export default function BankSection({ user, onChangeBank }: { user: User; onChangeBank: () => void }) {
  const code = user.bank_code || "BAY";
  const [src, setSrc] = useState(`/logos/${code}.webp`);
  const bankName = BANK_LIST.find((b) => b.code === user.bank_code)?.name;

  return (
    <Section id="bank" title="บัญชีธนาคาร">
      <div className={`${GLASS} p-4`}>
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white p-2 shadow-[0_6px_14px_rgba(0,0,0,0.35)]">
            <Image
              src={src}
              alt={user.bank_code || "ธนาคาร"}
              width={48}
              height={48}
              className="size-12 object-contain"
              onError={() => setSrc("/logos/BBL.webp")}
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm text-fuchsia-100/70">{bankName || user.bank_code || "ธนาคาร"}</p>
              <span className="shrink-0 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-px text-[11px] font-semibold text-emerald-300">อนุมัติ</span>
            </div>
            <p className="truncate text-lg font-semibold tabular-nums tracking-wider text-white">{user.bank_account || "-"}</p>
            <p className="truncate text-xs text-fuchsia-100/65">{user.bank_name || "-"}</p>
          </div>
          <CopyButton value={user.bank_account} label="เลขบัญชี" />
        </div>

        <button
          type="button"
          onClick={onChangeBank}
          className={
            "mt-4 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-yellow-300 font-semibold text-yellow-950 " +
            "bg-linear-to-b from-yellow-200 via-[#eab308] to-yellow-600 " +
            "shadow-[0_8px_16px_rgba(202,138,4,0.35),inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-4px_5px_rgba(133,77,14,0.55)] " +
            `hover:brightness-105 ${PRESS} ${FOCUS}`
          }
        >
          <Svg size={18}>{Icon.edit}</Svg>
          แจ้งเปลี่ยนเลขบัญชี
        </button>
      </div>
    </Section>
  );
}
