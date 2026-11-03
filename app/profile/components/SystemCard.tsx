"use client";
import type { User } from "../types";
import { FOCUS, GLASS, Icon, PRESS, Row, Section, Svg } from "./ui";

export default function SystemCard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const lastLogin = user.last_login_at
    ? new Date(user.last_login_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  return (
    <Section id="system" title="ระบบ">
      <div className={`${GLASS} px-4 pb-4`}>
        <Row label="ใช้งานล่าสุด" last>{lastLogin}</Row>
        <button
          type="button"
          onClick={onLogout}
          className={
            "flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl border border-red-400 font-semibold text-white " +
            "bg-linear-to-b from-red-400 via-red-600 to-red-800 " +
            "shadow-[0_8px_16px_rgba(185,28,28,0.35),inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-4px_5px_rgba(127,29,29,0.6)] " +
            `[text-shadow:0_1px_2px_rgba(0,0,0,0.35)] hover:brightness-105 ${PRESS} ${FOCUS}`
          }
        >
          <Svg size={18}>{Icon.logout}</Svg>
          ออกจากระบบ
        </button>
      </div>
    </Section>
  );
}
