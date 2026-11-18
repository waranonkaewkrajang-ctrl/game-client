import type { Metadata } from "next";
import { connection } from "next/server";
import { Kanit } from "next/font/google";
import "./globals.css";
import RouteShell from "@/components/landing/RouteShell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { seoOrigin } from "@/lib/seo-origin";

const TITLE = "SNAKE168 | สล็อต คาสิโนสด ยิงปลา เกมไพ่ และโปรแกรมฟุตบอล";
const DESCRIPTION = "SNAKE168 รวมเกมจากหลายสิบค่ายในล็อบบี้เดียว ทั้งสล็อต คาสิโนสด ยิงปลา และเกมไพ่ พร้อมปฏิทินฟุตบอลลีกหลัก ใช้งานได้ทั้งคอมพิวเตอร์และมือถือ";
// Self-hosted by next/font (replaces the Google Fonts @import in globals.css).
// Exposed as --font-kanit; components reference the variable, not the literal family name.
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-kanit",
});

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const canonicalOrigin = seoOrigin();

  return {
    title: TITLE,
    description: DESCRIPTION,
    keywords: ["SNAKE168", "สล็อต", "คาสิโน", "สล็อตออนไลน์", "ค่ายเกม"],
    metadataBase: new URL(canonicalOrigin),

    // บอก Google ว่าเนื้อหาตัวจริงอยู่โดเมนเดียว — กัน 9 โดเมนแย่งคะแนนกันเอง
    alternates: { canonical: "/" },

    // 🎯 Open Graph (Facebook, LINE, Discord)
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: canonicalOrigin,
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
    <html lang="th" className={kanit.variable}>
      <head>
        <link rel="icon" href="/logos.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      {/* 🆕 Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SNAKE168",
              "url": seoOrigin(),
              "inLanguage": "th",
            }),
          }}
        />
      </head>
      <body>
        <ServiceWorkerRegister />
        <RouteShell>{children}</RouteShell>
      </body>
    </html>
  );
}
