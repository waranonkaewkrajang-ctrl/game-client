"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function CashbackPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, histRes] = await Promise.all([
        api.get("/rewards/summary"),
        api.get("/rewards/history", { params: { type: "cashback" } }),
      ]);
      setSummary(sumRes.data.data);
      setHistory(histRes.data.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const handleClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await api.post("/rewards/claim/cashback");
      Swal.fire({
        icon: "success",
        title: "รับยอดเสียสำเร็จ!",
        text: res.data.message,
        background: "#14142a",
        color: "#e2e8f0",
        confirmButtonColor: "#7c3aed",
      });
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ไม่สำเร็จ",
        text: err.response?.data?.message || "กรุณาลองใหม่",
        background: "#14142a",
        color: "#e2e8f0",
        confirmButtonColor: "#dc2626",
      });
    }
    setClaiming(false);
  };

  const fmt = (n: number) => n?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid #27272a", borderTopColor: "#fafafa", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  const canClaim = summary?.cashback?.pending > 0;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#fafafa", paddingBottom: "6rem", fontFamily: "'Kanit', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Dice Background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`dice-${i}`} style={{ position: "absolute", top: `${(i * 7) % 100}%`, left: `${(i * 11) % 100}%`, fontSize: `${18 + (i % 4) * 10}px`, opacity: 0.03 + (i % 3) * 0.015, animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `${i * 1.2}s`, filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        ))}
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 1.25rem", position: "relative", zIndex: 10 }}>

        {/* Header แบบใหม่ คลีนๆ */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "1.5rem" }}>
          <button onClick={() => router.push("/profile")} style={{ 
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
            borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#e2e8f0", cursor: "pointer", transition: "all 0.3s",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "0.5px", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>รับยอดเสีย (Cashback)</h1>
            <p style={{ fontSize: "0.75rem", color: "#a1a1aa", margin: 0 }}>คำนวณจากยอดเสียที่เล่นในแต่ละวัน</p>
          </div>
        </div>

        {/* 🌟 Hero Card: ยอดรอรับ (3D นูน สีม่วงชมพู) */}
        <div style={{ 
          background: "linear-gradient(180deg, rgba(88, 28, 135, 0.85) 0%, rgba(157, 23, 77, 0.9) 100%)", 
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", 
          borderRadius: "24px", padding: "28px 20px", marginBottom: "1.5rem", textAlign: "center",
          border: "1px solid rgba(236, 72, 153, 0.3)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.5), inset 0 3px 2px rgba(255,255,255,0.1), inset 0 -4px 6px rgba(0,0,0,0.4)" 
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.3)", padding: "4px 14px", borderRadius: "20px", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "16px" }}>🎁</span>
            <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 600, letterSpacing: "0.5px" }}>ยอดเสียที่สามารถรับได้</span>
          </div>
          
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "24px", color: "#eab308", fontWeight: 700, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>฿</span>
            <span style={{ fontSize: "42px", fontWeight: 800, color: "#ffffff", textShadow: "0 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(234, 179, 8, 0.4)", letterSpacing: "1px" }}>
              {fmt(summary?.cashback?.pending || 0)}
            </span>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming || !canClaim}
            className={canClaim ? "btn-claim-active" : "btn-claim-disabled"}
            style={{
              width: "100%", padding: "16px", borderRadius: "16px", border: "none", 
              cursor: canClaim ? "pointer" : "not-allowed",
              fontSize: "1.1rem", fontWeight: 800, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
            }}
          >
            {claiming ? (
              "กำลังดำเนินการ..."
            ) : canClaim ? (
              <>รับยอดเสียเข้ากระเป๋า <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></>
            ) : (
              "ไม่มียอดเสียรอรับ"
            )}
          </button>
        </div>

        {/* สรุปยอดที่รับแล้ว (Glassmorphism 2 ช่อง) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#a1a1aa", fontWeight: 500 }}>รับแล้วทั้งหมด</p>
            <p style={{ margin: "6px 0 0", fontSize: "18px", fontWeight: 700, color: "#10b981", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
              ฿{fmt(summary?.cashback?.claimed || 0)}
            </p>
          </div>
          <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#a1a1aa", fontWeight: 500 }}>ยอดรอรับ</p>
            <p style={{ margin: "6px 0 0", fontSize: "18px", fontWeight: 700, color: "#eab308", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
              ฿{fmt(summary?.cashback?.pending || 0)}
            </p>
          </div>
        </div>

        {/* ประวัติ (Modern List) */}
        <h2 style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 700, marginBottom: "12px", paddingLeft: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ประวัติรับยอดเสียล่าสุด
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {history.length === 0 ? (
            <div className="glass-card" style={{ padding: "30px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#71717a", fontWeight: 500 }}>ยังไม่มีประวัติการรับยอดเสีย</p>
            </div>
          ) : (
            history.map((item: any) => (
              <div key={item.id} className="glass-card history-item" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
                    💸
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#fafafa", fontWeight: 600 }}>{item.description || "คืนยอดเสีย"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                      {new Date(item.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(item.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: item.status === "claimed" ? "#10b981" : "#eab308" }}>
                    +฿{fmt(item.amount)}
                  </p>
                  <span style={{ 
                    display: "inline-block", marginTop: "4px", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", 
                    background: item.status === "claimed" ? "rgba(16,185,129,0.15)" : "rgba(234,179,8,0.15)", 
                    color: item.status === "claimed" ? "#4ade80" : "#fde047",
                    border: `1px solid ${item.status === "claimed" ? "rgba(16,185,129,0.3)" : "rgba(234,179,8,0.3)"}`
                  }}>
                    {item.status === "claimed" ? "รับแล้ว" : "รอรับ"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* 🟢 ธีมกระจกใส (Glassmorphism) สำหรับการ์ดต่างๆ */
        .glass-card {
          background: rgba(20, 20, 35, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        /* เอฟเฟกต์ Hover สำหรับประวัติ */
        .history-item:hover {
          transform: translateY(-2px);
          border-color: rgba(168, 85, 247, 0.5);
          background: rgba(30, 30, 50, 0.7);
        }

        /* 🟢 ปุ่มกดรับยอดเสีย (กรณีที่กดได้ - สีทอง 3D) */
        .btn-claim-active {
          background: linear-gradient(180deg, #fef08a 0%, #eab308 50%, #ca8a04 100%);
          color: #422006;
          border: 1px solid #fef08a !important;
          box-shadow: 0 8px 16px rgba(202, 138, 4, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -4px 5px rgba(133, 77, 14, 0.8);
          text-shadow: 0 1px 1px rgba(255,255,255,0.4);
        }
        .btn-claim-active:active {
          transform: translateY(4px);
          box-shadow: 0 2px 4px rgba(202, 138, 4, 0.4), inset 0 2px 6px rgba(133, 77, 14, 0.9);
        }
        .btn-claim-active:hover {
          filter: brightness(1.1);
        }

        /* 🔴 ปุ่มกดรับยอดเสีย (กรณีที่กดไม่ได้ - สีเทาจมๆ) */
        .btn-claim-disabled {
          background: rgba(0, 0, 0, 0.3);
          color: #71717a;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          box-shadow: inset 0 4px 8px rgba(0,0,0,0.5);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.05; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.06; }
          85% { opacity: 0.03; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }
      `}} />
    </div>
  );
}