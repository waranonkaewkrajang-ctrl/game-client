"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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

  const pathname = usePathname();

  useEffect(() => {
    // แสดงเฉพาะหน้า /lobby เท่านั้น
    if (pathname !== "/lobby") return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://admintg289.sbs/api"}/popups`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
           const seen = JSON.parse(localStorage.getItem("seen_popups") || "[]");
          const dismissed = JSON.parse(localStorage.getItem("dismissed_popups_today") || "{}");
          const today = new Date().toDateString();
          const filtered = data.data.filter((p: Popup) => {
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
    if (popup?.show_once) {
      const seen = JSON.parse(localStorage.getItem("seen_popups") || "[]");
      if (!seen.includes(popup.id)) {
        seen.push(popup.id);
        localStorage.setItem("seen_popups", JSON.stringify(seen));
      }
    }
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
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>

        {/* ปุ่มกากบาทปิด */}
        <button className="popup-close-btn" onClick={handleClose}>✕</button>

        {/* รูปภาพเต็ม */}
        {imgSrc && (
          <div className="popup-image-wrapper">
            <img src={imgSrc} alt={popup.title} className="popup-image" />
          </div>
        )}

        {/* เนื้อหา */}
        <div className="popup-content">
          <h2 className="popup-title">{popup.title}</h2>
          {popup.description && (
            <p className="popup-description">{popup.description}</p>
          )}

          <div className="popup-buttons">
            {popup.link_url && (
              <a href={popup.link_url} className="popup-btn-primary">
                {popup.link_text || "ดูเพิ่มเติม"}
              </a>
            )}
          </div>

          {/* ติ๊กไม่แสดงอีกวันนี้ */}
          <label className="popup-dismiss-label" onClick={() => {
            const dismissed = JSON.parse(localStorage.getItem("dismissed_popups_today") || "{}");
            dismissed[popup.id] = new Date().toDateString();
            localStorage.setItem("dismissed_popups_today", JSON.stringify(dismissed));
            handleClose();
          }}>
            <input type="checkbox" className="popup-dismiss-checkbox" readOnly />
            <span>วันนี้ไม่ต้องแสดงอีก</span>
          </label>

          {popups.length > 1 && (
            <div className="popup-dots">
              {popups.map((_, i) => (
                <div key={i} className={`popup-dot ${i === currentIndex ? "active" : ""}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .popup-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: popupFade 0.25s ease;
        }

        .popup-container {
          position: relative;
          width: 100%;
          max-width: 440px;
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          box-shadow:
            0 25px 60px rgba(0,0,0,0.5),
            0 0 0 1px rgba(0,0,0,0.05);
          animation: popupScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .popup-close-btn {
          position: absolute; top: 12px; right: 12px; z-index: 10;
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #f87171, #ef4444);
          border: 2px solid rgba(252,165,165,0.5);
          color: white;
          font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(239,68,68,0.4), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 3px rgba(153,27,27,0.4);
        }
        .popup-close-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(239,68,68,0.5), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 3px rgba(153,27,27,0.5);
        }

        .popup-image-wrapper {
          width: 100%;
          padding: 16px 16px 0 16px;
          box-sizing: border-box;
        }

        .popup-image {
          width: 100%;
          display: block;
          object-fit: cover;
          border-radius: 12px;
        }



        .popup-content {
          padding: 20px 24px 24px;
        }

        .popup-description {
          font-size: 0.9rem;
          color: #475569;
          text-align: center;
          line-height: 1.7;
          margin: 0 0 18px;
        }

        .popup-buttons {
          display: flex; gap: 10px;
        }

        .popup-btn-primary {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #9333ea, #7c3aed);
          color: white;
          font-size: 0.9rem;
          font-weight: 700;
          text-align: center;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(124,58,237,0.4);
        }
        .popup-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.5);
        }

        .popup-dots {
          display: flex; justify-content: center; gap: 6px; margin-top: 16px;
        }
        .popup-dot {
          width: 6px; height: 6px; border-radius: 3px;
          background: rgba(255,255,255,0.15);
          transition: all 0.3s;
        }
        .popup-dot.active {
          width: 20px;
          background: #9333ea;
        }

        .popup-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px;
          text-align: center;
          text-shadow: none;
        }

        .popup-dismiss-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .popup-dismiss-label:hover {
          opacity: 0.8;
        }
        .popup-dismiss-label span {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
        }
        .popup-dismiss-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #8b5cf6;
          cursor: pointer;
        }

        @keyframes popupFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupScale {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        @media (max-width: 480px) {
          .popup-container { max-width: 340px; border-radius: 16px; }
          .popup-content { padding: 16px 20px 20px; }
        }
      `}} />
    </div>
  );
}