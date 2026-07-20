"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null); 

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    api.get("/auth/me").then((res) => setUser(res.data.data)).catch(() => {});
    api.get("/wallet/balance").then((res) => setWallet(res.data.data)).catch(() => {});
  }, []);

  // ฟังก์ชันคัดลอก + แจ้งเตือนสไตล์ Minimal Toast
  const copyToClipboard = (text: string, label: string) => {
    if (!text || text === "-") return;
    navigator.clipboard.writeText(text);
    Swal.fire({
      text: `คัดลอก${label}แล้ว`,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2000,
      background: '#27272a', // สีเทาเข้ม
      color: '#fafafa',
      customClass: { popup: 'minimal-toast' },
      didOpen: (toast) => {
        toast.style.borderRadius = '99px';
        toast.style.padding = '8px 16px';
        toast.style.fontSize = '14px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      }
    });
  };

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#09090b" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <div style={{ width: "24px", height: "24px", border: "2px solid #27272a", borderTopColor: "#fafafa", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    </div>
  );

  // คอมโพเนนต์แถวข้อมูลแบบ Minimal (ใช้ซ้ำได้)
  const InfoRow = ({ label, value, isLast = false, canCopy = false, highlight = false, isBank = false }: any) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: isLast ? "none" : "1px solid #27272a" }}>
      <span style={{ fontSize: "14px", color: "#a1a1aa", fontWeight: 400 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        
        {/* --- ส่วนที่เพิ่มเข้ามาใหม่: โลโก้ธนาคาร --- */}
        {isBank && value && value !== "-" && (
          <img 
            src={`/${value.toLowerCase()}.png`} 
            alt={value} 
            style={{ width: "20px", height: "20px", borderRadius: "4px", objectFit: "cover" }} 
            onError={(e) => e.currentTarget.style.display = 'none'} // ป้องกันรูปเสียถ้ายังไม่มีไฟล์
          />
        )}
        {/* ---------------------------------- */}

        <span style={{ fontSize: "15px", fontWeight: highlight ? 600 : 500, color: highlight ? "#10b981" : "#fafafa", letterSpacing: "0.2px" }}>
          {value}
        </span>
        
        {canCopy && (
          <button 
            onClick={() => copyToClipboard(value, label)}
            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "#71717a", display: "flex", alignItems: "center", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#fafafa"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#71717a"}
            title="คัดลอก"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", color: "#fafafa", paddingBottom: "4rem", fontFamily: "'Kanit', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* เอฟเฟกต์แสงจางๆ ด้านบน (Subtle Glow) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
  {Array.from({ length: 20 }).map((_, i) => (
    <div key={`dice-${i}`} style={{
      position: "absolute",
      top: `${(i * 7) % 100}%`,
      left: `${(i * 11) % 100}%`,
      fontSize: `${18 + (i % 4) * 10}px`,
      opacity: 0.03 + (i % 3) * 0.015,
      animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`,
      animationDelay: `${i * 1.2}s`,
      filter: "grayscale(1) brightness(0.4)",
    }}>🎲</div>
  ))}
</div>
      
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2rem 1.5rem", position: "relative", zIndex: 10 }}>
        
        {/* Profile Header - สไตล์ Premium */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2.5rem" }}>
          {/* กรอบรูป Gradient ขอบบาง */}
          <div style={{ 
            padding: "3px", 
            background: "linear-gradient(135deg, #3b82f6, #9333ea, #ec4899)", 
            borderRadius: "50%", 
            marginBottom: "1rem" 
          }}>
            <div style={{ 
              width: "80px", height: "80px", 
              background: "#09090b", 
              borderRadius: "50%", 
              display: "flex", alignItems: "center", justifyContent: "center" 
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 4px 0", letterSpacing: "0.5px" }}>{user.full_name || "สมาชิกทั่วไป"}</h1>
          <p style={{ color: "#a1a1aa", fontSize: "14px", margin: 0 }}>@{user.username}</p>
        </div>

        {/* ← เพิ่มการ์ดตรงนี้ */}
        <div style={{ background: "rgba(26, 26, 46, 0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: "16px", padding: "24px 20px", border: "1px solid rgba(124,58,237,0.3)", marginBottom: "1.5rem", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(124,58,237,0.1)" }}>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#a1a1aa" }}>ยอดเงินในกระเป๋า</p>
          <p style={{ margin: "0 0 6px", fontSize: "32px", fontWeight: 700, color: "#fafafa" }}>
            <span style={{ fontSize: "18px", color: "#10b981", marginRight: "4px" }}>฿</span>
            {wallet?.balance ?? "0.00"}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "#71717a" }}>
            ข้อมูล ณ เวลา {new Date().toLocaleDateString("th-TH", { day: "2-digit", month: "short" })} {new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Card 1: บัญชีธนาคาร (เอาไว้บนสุดเพราะลูกค้าใช้บ่อยสุด) */}
          <div>
            <h2 style={{ fontSize: "13px", color: "#71717a", fontWeight: 500, marginBottom: "8px", paddingLeft: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              การเงิน
            </h2>
            <div style={{ background: "rgba(18, 18, 20, 0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: "16px", padding: "0 20px", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(124,58,237,0.1)" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 0", borderBottom: "1px solid #27272a" }}>
  <img 
    src={`https://fs.cdnrc.com/payment-layout/iconbank/${user.bank_code || 'BAY'}.png`}
    alt={user.bank_code}
    style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "contain", background: "#fff", padding: "4px" }}
    onError={(e) => { e.currentTarget.src = "https://fs.cdnrc.com/payment-layout/svg/bank.svg"; }}
  />
  <div style={{ flex: 1 }}>
    <p style={{ margin: 0, fontSize: "14px", color: "#a1a1aa" }}>{user.bank_code || "ธนาคาร"}</p>
    <p style={{ margin: "2px 0", fontSize: "16px", fontWeight: 600, color: "#fafafa", letterSpacing: "1px" }}>{user.bank_account || "-"}</p>
    <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa" }}>{user.bank_name || "-"}</p>
  </div>
  <div style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
    อนุมัติ
  </div>
</div>
<InfoRow label="คัดลอกเลขบัญชี" value={user.bank_account} canCopy={true} isLast={true} />
            </div>
          </div>

          {/* Card 2: ข้อมูลส่วนตัว */}
          <div>
            <h2 style={{ fontSize: "13px", color: "#71717a", fontWeight: 500, marginBottom: "8px", paddingLeft: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ข้อมูลส่วนตัว
            </h2>
            <div style={{ background: "rgba(18, 18, 20, 0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: "16px", padding: "0 20px", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(124,58,237,0.1)" }}>
              <InfoRow label="เบอร์โทรศัพท์" value={user.phone} />
              <InfoRow label="สถานะบัญชี" value={user.status === "active" ? "ปกติ" : user.status} />
              <InfoRow label="รหัสแนะนำเพื่อน" value={user.referral_code || "-"} canCopy={true} isLast={true} />
            </div>
          </div>

          {/* Card 3: ความปลอดภัย */}
          <div>
            <h2 style={{ fontSize: "13px", color: "#71717a", fontWeight: 500, marginBottom: "8px", paddingLeft: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ระบบ
            </h2>
            <div style={{ background: "rgba(18, 18, 20, 0.4)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: "16px", padding: "0 20px", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(124,58,237,0.1)" }}>
                <InfoRow label="ใช้งานล่าสุด"
                value={user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("th-TH", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"} 
                isLast={true} 
              />
            </div>
          </div>

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
  div[style*="floatDice"] {
    opacity: 0.15 !important;
    filter: grayscale(1) brightness(1.2) !important;
  }
  @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');
`}} />
    </div>
  );
}