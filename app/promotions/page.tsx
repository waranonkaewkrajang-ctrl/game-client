"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    api.get("/promotions").then((res) => { setPromotions(res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const typeLabels: Record<string, string> = { welcome_bonus: "โบนัสต้อนรับ", deposit_bonus: "โบนัสฝากเงิน", cashback: "คืนยอดเสีย", free_credit: "เครดิตฟรี", referral_bonus: "ชวนเพื่อน" };

  return (
    /* 🔴 1. เปลี่ยนพื้นหลังให้เหมือนหน้า Login และเพิ่ม position: relative */
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", position: "relative", overflow: "hidden", fontFamily: "sans-serif" }}>
      
      {/* 🎲 2. เพิ่มก้อนลูกเต๋าอนิเมชันพื้นหลัง (Animated Background Dice) เหมือนหน้า Login ทุกประการ */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "0%", left: "0%", fontSize: "18px", opacity: 0.03, animation: "floatDice 22s ease-in-out infinite", animationDelay: "0s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "7%", left: "11%", fontSize: "28px", opacity: 0.045, animation: "floatDice 25s ease-in-out infinite", animationDelay: "1.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "14%", left: "22%", fontSize: "38px", opacity: 0.06, animation: "floatDice 28s ease-in-out infinite", animationDelay: "2.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "21%", left: "33%", fontSize: "48px", opacity: 0.03, animation: "floatDice 31s ease-in-out infinite", animationDelay: "3.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "28%", left: "44%", fontSize: "18px", opacity: 0.045, animation: "floatDice 34s ease-in-out infinite", animationDelay: "4.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "35%", left: "55%", fontSize: "28px", opacity: 0.06, animation: "floatDice 22s ease-in-out infinite", animationDelay: "6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "42%", left: "66%", fontSize: "38px", opacity: 0.03, animation: "floatDice 25s ease-in-out infinite", animationDelay: "7.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "49%", left: "77%", fontSize: "48px", opacity: 0.045, animation: "floatDice 28s ease-in-out infinite", animationDelay: "8.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "56%", left: "88%", fontSize: "18px", opacity: 0.06, animation: "floatDice 31s ease-in-out infinite", animationDelay: "9.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "63%", left: "99%", fontSize: "28px", opacity: 0.03, animation: "floatDice 34s ease-in-out infinite", animationDelay: "10.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "70%", left: "10%", fontSize: "38px", opacity: 0.045, animation: "floatDice 22s ease-in-out infinite", animationDelay: "12s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "77%", left: "21%", fontSize: "48px", opacity: 0.06, animation: "floatDice 25s ease-in-out infinite", animationDelay: "13.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "84%", left: "32%", fontSize: "18px", opacity: 0.03, animation: "floatDice 28s ease-in-out infinite", animationDelay: "14.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "91%", left: "43%", fontSize: "28px", opacity: 0.045, animation: "floatDice 31s ease-in-out infinite", animationDelay: "15.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "98%", left: "54%", fontSize: "38px", opacity: 0.06, animation: "floatDice 34s ease-in-out infinite", animationDelay: "16.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "5%", left: "65%", fontSize: "48px", opacity: 0.03, animation: "floatDice 22s ease-in-out infinite", animationDelay: "18s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "12%", left: "76%", fontSize: "18px", opacity: 0.045, animation: "floatDice 25s ease-in-out infinite", animationDelay: "19.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "19%", left: "87%", fontSize: "28px", opacity: 0.06, animation: "floatDice 28s ease-in-out infinite", animationDelay: "20.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "26%", left: "98%", fontSize: "38px", opacity: 0.03, animation: "floatDice 31s ease-in-out infinite", animationDelay: "21.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        <div style={{ position: "absolute", top: "33%", left: "9%", fontSize: "48px", opacity: 0.045, animation: "floatDice 34s ease-in-out infinite", animationDelay: "22.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
      </div>

      {/* เนื้อหาหลักด้านหน้า (กำหนด z-index ให้ทับลูกเต๋า) */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem", position: "relative", zIndex: 10 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e2e8f0", marginBottom: "1rem" }}>โปรโมชัน</h1>
        {loading ? <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>กำลังโหลด...</p> : promotions.length === 0 ? <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>ยังไม่มีโปรโมชัน</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {promotions.map((promo) => (
              <div key={promo.id} className="card" style={{ display: "flex", gap: "1rem", alignItems: "center", background: "rgba(26, 26, 46, 0.4)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1rem" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "white", flexShrink: 0 }}>
                  {promo.bonus_percent}%
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, color: "#e2e8f0", margin: 0, fontSize: "1rem" }}>{promo.title}</h3>
                  <span style={{ fontSize: "0.65rem", background: "rgba(124,58,237,0.15)", color: "#a855f7", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>{typeLabels[promo.type] || promo.type}</span>
                  <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", fontSize: "0.78rem", color: "#94a3b8" }}>
                    <span>ฝากขั้นต่ำ: ฿{parseFloat(promo.min_deposit).toLocaleString()}</span>
                    <span>โบนัสสูงสุด: ฿{parseFloat(promo.max_bonus).toLocaleString()}</span>
                    <span>Turnover: {promo.turnover_multiplier}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎲 3. เพิ่มก้อน <style> เพื่อให้แอนิมเอชันลูกเต๋าทำงาน */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.05; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.06; }
          85% { opacity: 0.03; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }
        div[style*="floatDice"] {
          opacity: 0.15 !important;
          filter: grayscale(1) brightness(1.2) !important;
        }
      `}} />

    </div>
  );
}