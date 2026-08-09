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
  
  // เพิ่ม State สำหรับจัดการการสร้างลิงก์แนะนำ
  const [linkGenerated, setLinkGenerated] = useState(false);

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
        background: "#18181b",
        color: "#f8fafc",
        confirmButtonColor: "#8b5cf6",
      });
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ไม่สำเร็จ",
        text: err.response?.data?.message || "กรุณาลองใหม่",
        background: "#18181b",
        color: "#f8fafc",
        confirmButtonColor: "#ef4444",
      });
    }
    setClaiming(false);
  };

  const copyCode = () => {
    if (!user?.referral_code) return;
    navigator.clipboard.writeText(user.referral_code);
    Swal.fire({ text: "คัดลอกรหัสแนะนำแล้ว", toast: true, position: "top", showConfirmButton: false, timer: 2000, background: "#27272a", color: "#fafafa", didOpen: (t) => { t.style.borderRadius = "12px"; t.style.padding = "10px 20px"; t.style.fontSize = "14px"; t.style.border = "1px solid rgba(255,255,255,0.1)"; } });
  };

  const copyLink = () => {
    if (!user?.referral_code) return;
    const link = `${window.location.origin}/register?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    Swal.fire({ text: "คัดลอกลิงก์แนะนำแล้ว", toast: true, position: "top", showConfirmButton: false, timer: 2000, background: "#27272a", color: "#fafafa", didOpen: (t) => { t.style.borderRadius = "12px"; t.style.padding = "10px 20px"; t.style.fontSize = "14px"; t.style.border = "1px solid rgba(255,255,255,0.1)"; } });
  };

  const fmt = (n: number) => n?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #27272a", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa", paddingBottom: "6rem", fontFamily: "'Kanit', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Ambient Background Glow (แทนที่อิโมจิ) */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "60vw", height: "60vw", background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 1.25rem", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "2rem" }}>
          <button onClick={() => router.push("/profile")} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#e2e8f0", padding: "10px 16px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "0.2s hover:bg-white/10" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }}><path d="m15 18-6-6 6-6"/></svg>
            กลับ
          </button>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "0.5px" }}>แนะนำเพื่อน</h1>
            <p style={{ fontSize: "0.8rem", color: "#a1a1aa", margin: "4px 0 0" }}>รับค่าคอมมิชชันจากยอดเดิมพันเพื่อน</p>
          </div>
        </div>

        {/* รหัสแนะนำ & ลิงก์ */}
        <div className="glass-card" style={{ padding: "24px", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ width: "4px", height: "16px", background: "#10b981", borderRadius: "4px" }} />
            <h3 style={{ margin: 0, fontSize: "15px", color: "#fff", fontWeight: 600 }}>รหัสและลิงก์แนะนำของคุณ</h3>
          </div>
          
          {/* กล่องรหัสแนะนำ */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.4)", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "16px" }}>
            <div>
              <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1px" }}>รหัสแนะนำ</p>
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#34d399", letterSpacing: "2px" }}>
                {user?.referral_code || "-"}
              </span>
            </div>
            <button onClick={copyCode} style={{ background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.3)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", color: "#34d399", fontSize: "13px", fontWeight: 600, transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(52, 211, 153, 0.25)"} onMouseOut={(e) => e.currentTarget.style.background = "rgba(52, 211, 153, 0.15)"}>
              คัดลอก
            </button>
          </div>

          {/* ระบบสร้างลิงก์แนะนำ */}
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", paddingTop: "16px" }}>
            {!linkGenerated ? (
              <button 
                onClick={() => setLinkGenerated(true)} 
                style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "1px solid #8b5cf6", background: "linear-gradient(90deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)", color: "#a78bfa", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                onMouseOver={(e) => e.currentTarget.style.background = "rgba(139,92,246,0.25)"}
                onMouseOut={(e) => e.currentTarget.style.background = "linear-gradient(90deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                สร้างลิงก์แนะนำสำหรับเพื่อนใหม่
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <input 
                  readOnly 
                  value={`${window.location.origin}/register?ref=${user?.referral_code}`} 
                  style={{ flex: 1, padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: "13px", outline: "none" }} 
                />
                <button onClick={copyLink} style={{ padding: "0 18px", borderRadius: "10px", border: "none", background: "#8b5cf6", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "0.2s", display: "flex", alignItems: "center", gap: "6px" }} onMouseOver={(e) => e.currentTarget.style.background = "#7c3aed"} onMouseOut={(e) => e.currentTarget.style.background = "#8b5cf6"}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  คัดลอก
                </button>
              </div>
            )}
          </div>
        </div>

        {/* สถิติหลัก */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "1.5rem" }}>
          
          {/* จำนวนเพื่อนที่แนะนำ */}
          <div className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #3b82f6" }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>จำนวนเพื่อนที่แนะนำไปแล้ว</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "4px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "#fff" }}>{user?.referral_count || 0}</span>
                <span style={{ fontSize: "14px", color: "#64748b" }}>คน</span>
              </div>
            </div>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.15)", display: "flex", justifyContent: "center", alignItems: "center", color: "#60a5fa" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="glass-card" style={{ padding: "16px" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>รับแล้วทั้งหมด</p>
              <p style={{ margin: "6px 0 0", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                <span style={{ color: "#10b981", marginRight: "2px" }}>฿</span>{fmt(summary?.referral?.claimed || 0)}
              </p>
            </div>
            <div className="glass-card" style={{ padding: "16px" }}>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>ยอดรอรับ</p>
              <p style={{ margin: "6px 0 0", fontSize: "18px", fontWeight: 700, color: "#fff" }}>
                <span style={{ color: "#fbbf24", marginRight: "2px" }}>฿</span>{fmt(summary?.referral?.pending || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Hero Card: รับค่าแนะนำ */}
        <div style={{ background: "linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(39, 39, 42, 0.95) 100%)", borderRadius: "20px", padding: "28px 24px", marginBottom: "2rem", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <p style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 500, margin: "0 0 12px 0" }}>ค่าแนะนำที่สามารถกดรับได้</p>
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "24px", color: "#fbbf24", fontWeight: 600 }}>฿</span>
            <span style={{ fontSize: "48px", fontWeight: 700, color: "#fff", letterSpacing: "0.5px", textShadow: "0 4px 12px rgba(251, 191, 36, 0.2)" }}>
              {fmt(summary?.referral?.pending || 0)}
            </span>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming || !(summary?.referral?.pending > 0)}
            className={summary?.referral?.pending > 0 ? "btn-claim-active" : "btn-claim-disabled"}
            style={{
              width: "100%", padding: "16px", borderRadius: "12px", border: "none", 
              cursor: summary?.referral?.pending > 0 ? "pointer" : "not-allowed",
              fontSize: "15px", fontWeight: 600, transition: "all 0.2s ease",
              display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"
            }}
          >
            {claiming ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                กำลังดำเนินการ...
              </div>
            ) : summary?.referral?.pending > 0 ? (
              <>
                รับค่าแนะนำเข้ากระเป๋า
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </>
            ) : (
              "ไม่มียอดรอรับ"
            )}
          </button>
        </div>

        {/* ประวัติ */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h2 style={{ fontSize: "15px", color: "#e2e8f0", fontWeight: 600, margin: 0 }}>ประวัติค่าแนะนำล่าสุด</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {history.length === 0 ? (
            <div className="glass-card" style={{ padding: "32px", textAlign: "center", background: "rgba(255,255,255,0.02)" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#71717a", fontWeight: 400 }}>ยังไม่มีประวัติการรับค่าแนะนำ</p>
            </div>
          ) : (
            history.map((item: any) => (
              <div key={item.id} className="glass-card history-item" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a1a1aa" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#f4f4f5", fontWeight: 500 }}>{item.description || "ค่าแนะนำเพื่อน"}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#71717a" }}>
                      {new Date(item.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(item.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: item.status === "claimed" ? "#10b981" : "#fbbf24" }}>
                    +฿{fmt(item.amount)}
                  </p>
                  <span style={{ 
                    display: "inline-block", marginTop: "6px", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px", 
                    background: item.status === "claimed" ? "rgba(16, 185, 129, 0.1)" : "rgba(251, 191, 36, 0.1)", 
                    color: item.status === "claimed" ? "#34d399" : "#fcd34d",
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
        /* Glassmorphism Classes */
        .glass-card {
          background: rgba(24, 24, 27, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .history-item:hover {
          background: rgba(39, 39, 42, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
        }

        /* Buttons */
        .btn-claim-active {
          background: #fbbf24;
          color: #1c1917;
          box-shadow: 0 4px 14px rgba(251, 191, 36, 0.4);
        }
        .btn-claim-active:active {
          transform: scale(0.98);
        }
        .btn-claim-active:hover {
          background: #f59e0b;
        }

        .btn-claim-disabled {
          background: rgba(255, 255, 255, 0.05);
          color: #52525b;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}