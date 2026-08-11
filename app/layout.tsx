import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import BottomMenu from "@/components/BottomMenu";

const TITLE = "SNAKE168 – เว็บอันดับ 1 ของไทย มั่นคงปลอดภัย 100%";
const DESCRIPTION = "SNAKE168 เว็บสล็อตออนไลน์ ฝากถอนออโต้ ปลอดภัย 100% บริการ 24 ชม.";

export async function generateMetadata(): Promise<Metadata> {
  // 🎯 จับ domain ปัจจุบันแบบ dynamic
  const headersList = await headers();
  const host = headersList.get("host") || "snake1168.online";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return {
    title: TITLE,
    description: DESCRIPTION,
    keywords: ["SNAKE168", "สล็อต", "คาสิโน", "สล็อตออนไลน์", "ฝากถอนออโต้"],
    metadataBase: new URL(baseUrl),

    // 🎯 Open Graph (Facebook, LINE, Discord)
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: baseUrl,
      siteName: "SNAKE168",
      images: [
        {
          url: "/og-image.png",   // ← relative URL → จะกลายเป็น full URL อัตโนมัติ
          width: 1200,
          height: 630,
          alt: "SNAKE168",
        },
      ],
      locale: "th_TH",
      type: "website",
    },

    // 🐦 Twitter Card
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: ["/og-image.png"],
    },

    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/logos.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="app-bg">
        <NavbarWrapper />
        <main>{children}</main>
        <BottomMenu />
      </body>
    </html>
  );
}