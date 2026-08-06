"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    api.get("/promotions").then((res) => { setPromotions(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const typeLabels: Record<string, string> = {
    welcome_bonus: "โบนัสต้อนรับ", deposit_bonus: "โบนัสฝากเงิน",
    cashback: "คืนยอดเสีย", free_credit: "เครดิตฟรี", referral_bonus: "ชวนเพื่อน",
  };

  const handleClaim = async (promo: any) => {
    try {
      const res = await api.post(`/promotions/${promo.id}/claim`);
      if (res.data.status === "success") {
        const result = await Swal.fire({
          icon: "success",
          title: "รับโปรโมชันสำเร็จ!",
          html: `
            <div style="text-align:center">
              <p style="font-size:15px;color:#475569;margin:0 0 8px">${promo.title}</p>
              <p style="font-size:13px;color:#64748b">โบนัส <b style="color:#7c3aed">${promo.bonus_percent}%</b> | ฝากขั้นต่ำ <b>฿${parseFloat(promo.min_deposit).toLocaleString()}</b></p>
              <p style="font-size:13px;color:#64748b">Turnover: <b>${promo.turnover_multiplier}x</b></p>
            </div>
          `,
          confirmButtonText: "ไปฝากเงินเลย",
          confirmButtonColor: "#7c3aed",
          showCancelButton: true,
          cancelButtonText: "ภายหลัง",
          background: "#fff",
          color: "#0f172a",
        });
        if (result.isConfirmed) {
          router.push(`/wallet?promo=${promo.id}`);
        }
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "ไม่สามารถรับโปรได้", text: err.response?.data?.message || "เกิดข้อผิดพลาด" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", position: "relative", overflow: "hidden", fontFamily: "'Kanit', sans-serif" }}>

      {/* Animated Background Dice */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${(i * 7) % 100}%`, left: `${(i * 11) % 100}%`, fontSize: `${18 + (i % 4) * 10}px`, opacity: 0.03 + (i % 3) * 0.015, animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `${i * 1.2}s`, filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        ))}
      </div>

      {/* เนื้อหาหลัก */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem", position: "relative", zIndex: 10 }}>

        {/* หัวข้อ */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>🎁</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>โปรโมชัน</h1>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>กำลังโหลด...</p>
        ) : promotions.length === 0 ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>ยังไม่มีโปรโมชัน</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {promotions.map((promo) => (
              <div key={promo.id} className="promo-card">

                {/* ซ้าย: รูปภาพ */}
                <div className="promo-img-wrap">
                  {promo.image_url ? (
                    <img src={promo.image_url} alt={promo.title} className="promo-img" />
                  ) : (
                    <div className="promo-img-placeholder">
                      <span style={{ fontSize: "2.5rem" }}>🎰</span>
                      <span style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{promo.bonus_percent}%</span>
                    </div>
                  )}
                  <div className="promo-type-badge">
                    {typeLabels[promo.type] || promo.type}
                  </div>
                </div>

                {/* ขวา: รายละเอียด */}
                <div className="promo-detail">
                  <h3 className="promo-title">{promo.title}</h3>

                  {promo.description && (
                    <div className="promo-desc" dangerouslySetInnerHTML={{ __html: promo.description }} />
                  )}

                  {/* เงื่อนไข 4 ช่อง */}
                  <div className="promo-conditions">
                    <div className="promo-cond-item">
                      <span className="promo-cond-label">ฝากขั้นต่ำ</span>
                      <span className="promo-cond-value">฿{parseFloat(promo.min_deposit).toLocaleString()}</span>
                    </div>
                    <div className="promo-cond-item">
                      <span className="promo-cond-label">โบนัส</span>
                      <span className="promo-cond-value" style={{ color: "#a855f7", fontSize: "1.1rem" }}>{promo.bonus_percent}%</span>
                    </div>
                    <div className="promo-cond-item">
                      <span className="promo-cond-label">สูงสุด</span>
                      <span className="promo-cond-value">฿{parseFloat(promo.max_bonus).toLocaleString()}</span>
                    </div>
                    <div className="promo-cond-item">
                      <span className="promo-cond-label">Turnover</span>
                      <span className="promo-cond-value">{promo.turnover_multiplier}x</span>
                    </div>
                  </div>

                  {/* ปุ่ม */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button onClick={() => handleClaim(promo)} className="promo-btn-claim">
                      🎁 รับโปรนี้
                    </button>
                    <button onClick={() => router.push(`/wallet?promo=${promo.id}`)} className="promo-btn-deposit">
                      ฝากเลย →
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.05; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.06; }
          85% { opacity: 0.03; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }

        .promo-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: linear-gradient(135deg, rgba(88,28,135,0.5) 0%, rgba(30,10,60,0.8) 100%);
          border: 1px solid rgba(168,85,247,0.25);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .promo-card:hover {
          border-color: rgba(168,85,247,0.5);
          box-shadow: 0 12px 32px rgba(124,58,237,0.25);
          transform: translateY(-2px);
        }
        .promo-img-wrap {
          position: relative;
          min-height: 200px;
          overflow: hidden;
        }
        .promo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .promo-img-placeholder {
          width: 100%;
          height: 100%;
          min-height: 200px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .promo-type-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(124,58,237,0.5);
        }
        .promo-detail {
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
        }
        .promo-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #e2e8f0;
          margin: 0;
          line-height: 1.4;
        }
        .promo-desc {
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.7;
          max-height: 120px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .promo-desc h1, .promo-desc h2, .promo-desc h3 {
          font-size: 0.75rem;
          font-weight: 400;
          margin: 0;
        }
        .promo-conditions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .promo-cond-item {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(168,85,247,0.15);
          border-radius: 10px;
          padding: 8px 10px;
          text-align: center;
        }
        .promo-cond-label {
          display: block;
          font-size: 0.6rem;
          color: #94a3b8;
          margin-bottom: 2px;
        }
        .promo-cond-value {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: #e2e8f0;
        }
        .promo-btn-claim {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: inherit;
          box-shadow: 0 4px 12px rgba(124,58,237,0.4);
          transition: all 0.3s;
        }
        .promo-btn-claim:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(124,58,237,0.5);
        }
        .promo-btn-deposit {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid rgba(168,85,247,0.3);
          cursor: pointer;
          background: rgba(124,58,237,0.1);
          color: #c084fc;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: inherit;
          transition: all 0.3s;
        }
        .promo-btn-deposit:hover {
          background: rgba(124,58,237,0.2);
          border-color: rgba(168,85,247,0.5);
        }

        @media (max-width: 768px) {
          .promo-card {
            grid-template-columns: 1fr;
          }
          .promo-img-wrap {
            min-height: 160px;
            max-height: 200px;
          }
          .promo-detail {
            padding: 16px;
          }
          .promo-title {
            font-size: 1rem;
          }
        }
      `}} />
    </div>
  );
}