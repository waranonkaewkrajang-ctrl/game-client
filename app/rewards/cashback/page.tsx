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
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "24px", height: "24px", border: "2px solid #27272a", borderTopColor: "#fafafa", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", color: "#fafafa", paddingBottom: "6rem", fontFamily: "'Kanit', sans-serif", position: "relative", overflow: "hidden" }}>

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
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fafafa", margin: 0 }}>รับยอดเสีย (Cashback)</h1>
            <p style={{ fontSize: "0.7rem", color: "#a1a1aa", margin: 0 }}>คำนวณจากยอดเสียรายวัน</p>
          </div>
        </div>

        {/* ยอดรอรับ */}
        <div style={{ background: "rgba(26, 26, 46, 0.4)", backdropFilter: "blur(8px)", borderRadius: "16px", padding: "24px 20px", border: "1px solid rgba(124,58,237,0.3)", marginBottom: "1rem", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(124,58,237,0.1)" }}>
          <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#a1a1aa" }}>ยอดเสียรอรับ</p>
          <p style={{ margin: "0 0 16px", fontSize: "36px", fontWeight: 700, color: "#fafafa" }}>
            <span style={{ fontSize: "18px", color: "#f59e0b", marginRight: "4px" }}>฿</span>
            {fmt(summary?.cashback?.pending || 0)}
          </p>
          <button
            onClick={handleClaim}
            disabled={claiming || !(summary?.cashback?.pending > 0)}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none", cursor: summary?.cashback?.pending > 0 ? "pointer" : "not-allowed",
              background: summary?.cashback?.pending > 0 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.08)",
              color: summary?.cashback?.pending > 0 ? "#000" : "#71717a",
              fontSize: "1rem", fontWeight: 700, transition: "all 0.2s",
              opacity: claiming ? 0.6 : 1,
            }}
          >
            {claiming ? "กำลังรับ..." : summary?.cashback?.pending > 0 ? "กดรับยอดเสีย" : "ไม่มียอดเสียรอรับ"}
          </button>
        </div>

        {/* สรุปยอดที่รับแล้ว */}
        <div style={{ background: "rgba(18, 18, 20, 0.4)", backdropFilter: "blur(8px)", borderRadius: "12px", padding: "16px 20px", border: "1px solid rgba(124,58,237,0.2)", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#71717a" }}>รับแล้วทั้งหมด</p>
            <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#10b981" }}>฿{fmt(summary?.cashback?.claimed || 0)}</p>
          </div>
          <div style={{ width: "1px", background: "#27272a" }} />
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#71717a" }}>รอรับ</p>
            <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#f59e0b" }}>฿{fmt(summary?.cashback?.pending || 0)}</p>
          </div>
        </div>

        {/* ประวัติ */}
        <h2 style={{ fontSize: "13px", color: "#71717a", fontWeight: 500, marginBottom: "8px", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>ประวัติยอดเสีย</h2>
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
                    {item.description || "คืนยอดเสีย"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#71717a" }}>
                    {new Date(item.created_at).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })} {new Date(item.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#f59e0b" }}>+฿{fmt(item.amount)}</p>
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