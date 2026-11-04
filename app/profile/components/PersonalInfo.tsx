"use client";
import type { User } from "../types";
import { Card, Icon, Row, Svg } from "./ui";

export default function PersonalInfo({ user }: { user: User }) {
  const active = user.status === "active";
  return (
    <Card id="personal" title="ข้อมูลส่วนตัว" icon={<Svg size={20}>{Icon.user}</Svg>}>
      <Row label="ชื่อผู้ใช้">
        <span className="truncate">{user.username}</span>
      </Row>
      <Row label="เบอร์โทรศัพท์">
        <span className="tabular-nums">{user.phone || "-"}</span>
      </Row>
      <Row label="สถานะบัญชี" last>
        <span className={`inline-flex items-center gap-1.5 ${active ? "text-emerald-300" : ""}`}>
          {active && <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />}
          {active ? "ปกติ" : user.status || "-"}
        </span>
      </Row>
    </Card>
  );
}
