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
        background: "#18181b",
        color: "#f8fafc",
        confirmButtonColor: "#10b981",
        customClass: { popup: 'modern-swal' }
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
        customClass: { popup: 'modern-swal' }
      });
    }
    setClaiming(false);
  };

  const copyCode = () => {
    if (!user?.referral_code) return;
    navigator.clipboard.writeText(user.referral_code);
    Swal.fire({ text: "คัดลอกรหัสแนะนำแล้ว", toast: true, position: "top", showConfirmButton: false, timer: 2000, background: "#27272a", color: "#fafafa", customClass: { popup: 'modern-toast' } });
  };

  const copyLink = () => {
    if (!user?.referral_code) return;
    const link = `${window.location.origin}/register?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link);
    Swal.fire({ text: "คัดลอกลิงก์แนะนำแล้ว", toast: true, position: "top", showConfirmButton: false, timer: 2000, background: "#27272a", color: "#fafafa", customClass: { popup: 'modern-toast' } });
  };

  const fmt = (n: number) => n?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#f8fafc", paddingBottom: "6rem", fontFamily: "'Kanit', sans-serif" }}>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 1.25rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "2rem" }}>
          <button onClick={() => router.push("/profile")} className="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "0.2px" }}>แนะนำเพื่อน</h1>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "2px 0 0" }}>รับค่าคอมมิชชันจากยอดเดิมพันเพื่อน</p>
          </div>
        </div>

        {/* รหัสแนะนำ และ ลิงก์ */}
        <div className="modern-card" style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ width: "3px", height: "16px", background: "#10b981", borderRadius: "2px" }} />
            <h3 style={{ margin: 0, fontSize: "14px", color: "#e2e8f0", fontWeight: 500 }}>รหัสและลิงก์แนะนำของคุณ</h3>
          </div>
          
          {/* กล่องใส่รหัส */}
          <div className="input-box" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <p style={{ margin: "0 0 2px 0", fontSize: "11px", color: "#64748b" }}>รหัสแนะนำ</p>
              <span style={{ fontSize: "20px", fontWeight: 600, color: "#34d399", letterSpacing: "1px" }}>
                {user?.referral_code || "-"}
              </span>
            </div>
            <button onClick={copyCode} className="btn-outline-green">
              คัดลอก
            </button>
          </div>

          {/* ระบบสร้างลิงก์ */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
            {!linkGenerated ? (
              <button onClick={() => setLinkGenerated(true)} className="btn-outline-purple">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                สร้างลิงก์แนะนำสำหรับยูสใหม่
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px", animation: "fadeIn 0.2s ease-out" }}>
                <div className="input-box" style={{ flex: 1, padding: "10px 14px", color: "#94a3b8", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
                  {`${window.location.origin}/register?ref=${user?.referral_code}`}
                </div>
                <button onClick={copyLink} className="btn-solid-green">
                  คัดลอกลิงก์
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🌟 Hero Card: ยอดรอรับ (ดีไซน์เรียบหรู) */}
        <div className="hero-card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "inline-block", background: "rgba(0,0,0,0.3)", padding: "4px 12px", borderRadius: "100px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: "12px", color: "#cbd5e1", fontWeight: 400 }}>ค่าแนะนำที่สามารถกดรับได้</span>
          </div>
          
          <div style={{ marginBottom: "24px", display: "flex", justifyItems: "center", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "20px", color: "#fbbf24", fontWeight: 500 }}>฿</span>
            <span style={{ fontSize: "40px", fontWeight: 600, color: "#fff", letterSpacing: "0.5px" }}>
              {fmt(summary?.referral?.pending || 0)}
            </span>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming || !(summary?.referral?.pending > 0)}
            className={summary?.referral?.pending > 0 ? "btn-claim-active" : "btn-claim-disabled"}
          >
            {claiming ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid #451a03", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                กำลังดำเนินการ...
              </div>
            ) : summary?.referral?.pending > 0 ? (
              <>รับค่าแนะนำเข้ากระเป๋า</>
            ) : (
              "ไม่มียอดรอรับ"
            )}
          </button>
        </div>

        {/* การ์ดจำนวนเพื่อนที่แนะนำ */}
        <div className="modern-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", fontWeight: 400 }}>จำนวนเพื่อนที่แนะนำ</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
              <span style={{ fontSize: "28px", fontWeight: 600, color: "#fff" }}>
                {user?.referral_count || 0}
              </span>
              <span style={{ fontSize: "13px", color: "#64748b" }}>คน</span>
            </div>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", display: "flex", justifyContent: "center", alignItems: "center", color: "#94a3b8" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>

        {/* สรุป ยอดเงิน */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "2rem" }}>
          <div className="modern-card" style={{ padding: "16px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 400 }}>รับแล้วทั้งหมด</p>
            <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 600, color: "#34d399" }}>
              ฿{fmt(summary?.referral?.claimed || 0)}
            </p>
          </div>
          <div className="modern-card" style={{ padding: "16px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 400 }}>ยอดรอรับ</p>
            <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 600, color: "#fbbf24" }}>
              ฿{fmt(summary?.referral?.pending || 0)}
            </p>
          </div>
        </div>

        {/* ประวัติ */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h2 style={{ fontSize: "14px", color: "#cbd5e1", fontWeight: 500, margin: 0 }}>ประวัติค่าแนะนำล่าสุด</h2>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {history.length === 0 ? (
            <div className="modern-card" style={{ padding: "24px", textAlign: "center", background: "transparent", borderStyle: "dashed" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>ยังไม่มีประวัติการรับค่าแนะนำ</p>
            </div>
          ) : (
            history.map((item: any) => (
              <div key={item.id} className="modern-card history-item" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{item.description || "ค่าแนะนำเพื่อน"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                      {new Date(item.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} • {new Date(item.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: item.status === "claimed" ? "#34d399" : "#fbbf24" }}>
                    +฿{fmt(item.amount)}
                  </p>
                  <span style={{ 
                    display: "inline-block", marginTop: "4px", fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "4px", 
                    background: item.status === "claimed" ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", 
                    color: item.status === "claimed" ? "#10b981" : "#f59e0b",
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
        /* 💎 กล่องหลักแบบ Modern Clean ไม่สว่างจ้า ไม่มี 3D หนาๆ */
        .modern-card {
          background: rgba(24, 24, 27, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px;
          transition: background 0.2s ease;
        }

        .history-item:hover {
          background: rgba(39, 39, 42, 0.8);
        }

        /* 💎 กล่อง Hero Card ไล่สีแบบพรีเมียมดูหรูหรา (โทนม่วงเข้ม/น้ำเงิน) */
        .hero-card {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          border-radius: 16px;
          padding: 24px 20px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }

        /* 💎 กล่อง Input ภายใน */
        .input-box {
          background: rgba(0, 0, 0, 0.25);
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        /* 💎 ปุ่มต่างๆ แบบ Flat Design */
        .btn-back {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #cbd5e1;
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .btn-back:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .btn-outline-green {
          background: transparent;
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          color: #34d399;
          font-size: 12px;
          font-weight: 500;
          transition: 0.2s;
        }
        .btn-outline-green:hover { background: rgba(52, 211, 153, 0.1); }

        .btn-outline-purple {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(139, 92, 246, 0.3);
          background: transparent;
          color: #c084fc;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          transition: 0.2s;
        }
        .btn-outline-purple:hover { background: rgba(139, 92, 246, 0.1); }

        .btn-solid-green {
          padding: 0 14px;
          border-radius: 8px;
          border: none;
          background: #10b981;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-solid-green:hover { background: #059669; }

        /* 💎 ปุ่มรับรางวัล - แบบคลีนๆ ไม่เรืองแสง */
        .btn-claim-active {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: #fbbf24;
          color: #451a03;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.1s, filter 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .btn-claim-active:hover { filter: brightness(1.05); }
        .btn-claim-active:active { transform: scale(0.98); }

        .btn-claim-disabled {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          cursor: not-allowed;
        }

        /* SweetAlert Custom Styles */
        .modern-toast {
          border-radius: 8px !important;
          padding: 8px 16px !important;
          font-size: 13px !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .modern-swal {
          border-radius: 16px !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </div>
  );
}