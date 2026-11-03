import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "โปรไฟล์ของฉัน | SNAKE168",
  description: "จัดการบัญชี กระเป๋าเงิน รับโบนัส และติดตามอันดับ VIP",
  robots: { index: false, follow: false }, // member page = no index
};

export default function ProfilePage() {
  return <ProfileClient />;
}
