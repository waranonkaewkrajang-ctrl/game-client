"use client";
import { GLASS, Section, Toggle } from "./ui";

function SettingRow({ title, hint, children, soon = false, last = false }: { title: string; hint: string; children: React.ReactNode; soon?: boolean; last?: boolean }) {
  return (
    <div className={`flex min-h-[64px] items-center justify-between gap-3 py-2 ${last ? "" : "border-b border-white/[0.07]"}`}>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[15px] font-medium text-white">
          {title}
          {soon && <span className="rounded-full border border-white/15 bg-white/10 px-2 py-px text-[11px] font-medium text-white/70">เร็วๆ นี้</span>}
        </p>
        <p className="text-xs text-fuchsia-100/60">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsCard({ acceptPromo, onTogglePromo }: { acceptPromo: boolean; onTogglePromo: (v: boolean) => void }) {
  return (
    <Section id="settings" title="ตั้งค่า">
      <div className={`${GLASS} px-4`}>
        <SettingRow title="รับโปรโมชัน" hint={acceptPromo ? "เปิดรับโบนัสเมื่อฝากเงิน" : "ฝากเงินโดยไม่รับโบนัส"}>
          <Toggle checked={acceptPromo} onChange={onTogglePromo} label="รับโปรโมชัน" />
        </SettingRow>
        {/* display only — no backend/logic yet, so the switches are disabled */}
        <SettingRow title="ธีมมืด" hint="ใช้ธีมมืดอยู่ในขณะนี้" soon>
          <Toggle checked label="ธีมมืด (เร็วๆ นี้)" disabled />
        </SettingRow>
        <SettingRow title="แจ้งเตือน" hint="แจ้งเตือนโปรโมชันและรายการเงิน" soon last>
          <Toggle checked={false} label="แจ้งเตือน (เร็วๆ นี้)" disabled />
        </SettingRow>
      </div>
    </Section>
  );
}
