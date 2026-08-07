"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function ReferralPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, histRes, meRes] = await Promise.all([
        api.get("/rewards/summary"),
        api.get("/rewards/history", { params: { type: "referral" } }),
        api.get("/auth/me"),
      ]);
      setSummary(sumRes.data.data);
      setHistory(histRes.data.data?.data || []);
      setUser(meRes.data.data);
    } catch {}
    setLoading(false);
  };

  const handleClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await api.post("/rewards/claim/referral");
      Swal.fire({
        icon: "success",
        title: "รับค่าแนะนำสำเร็จ!",
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

  const copyCode = () => {
    if (!user?.referral_code) return;
    navigator.clipboard.writeText(user.referral_code);
    Swal.fire({ text: "คัดลอกรหัสแนะนำแล้ว", toast: true, position: "top", showConfirmButton: false, timer: 2000, background: "#27272a", color: "#fafafa", didOpen: (t) => { t.style.borderRadius = "99px"; t.style.padding = "8px 16px"; t.style.fontSize = "14px"; } });
  };

  const copyLink = () => {
    if (!user?.referral_code) return;
    const link = `${window.location.origin}/register?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    Swal.fire({ text: "คัดลอกลิงก์แนะนำแล้ว", toast: true, position: "top", showConfirmButton: false, timer: 2000, background: "#27272a", color: "#fafafa", didOpen: (t) => { t.style.borderRadius = "99px"; t.style.padding = "8px 16px"; t.style.fontSize = "14px"; } });
  };

  const fmt = (n: number) => n?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid #27272a", borderTopColor: "#fafafa", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#fafafa", paddingBottom: "6rem", fontFamily: "'Kanit', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Dice Background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`dice-${i}`} style={{ position: "absolute", top: `${(i * 7) % 100}%`, left: `${(i * 11) % 100}%`, fontSize: `${18 + (i % 4) * 10}px`, opacity: 0.03 + (i % 3) * 0.015, animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `${i * 1.2}s`, filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        ))}
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 1.25rem", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
          <button onClick={() => router.push("/profile")} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#e2e8f0", padding: "8px 14px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
            ← กลับ
          </button>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fafafa", margin: 0 }}>แนะนำเพื่อน</h1>
            <p style={{ fontSize: "0.7rem", color: "#a1a1aa", margin: 0 }}>รับค่าคอมมิชชันจากยอดเดิมพันเพื่อน</p>
          </div>
        </div>

        {/* รหัสแนะนำ */}
        <div style={{ 
          background: "rgba(10, 10, 20, 0.75)", 
          backdropFilter: "blur(16px)", 
          WebkitBackdropFilter: "blur(16px)", 
          borderRadius: "20px", 
          padding: "24px 20px", 
          border: "1px solid rgba(255, 255, 255, 0.2)", 
          marginBottom: "1rem", 
          boxShadow: "0 8px 24px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1)" 
        }}>
          <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#ffffff", textAlign: "center", fontWeight: 700, letterSpacing: "0.5px", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
            รหัสแนะนำของคุณ
          </p>
          
          {/* กล่องใส่รหัสแบบยุบตัว (Inset) ให้รหัสดูเด่น */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px", background: "rgba(0,0,0,0.5)", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 4px 8px rgba(0,0,0,0.6)" }}>
            <span style={{ fontSize: "28px", fontWeight: 800, color: "#10b981", letterSpacing: "4px", textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 15px rgba(16,185,129,0.4)" }}>
              {user?.referral_code || "-"}
            </span>
            <button onClick={copyCode} style={{ 
              background: "linear-gradient(180deg, #34d399 0%, #10b981 100%)", 
              border: "1px solid #6ee7b7", 
              borderRadius: "8px", padding: "8px 14px", cursor: "pointer", 
              color: "#022c22", fontSize: "13px", fontWeight: 800,
              boxShadow: "0 4px 8px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.4)",
              transition: "transform 0.1s" 
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "translateY(2px)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              คัดลอก
            </button>
          </div>

          <button onClick={copyLink} style={{ 
            width: "100%", padding: "14px", borderRadius: "12px", 
            border: "1px solid rgba(16, 185, 129, 0.5)", 
            background: "rgba(16, 185, 129, 0.15)", 
            color: "#34d399", fontSize: "14px", fontWeight: 800, cursor: "pointer", 
            transition: "all 0.2s",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)" 
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.25)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)"}
          >
            คัดลอกลิงก์แนะนำเพื่อน
          </button>
        </div>

        {/* 🌟 Hero Card: ยอดรอรับ (3D นูน สีเขียวมรกต) */}
        <div style={{ 
          background: "linear-gradient(180deg, rgba(6, 78, 59, 0.95) 0%, rgba(2, 44, 34, 0.98) 100%)", 
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", 
          borderRadius: "24px", padding: "28px 20px", marginBottom: "1.5rem", textAlign: "center",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.7), inset 0 3px 2px rgba(255,255,255,0.15), inset 0 -4px 6px rgba(0,0,0,0.5)" 
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(0,0,0,0.5)", padding: "6px 18px", borderRadius: "20px", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 8px rgba(0,0,0,0.4)" }}>
            <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 700, letterSpacing: "0.5px" }}>ค่าแนะนำที่สามารถรับได้</span>
          </div>
          
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "24px", color: "#10b981", fontWeight: 700, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>฿</span>
            <span style={{ fontSize: "42px", fontWeight: 800, color: "#ffffff", textShadow: "0 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(16, 185, 129, 0.6)", letterSpacing: "1px" }}>
              {fmt(summary?.referral?.pending || 0)}
            </span>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming || !(summary?.referral?.pending > 0)}
            className={summary?.referral?.pending > 0 ? "btn-claim-active" : "btn-claim-disabled"}
            style={{
              width: "100%", padding: "16px", borderRadius: "16px", border: "none", 
              cursor: summary?.referral?.pending > 0 ? "pointer" : "not-allowed",
              fontSize: "1.1rem", fontWeight: 800, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
            }}
          >
            {claiming ? (
              "กำลังดำเนินการ..."
            ) : summary?.referral?.pending > 0 ? (
              <>รับค่าแนะนำเข้ากระเป๋า <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></>
            ) : (
              "ไม่มียอดรอรับ"
            )}
          </button>
        </div>

        {/* สรุป */}
        <div style={{ background: "rgba(18, 18, 20, 0.4)", backdropFilter: "blur(8px)", borderRadius: "12px", padding: "16px 20px", border: "1px solid rgba(124,58,237,0.2)", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#71717a" }}>รับแล้วทั้งหมด</p>
            <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#10b981" }}>฿{fmt(summary?.referral?.claimed || 0)}</p>
          </div>
          <div style={{ width: "1px", background: "#27272a" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#71717a" }}>รอรับ</p>
            <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#f59e0b" }}>฿{fmt(summary?.referral?.pending || 0)}</p>
          </div>
        </div>

        {/* ประวัติ */}
        <h2 style={{ fontSize: "13px", color: "#71717a", fontWeight: 500, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>ประวัติค่าแนะนำ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {history.length === 0 ? (
            <div style={{ background: "rgba(18,18,20,0.4)", borderRadius: "12px", padding: "24px", border: "1px solid rgba(124,58,237,0.2)", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#71717a" }}>ยังไม่มีประวัติ</p>
            </div>
          ) : (
            history.map((item: any) => (
              <div key={item.id} style={{ background: "rgba(18,18,20,0.4)", backdropFilter: "blur(8px)", borderRadius: "12px", padding: "14px 16px", border: "1px solid rgba(124,58,237,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#fafafa", fontWeight: 500 }}>
                    {item.description || "ค่าแนะนำเพื่อน"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#71717a" }}>
                    {new Date(item.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} {new Date(item.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#10b981" }}>+฿{fmt(item.amount)}</p>
                  <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", background: item.status === "claimed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: item.status === "claimed" ? "#10b981" : "#f59e0b" }}>
                    {item.status === "claimed" ? "รับแล้ว" : "รอรับ"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* 🟢 ปุ่มกดรับค่าแนะนำ (สีเขียวสว่าง 3D) */
        .btn-claim-active {
          background: linear-gradient(180deg, #6ee7b7 0%, #10b981 50%, #047857 100%);
          color: #022c22;
          border: 1px solid #6ee7b7 !important;
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.8), inset 0 -4px 5px rgba(6, 78, 59, 0.8);
          text-shadow: 0 1px 1px rgba(255,255,255,0.4);
        }
        .btn-claim-active:active {
          transform: translateY(4px);
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.4), inset 0 2px 6px rgba(6, 78, 59, 0.9);
        }
        .btn-claim-active:hover {
          filter: brightness(1.1);
        }

        /* 🔴 ปุ่มกดไม่ได้ (สีเทาจม) */
        .btn-claim-disabled {
          background: rgba(0, 0, 0, 0.4);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: inset 0 4px 8px rgba(0,0,0,0.6);
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