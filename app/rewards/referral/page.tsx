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
  
  // State สำหรับจัดการการสร้างลิงก์แนะนำ
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

      {/* Floating Background (แทนที่ลูกเต๋าด้วยไอคอนรูปทรงเพื่อให้หรูขึ้น และไม่มีอีโมจิ) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={`bg-icon-${i}`} style={{ position: "absolute", top: `${(i * 7) % 100}%`, left: `${(i * 11) % 100}%`, opacity: 0.03 + (i % 3) * 0.015, animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `${i * 1.2}s`, filter: "grayscale(1) brightness(0.6)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={`${18 + (i % 4) * 10}`} height={`${18 + (i % 4) * 10}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#ffffff" }}><path d="M12 2L2 12l10 10 10-10Z"/></svg>
          </div>
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

        {/* รหัสแนะนำ และ ลิงก์ */}
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
          
          {/* กล่องใส่รหัส */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "20px", background: "rgba(0,0,0,0.5)", padding: "12px 16px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "inset 0 4px 8px rgba(0,0,0,0.6)" }}>
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

          {/* ระบบสร้างลิงก์ (ใหม่) */}
          <div style={{ borderTop: "1px dashed rgba(255,255,255,0.15)", paddingTop: "16px" }}>
            {!linkGenerated ? (
              <button 
                onClick={() => setLinkGenerated(true)}
                style={{ 
                  width: "100%", padding: "14px", borderRadius: "12px", 
                  border: "1px solid rgba(139, 92, 246, 0.5)", 
                  background: "rgba(139, 92, 246, 0.15)", 
                  color: "#c084fc", fontSize: "14px", fontWeight: 800, cursor: "pointer", 
                  transition: "all 0.2s",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: "8px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(139, 92, 246, 0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                สร้างลิงก์แนะนำสำหรับยูสใหม่
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px", animation: "fadeIn 0.3s ease-out" }}>
                <div style={{ flex: 1, padding: "12px 14px", borderRadius: "12px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#a1a1aa", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
                  {`${window.location.origin}/register?ref=${user?.referral_code}`}
                </div>
                <button 
                  onClick={copyLink}
                  style={{ 
                    padding: "0 16px", borderRadius: "12px", 
                    border: "1px solid rgba(16, 185, 129, 0.5)", 
                    background: "linear-gradient(180deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)", 
                    color: "#34d399", fontSize: "14px", fontWeight: 800, cursor: "pointer", 
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "6px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(16, 185, 129, 0.3)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "linear-gradient(180deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  คัดลอก
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🌟 Hero Card: ยอดรอรับ (3D นูน สีม่วงอมชมพู - คงเดิมของลูกค้า) */}
        <div style={{ 
          background: "linear-gradient(180deg, rgba(88, 28, 135, 0.95) 0%, rgba(157, 23, 77, 0.98) 100%)", 
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", 
          borderRadius: "24px", padding: "28px 20px", marginBottom: "1.5rem", textAlign: "center",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.7), inset 0 3px 2px rgba(255,255,255,0.15), inset 0 -4px 6px rgba(0,0,0,0.5)" 
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(0,0,0,0.5)", padding: "6px 18px", borderRadius: "20px", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 4px 8px rgba(0,0,0,0.4)" }}>
            <span style={{ fontSize: "13px", color: "#ffffff", fontWeight: 700, letterSpacing: "0.5px" }}>ค่าแนะนำที่สามารถรับได้</span>
          </div>
          
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "24px", color: "#eab308", fontWeight: 700, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>฿</span>
            <span style={{ fontSize: "42px", fontWeight: 800, color: "#ffffff", textShadow: "0 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(234, 179, 8, 0.6)", letterSpacing: "1px" }}>
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

        {/* การ์ดจำนวนเพื่อนที่แนะนำ (จัดใหม่ให้ดูแพงขึ้น และเปลี่ยนอีโมจิเป็น SVG) */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderLeft: "4px solid #a855f7" }}>
          <div>
            <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0", fontWeight: 700, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
              จำนวนเพื่อนที่แนะนำ
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "4px" }}>
              <span style={{ fontSize: "32px", fontWeight: 800, color: "#a855f7", textShadow: "0 2px 8px rgba(168,85,247,0.5)" }}>
                {user?.referral_count || 0}
              </span>
              <span style={{ fontSize: "14px", color: "#cbd5e1" }}>คน</span>
            </div>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", justifyContent: "center", alignItems: "center", color: "#d8b4fe" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>

        {/* สรุป ยอดเงิน */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#ffffff", fontWeight: 700, letterSpacing: "0.5px", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>รับแล้วทั้งหมด</p>
            <p style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 800, color: "#10b981", textShadow: "0 2px 4px rgba(0,0,0,0.9)" }}>
              ฿{fmt(summary?.referral?.claimed || 0)}
            </p>
          </div>
          <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#ffffff", fontWeight: 700, letterSpacing: "0.5px", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>ยอดรอรับ</p>
            <p style={{ margin: "6px 0 0", fontSize: "20px", fontWeight: 800, color: "#eab308", textShadow: "0 2px 4px rgba(0,0,0,0.9)" }}>
              ฿{fmt(summary?.referral?.pending || 0)}
            </p>
          </div>
        </div>

        {/* ประวัติ */}
        <h2 style={{ fontSize: "15px", color: "#ffffff", fontWeight: 800, marginBottom: "12px", paddingLeft: "8px", display: "flex", alignItems: "center", gap: "6px", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ประวัติค่าแนะนำล่าสุด
        </h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {history.length === 0 ? (
            <div className="glass-card" style={{ padding: "30px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "15px", color: "#ffffff", fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}>ยังไม่มีประวัติการรับค่าแนะนำ</p>
            </div>
          ) : (
            history.map((item: any) => (
              <div key={item.id} className="glass-card history-item" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", color: "#10b981" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "14px", color: "#ffffff", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{item.description || "ค่าแนะนำเพื่อน"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#cbd5e1" }}>
                      {new Date(item.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(item.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: item.status === "claimed" ? "#10b981" : "#eab308", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                    +฿{fmt(item.amount)}
                  </p>
                  <span style={{ 
                    display: "inline-block", marginTop: "4px", fontSize: "11px", fontWeight: 800, padding: "2px 10px", borderRadius: "6px", 
                    background: item.status === "claimed" ? "rgba(16,185,129,0.2)" : "rgba(234,179,8,0.2)", 
                    color: item.status === "claimed" ? "#4ade80" : "#fde047",
                    border: `1px solid ${item.status === "claimed" ? "rgba(16,185,129,0.4)" : "rgba(234,179,8,0.4)"}`
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
        /* 🟢 ธีมกระจกใส ปรับให้ดำทึบขึ้น เพื่อตัดกับพื้นหลังที่สว่างจัด (ของเดิมคุณ) */
        .glass-card {
          background: rgba(10, 10, 20, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.1);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .history-item:hover {
          transform: translateY(-2px);
          border-color: rgba(168, 85, 247, 0.8);
          background: rgba(20, 20, 30, 0.85);
        }

        /* 🟢 ปุ่มกดรับค่าแนะนำ (สีทอง 3D ของเดิม) */
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

        /* 🔴 ปุ่มกดไม่ได้ (สีเทาจม) */
        .btn-claim-disabled {
          background: rgba(0, 0, 0, 0.4);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: inset 0 4px 8px rgba(0,0,0,0.6);
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
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