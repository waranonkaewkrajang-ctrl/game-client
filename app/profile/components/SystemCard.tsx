"use client";
import type { User } from "../types";
import { Card, FOCUS, Icon, PRESS, Row, Svg } from "./ui";

export default function SystemCard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const lastLogin = user.last_login_at
    ? new Date(user.last_login_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

  return (
    <Card id="system" title="ระบบ" icon={<Svg size={20}>{Icon.shield}</Svg>} className="flex flex-col">
      <Row label="ใช้งานล่าสุด" last>{lastLogin}</Row>
      <button
        type="button"
        onClick={onLogout}
        className={
          "mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--accent-danger)]/50 " +
          `bg-[var(--accent-danger)]/10 text-sm font-semibold text-red-300 hover:bg-[var(--accent-danger)]/20 lg:mt-auto ${PRESS} ${FOCUS}`
        }
      >
        <Svg size={18}>{Icon.logout}</Svg>
        ออกจากระบบ
      </button>
    </Card>
  );
}
