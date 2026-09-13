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
          max-width: 400px;
          border-radius: 20px;
          overflow: hidden;
          background: #0f0f1a;
          box-shadow:
            0 0 0 1px rgba(168,85,247,0.2),
            0 25px 50px rgba(0,0,0,0.6),
            0 0 80px rgba(124,58,237,0.08);
          animation: popupScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .popup-close-btn {
          position: absolute; top: 12px; right: 12px; z-index: 10;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.8);
          font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .popup-close-btn:hover {
          background: rgba(239,68,68,0.8);
          color: white;
          transform: rotate(90deg);
        }

        .popup-image-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .popup-image {
          width: 100%;
          display: block;
          object-fit: cover;
        }

        .popup-content {
          padding: 20px 24px 24px;
        }

        .popup-description {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.75);
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