"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 State สำหรับจัดการหมวดหมู่โปรโมชัน
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    api.get("/promotions").then((res) => { setPromotions(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // 🟢 รายการหมวดหมู่โปรโมชัน
  const categories = [
    { id: "all", label: "ทั้งหมด" },
    { id: "welcome_bonus", label: "สมาชิกใหม่" },
    { id: "deposit_bonus", label: "โบนัสฝากเงิน" },
    { id: "cashback", label: "คืนยอดเสีย" },
    { id: "free_credit", label: "เครดิตฟรี" },
    { id: "referral_bonus", label: "ชวนเพื่อน" },
  ];

  // 🟢 กรองโปรโมชันตามหมวดหมู่ที่เลือก
  const filteredPromotions = activeCategory === "all" 
    ? promotions 
    : promotions.filter(p => p.type === activeCategory);

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

      {/* เนื้อหาหลัก */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", position: "relative", zIndex: 10 }}>

        {/* หัวข้อ */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#e2e8f0", margin: 0, borderLeft: "4px solid #f59e0b", paddingLeft: "12px" }}>
            โปรโมชัน
          </h1>
        </div>

        {/* 🟢 เมนูคัดกรองโปรโมชัน (แบบปุ่มโค้งมนตามแบบที่คุณต้องการ) */}
        <div className="promo-filter-grid">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`promo-filter-btn ${activeCategory === cat.id ? "active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>กำลังโหลด...</p>
        ) : filteredPromotions.length === 0 ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>ไม่พบโปรโมชันในหมวดหมู่นี้</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredPromotions.map((promo) => (
              
              /* 🟢 โครงสร้าง Card แบบใหม่ (Grid ซ้ายรูป-ขวาข้อความ) */
              <div key={promo.id} className="promo-layout-card">
                
                {/* ฝั่งซ้าย: รูปภาพ */}
                <div className="promo-img-section">
                  <img src={promo.image_url || "/banner.jpg"} alt={promo.title} className="promo-image-full" loading="lazy" />
                </div>

                {/* ฝั่งขวา: รายละเอียดข้อความ (HTML) */}
                <div className="promo-text-section">
                  <h2 className="promo-heading">{promo.title}</h2>
                  
                  {promo.description && (
                    <div className="promo-html-content" dangerouslySetInnerHTML={{ __html: promo.description }} />
                  )}

                  {/* ปุ่มกดรับโปรและฝากเงิน */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                    <button onClick={() => handleClaim(promo)} className="btn-claim-action">
                      รับโปรโมชัน
                    </button>
                    <button onClick={() => router.push(`/wallet?promo=${promo.id}`)} className="btn-deposit-action">
                      ฝากเงิน
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* 🟢 สไตล์เมนูคัดกรอง (Filter Buttons) */
        .promo-filter-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (min-width: 768px) {
          .promo-filter-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .promo-filter-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        .promo-filter-btn {
          width: 100%;
          padding: 10px;
          border-radius: 30px; /* มุมโค้งมนตามเรฟเฟอเรนซ์ */
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d1d5db;
        }
        .promo-filter-btn.active {
          background: linear-gradient(90deg, #aa00a0, #4b0082); /* สีโทนเว็บคุณ */
          border: 1px solid #f59e0b;
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(170, 0, 160, 0.4);
        }
        .promo-filter-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
        }

        /* 🟢 สไตล์การ์ดโปรโมชัน (ซ้ายรูป-ขวาข้อความ) */
        .promo-layout-card {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          background: #14142a; /* พื้นหลังสีเข้ม */
          border-radius: 24px;
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.3s ease;
        }
        .promo-layout-card:hover {
          border-color: rgba(168, 85, 247, 0.3);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        @media (min-width: 768px) {
          .promo-layout-card {
            grid-template-columns: 1fr 1fr; /* แบ่ง 2 คอลัมน์บน PC */
            padding: 0;
          }
        }

        .promo-img-section {
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .promo-img-section {
            padding: 24px;
          }
        }

        .promo-image-full {
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
        }

        .promo-text-section {
          padding: 10px 10px 20px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .promo-text-section {
            padding: 24px 24px 24px 0;
          }
        }

        .promo-heading {
          font-size: 1.3rem;
          font-weight: 800;
          margin: 0 0 12px 0;
          color: #f59e0b; /* สีเหลือง/ส้ม */
          line-height: 1.4;
        }

        /* จัดการหน้าตาของเนื้อหา HTML ดั้งเดิมของคุณ */
        .promo-html-content {
          font-size: 0.95rem;
          color: #cbd5e1;
          line-height: 1.7;
        }
        .promo-html-content h1, 
        .promo-html-content h2, 
        .promo-html-content h3 {
          font-size: 0.95rem;
          font-weight: 400;
          margin-bottom: 8px;
          color: #e2e8f0;
        }
        .promo-html-content p {
          margin-bottom: 8px;
        }

        /* 🟢 สไตล์ปุ่มกดด้านล่าง */
        .btn-claim-action {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: white;
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-claim-action:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.5); 
        }

        .btn-deposit-action {
          background: transparent;
          color: #f59e0b;
          padding: 10px 24px;
          border-radius: 8px;
          border: 1px solid #f59e0b;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-deposit-action:hover { 
          background: rgba(245, 158, 11, 0.1); 
        }
      `}} />
    </div>
  );
}