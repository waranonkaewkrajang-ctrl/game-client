"use client";
import Image from "next/image";
import { useState } from "react";
import type { User } from "../types";
import { BANK_LIST } from "../types";
import { Card, CopyButton, FOCUS, GOLD_BTN, INNER, Icon, PRESS, Svg } from "./ui";

/** Group 10-digit account numbers in the common Thai 3-1-5-1 layout (xxx-x-xxxxx-x); anything else is shown as-is. */
function formatAccount(raw?: string | null) {
  if (!raw) return "-";
  const d = raw.replace(/\D/g, "");
  return d.length === 10 && d === raw.trim() ? `${d.slice(0, 3)}-${d.slice(3, 4)}-${d.slice(4, 9)}-${d.slice(9)}` : raw;
}

export default function BankSection({ user, onChangeBank }: { user: User; onChangeBank: () => void }) {
  const code = user.bank_code || "BAY";
  const [src, setSrc] = useState(`/logos/${code}.webp`);
  const bankName = BANK_LIST.find((b) => b.code === user.bank_code)?.name;

  return (
    <Card id="bank" title="บัญชีธนาคาร" icon={<Svg size={20}>{Icon.card}</Svg>} className="flex flex-col">
      <div className={`${INNER} flex items-center gap-3 p-3`}>
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white p-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
          <Image src={src} alt={user.bank_code || "ธนาคาร"} width={40} height={40} className="size-10 object-contain" onError={() => setSrc("/logos/BBL.webp")} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{bankName || user.bank_code || "ธนาคาร"}</p>
            <span className="shrink-0 text-xs font-semibold text-emerald-300">อนุมัติ</span>
          </div>
          {/* the copy button copies the raw number, not the grouped one */}
          <p className="truncate font-[family-name:var(--font-mono)] text-[15px] font-medium tracking-wide text-[var(--text-primary)]">{formatAccount(user.bank_account)}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">{user.bank_name || "-"}</p>
        </div>
        <CopyButton value={user.bank_account} label="เลขบัญชี" />
      </div>

      <button type="button" onClick={onChangeBank} className={`${GOLD_BTN} ${PRESS} ${FOCUS} mt-4 w-full bg-[image:var(--gradient-gold)] lg:mt-auto`}>
        <Svg size={18}>{Icon.edit}</Svg>
        แจ้งเปลี่ยนเลขบัญชี
      </button>
    </Card>
  );
}
