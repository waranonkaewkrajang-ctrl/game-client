"use client";
import type { ReactNode } from "react";
import { Card, Icon, Svg, Toggle } from "./ui";

function SettingRow({ title, hint, children, soon = false, last = false }: { title: string; hint: string; children: ReactNode; soon?: boolean; last?: boolean }) {
  return (
    <div className={`flex min-h-14 items-center justify-between gap-3 py-1.5 ${last ? "" : "border-b border-white/[0.06]"}`}>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 text-[15px] font-medium text-[var(--text-primary)]">
          {title}
          {soon && <span className="rounded-full bg-white/10 px-2 py-px text-xs font-medium text-[var(--text-secondary)]">เร็วๆ นี้</span>}
        </p>
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsCard({ acceptPromo, onTogglePromo, className = "" }: { acceptPromo: boolean; onTogglePromo: (v: boolean) => void; className?: string }) {
  return (
    <Card id="settings" title="ตั้งค่า" icon={<Svg size={20}>{Icon.settings}</Svg>} className={className}>
      <SettingRow title="รับโปรโมชัน" hint={acceptPromo ? "เปิดรับโบนัสเมื่อฝากเงิน" : "ฝากเงินโดยไม่รับโบนัส"}>
        <Toggle checked={acceptPromo} onChange={onTogglePromo} label="รับโปรโมชัน" />
      </SettingRow>
      {/* display only — no backend/logic yet, so the switches are disabled */}
      <SettingRow title="ธีมมืด" hint="ใช้ธีมมืดอยู่ในขณะนี้" soon>
        <Toggle checked label="ธีมมืด (เร็วๆ นี้)" disabled />
      </SettingRow>
      <SettingRow title="แจ้งเตือน" hint="โปรโมชันและรายการเงิน" soon last>
        <Toggle checked={false} label="แจ้งเตือน (เร็วๆ นี้)" disabled />
      </SettingRow>
    </Card>
  );
}
