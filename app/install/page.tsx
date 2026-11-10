import type { Metadata } from "next";
import InstallGuide from "./InstallGuide";

export const metadata: Metadata = {
  title: "ติดตั้งแอป SNAKE168 – Android และ iPhone",
  description: "วิธีติดตั้งแอป SNAKE168 บน Android (APK) และเพิ่มไว้ที่หน้าจอโฮมบน iPhone",
  alternates: { canonical: "/install" },
};

export default async function InstallPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { os } = await searchParams;
  // ?os=android|ios lets the banner (or a shared link) open a specific guide; anything else = auto-detect
  const initial = os === "android" || os === "ios" ? os : null;
  return <InstallGuide initial={initial} />;
}
