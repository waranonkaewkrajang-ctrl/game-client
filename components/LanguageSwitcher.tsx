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

  if (!mounted) return null;

  const current = languages.find(l => l.code === i18n.language) || languages[1];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.2)",
          padding: 0,
          overflow: "hidden",
          cursor: "pointer",
          background: "transparent",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
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
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(0deg, #160606 -5.86%, #2e1818 104.05%)",
              borderRadius: "16px",
              padding: "40px 24px 24px",
              maxWidth: "380px",
              width: "100%",
              position: "relative",
              boxShadow: "0px 1px 24px 4px rgba(90,90,90,0.2)",
              border: "1px solid #2e1818",
            }}
          >
            {/* Header */}
            <div style={{ 
              textAlign: "center", 
              fontSize: "1rem", 
              fontWeight: 800, 
              color: "white",
              marginBottom: "24px",
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
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "1.2rem",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                      padding: "1px",
                      borderRadius: "8px",
                      background: isActive 
                        ? "linear-gradient(165.34deg, #e62200 -17.16%, #ff0000 91.36%)"
                        : "transparent",
                    }}
                  >
                    <div style={{
                      width: "100%",
                      minHeight: "78px",
                      background: isActive ? "#220707" : "#0e0606",
                      border: "1px solid #261717",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 4px",
                    }}>
                      <div style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
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
                        color: "white",
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