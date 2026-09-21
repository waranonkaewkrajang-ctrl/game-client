"use client";
import { useEffect } from "react";
import api from "@/lib/api";

type Theme = Record<string, string | number>;

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}`;
};

// โหลดฟอนต์จาก Google Fonts ตามที่เลือกในหลังบ้าน
const loadFont = (font: string) => {
  if (!font || font === "Inter") return;
  const id = "theme-font-link";
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@300;400;500;600;700&display=swap`;
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
};

const applyTheme = (t: Theme) => {
  const root = document.documentElement.style;
  const colors: Record<string, string> = {
    primary: "--color-primary",
    primary_light: "--color-primary-light",
    accent: "--color-accent",
    accent_dark: "--color-accent-dark",
    success: "--color-success",
    danger: "--color-danger",
    bg: "--color-bg",
    surface: "--color-surface",
    text: "--color-text",
    text_muted: "--color-text-muted",
  };
  for (const [key, cssVar] of Object.entries(colors)) {
    if (typeof t[key] === "string") root.setProperty(cssVar, t[key] as string);
  }

  const depth = Number(t.btn_depth ?? 0);
  const glow = Number(t.glow ?? 40) / 100;

  root.setProperty("--radius", `${Number(t.radius ?? 8)}px`);
  root.setProperty("--btn-depth", `${depth}px`);
  root.setProperty("--btn-press", `${Math.round(depth * 0.6)}px`);
  root.setProperty("--btn-shine", depth > 0 ? "0.35" : "0");

  if (typeof t.accent === "string")  root.setProperty("--glow-accent",  `rgba(${hexToRgb(t.accent)}, ${glow})`);
  if (typeof t.danger === "string")  root.setProperty("--glow-danger",  `rgba(${hexToRgb(t.danger)}, ${glow})`);
  if (typeof t.primary === "string") root.setProperty("--glow-primary", `rgba(${hexToRgb(t.primary)}, ${glow})`);

  // ฟอนต์ + ขนาดตัวอักษร
  if (typeof t.font === "string") {
    loadFont(t.font);
    root.setProperty("--font-family", `'${t.font}'`);
  }
  root.setProperty("--font-scale", `${Number(t.font_scale ?? 100)}%`);
};

export default function ThemeLoader() {
  useEffect(() => {
    try {
      const cached = localStorage.getItem("site_theme");
      if (cached) applyTheme(JSON.parse(cached));
    } catch {}

    api.get("/site/theme")
      .then((res) => {
        const t = res.data?.data;
        if (!t) return;
        applyTheme(t);
        try { localStorage.setItem("site_theme", JSON.stringify(t)); } catch {}
      })
      .catch(() => {});
  }, []);

  return null;
}