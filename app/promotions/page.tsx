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
    <div style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e2e8f0", marginBottom: "1rem" }}>โปรโมชัน</h1>
        {loading ? <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>กำลังโหลด...</p> : promotions.length === 0 ? <p style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>ยังไม่มีโปรโมชัน</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {promotions.map((promo) => (
              <div key={promo.id} className="card" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
    </div>
  );
}