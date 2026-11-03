"use client";
import type { User } from "../types";
import { CopyButton, GLASS, Row, Section } from "./ui";

export default function PersonalInfo({ user }: { user: User }) {
  const active = user.status === "active";
  return (
    <Section id="personal" title="ข้อมูลส่วนตัว">
      <div className={`${GLASS} px-4`}>
        <Row label="เบอร์โทรศัพท์">
          <span className="tabular-nums">{user.phone || "-"}</span>
        </Row>
        <Row label="สถานะบัญชี">
          <span className={`inline-flex items-center gap-1.5 ${active ? "text-emerald-300" : ""}`}>
            {active && <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />}
            {active ? "ปกติ" : user.status || "-"}
          </span>
        </Row>
        <Row label="รหัสแนะนำเพื่อน" last>
          <span className="truncate font-semibold tracking-wide text-[#eab308]">{user.referral_code || "-"}</span>
          <CopyButton value={user.referral_code || "-"} label="รหัสแนะนำเพื่อน" />
        </Row>
      </div>
    </Section>
  );
}
