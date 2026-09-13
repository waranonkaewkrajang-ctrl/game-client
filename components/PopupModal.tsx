"use client";
import { useState, useEffect } from "react";

interface Popup {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  show_once: boolean;
}

export default function PopupModal() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://admintg289.sbs/api"}/popups`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          // กรอง popup ที่ user เคยเห็นแล้ว (show_once)
          const seen = JSON.parse(localStorage.getItem("seen_popups") || "[]");
          const filtered = data.data.filter((p: Popup) => {
            if (p.show_once && seen.includes(p.id)) return false;
            return true;
          });
          if (filtered.length > 0) {
            setPopups(filtered);
            setCurrentIndex(0);
            setShow(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    const popup = popups[currentIndex];

    // บันทึกว่าเห็นแล้ว (ถ้า show_once)
    if (popup?.show_once) {
      const seen = JSON.parse(localStorage.getItem("seen_popups") || "[]");
      if (!seen.includes(popup.id)) {
        seen.push(popup.id);
        localStorage.setItem("seen_popups", JSON.stringify(seen));
      }
    }

    // ถ้ามี popup ถัดไป แสดงต่อ
    if (currentIndex < popups.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShow(false);
    }
  };

  if (!show || popups.length === 0) return null;

  const popup = popups[currentIndex];
  const imgSrc = popup.image_url
    ? popup.image_url.startsWith("/")
      ? `https://admintg289.sbs${popup.image_url}`
      : popup.image_url
    : null;

  return (
    <div onClick={handleClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
      animation: "popupFadeIn 0.3s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "linear-gradient(135deg, #1a1a2e, #14142a)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "420px",
        overflow: "hidden",
        border: "1px solid rgba(168, 85, 247, 0.3)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.2)",
        animation: "popupSlideUp 0.3s ease",
      }}>
        {/* รูปภาพ */}
        {imgSrc && (
          <img src={imgSrc} alt={popup.title} style={{
            width: "100%", maxHeight: "280px", objectFit: "cover", display: "block",
          }} />
        )}

        {/* เนื้อหา */}
        <div style={{ padding: "20px" }}>
          <h2 style={{
            fontSize: "1.2rem", fontWeight: 800, color: "#f5f3ff",
            margin: "0 0 8px", textAlign: "center",
          }}>
            {popup.title}
          </h2>

          {popup.description && (
            <p style={{
              fontSize: "0.85rem", color: "rgba(216,180,254,0.8)",
              margin: "0 0 16px", textAlign: "center", lineHeight: 1.6,
            }}>
              {popup.description}
            </p>
          )}

          {/* ปุ่ม */}
          <div style={{ display: "flex", gap: "8px" }}>
            {popup.link_url && (
              <a href={popup.link_url} style={{
                flex: 1, padding: "10px", borderRadius: "10px",
                background: "linear-gradient(135deg, #9333ea, #7c3aed)",
                color: "white", fontSize: "0.9rem", fontWeight: 700,
                textAlign: "center", textDecoration: "none",
                border: "1px solid rgba(216,180,254,0.3)",
              }}>
                {popup.link_text || "ดูเพิ่มเติม"}
              </a>
            )}
            <button onClick={handleClose} style={{
              flex: popup.link_url ? 0.6 : 1, padding: "10px", borderRadius: "10px",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
            }}>
              {currentIndex < popups.length - 1 ? "ถัดไป" : "ปิด"}
            </button>
          </div>

          {/* จุดแสดงจำนวน popup */}
          {popups.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "12px" }}>
              {popups.map((_, i) => (
                <div key={i} style={{
                  width: i === currentIndex ? "16px" : "6px",
                  height: "6px", borderRadius: "3px",
                  background: i === currentIndex ? "#9333ea" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s",
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes popupFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupSlideUp {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}