"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const languages = [
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 12px",
          background: "rgba(20,20,42,0.55)",
          color: "#c084fc",
          border: "1px solid rgba(168,85,247,0.35)",
          borderRadius: "8px",
          fontSize: "0.8rem",
          fontWeight: 800,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: "0.6rem" }}>▼</span>
      </button>
      
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          right: 0,
          background: "#0f0f27",
          border: "1px solid rgba(168,85,247,0.4)",
          borderRadius: "10px",
          padding: "6px",
          minWidth: "120px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
          zIndex: 100,
        }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: i18n.language === lang.code ? "rgba(168,85,247,0.2)" : "transparent",
                color: "#e2e8f0",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}