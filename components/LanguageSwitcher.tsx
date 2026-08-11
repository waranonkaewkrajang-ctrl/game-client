"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const languages = [
  { code: "en", label: "English", flag: "https://flagcdn.com/w80/gb.png" },
  { code: "th", label: "ภาษาไทย", flag: "https://flagcdn.com/w80/th.png" },
  { code: "zh", label: "中文", flag: "https://flagcdn.com/w80/cn.png" },
  { code: "vi", label: "Tiếng Việt", flag: "https://flagcdn.com/w80/vn.png" },
  { code: "km", label: "ភាសាខ្មែរ", flag: "https://flagcdn.com/w80/kh.png" },
  { code: "lo", label: "ພາສາລາວ", flag: "https://flagcdn.com/w80/la.png" },
  { code: "id", label: "Bahasa Indonesia", flag: "https://flagcdn.com/w80/id.png" },
  { code: "my", label: "မြန်မာ", flag: "https://flagcdn.com/w80/mm.png" },
  { code: "tl", label: "Tagalog", flag: "https://flagcdn.com/w80/ph.png" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🎯 ล็อค scroll เวลา modal เปิด
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  const current = languages.find(l => l.code === i18n.language) || languages[1];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button — ธงกลม */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "2px solid rgba(168,85,247,0.5)",
          padding: 0,
          overflow: "hidden",
          cursor: "pointer",
          background: "transparent",
          boxShadow: "0 2px 8px rgba(124,58,237,0.4)",
        }}
        title="เปลี่ยนภาษา"
      >
        <img 
          src={current.flag} 
          alt={current.label}
          style={{ 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
          }}
        />
      </button>

      {/* Modal Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.75)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",       // 🎯 กึ่งกลางแนวตั้ง
            justifyContent: "center",   // 🎯 กึ่งกลางแนวนอน
            padding: "20px",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Modal Content — สีธีมม่วง */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #1a0b2e 0%, #2d1b5e 100%)",  // 🎨 ม่วงเข้ม
              borderRadius: "16px",
              padding: "40px 24px 24px",
              maxWidth: "380px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0px 8px 32px rgba(124,58,237,0.35)",  // 🎨 เงาม่วง
              border: "1px solid rgba(168,85,247,0.4)",         // 🎨 ขอบม่วง
            }}
          >
            {/* Header */}
            <div style={{ 
              textAlign: "center", 
              fontSize: "1.1rem", 
              fontWeight: 900, 
              color: "#fff",
              marginBottom: "24px",
              letterSpacing: "0.5px",
              textShadow: "0 0 10px rgba(168,85,247,0.5)",
            }}>
              เปลี่ยนภาษา
            </div>

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(168,85,247,0.2)",
                border: "1px solid rgba(168,85,247,0.4)",
                color: "white",
                fontSize: "1rem",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              ✕
            </button>

            {/* Language Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "10px",
            }}>
              {languages.map((lang) => {
                const isActive = i18n.language === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    style={{
                      cursor: "pointer",
                      padding: "2px",
                      borderRadius: "10px",
                      background: isActive 
                        ? "linear-gradient(135deg, #9333ea, #6d28d9)"  // 🎨 ม่วง gradient
                        : "transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{
                      width: "100%",
                      minHeight: "82px",
                      background: isActive 
                        ? "linear-gradient(135deg, #2d1b5e, #1a0b2e)"  // 🎨 ม่วงเข้ม active
                        : "rgba(20,10,40,0.6)",                          // 🎨 ม่วงจาง
                      border: isActive 
                        ? "1px solid rgba(216,180,254,0.5)"
                        : "1px solid rgba(168,85,247,0.15)",
                      borderRadius: "10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 4px",
                    }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        boxShadow: isActive 
                          ? "0px 4px 12px rgba(168,85,247,0.6)"
                          : "0px 2px 6px rgba(0,0,0,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <img 
                          src={lang.flag} 
                          alt={lang.label}
                          style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div style={{
                        textAlign: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: isActive ? "#e9d5ff" : "#c4b5fd",  // 🎨 สีตัวหนังสือม่วงอ่อน
                        lineHeight: 1.1,
                      }}>
                        {lang.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}