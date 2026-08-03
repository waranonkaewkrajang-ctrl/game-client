"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [rewards, setRewards] = useState<any>(null);
  const [rank, setRank] = useState<any>(null);
  const [acceptPromo, setAcceptPromo] = useState(true); // เพิ่ม state สำหรับปุ่มรับโปร

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    api.get("/auth/me").then((res) => setUser(res.data.data)).catch(() => {});
    api.get("/wallet/balance").then((res) => setWallet(res.data.data)).catch(() => {});
    api.get("/rewards/summary").then((res) => setRewards(res.data.data)).catch(() => {});
    api.get("/user/rank").then((res) => setRank(res.data.data)).catch(() => {});
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
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2.5rem" }}>
          {/* กรอบรูป + แรงค์ */}
          <div style={{ position: "relative", marginBottom: "1rem" }}>
            <div className="flip-container" style={{ width: "90px", height: "90px", perspective: "500px" }}>
              <div className="flip-inner" style={{
                width: "100%", height: "100%", position: "relative",
                transformStyle: "preserve-3d",
              }}>
                {/* ด้านหน้า - การ์ตูน */}
                <div style={{
                  position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden",
                  borderRadius: "50%", padding: "3px",
                  background: rank?.current_rank?.color ? `conic-gradient(${rank.current_rank.color}, #9333ea, ${rank.current_rank.color})` : "conic-gradient(#3b82f6, #9333ea, #ec4899, #f59e0b, #3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: "82px", height: "82px", borderRadius: "50%", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'game'}&backgroundColor=09090b`} alt="avatar" style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                  </div>
                </div>
                {/* ด้านหลัง - รูปแรงค์ */}
                <div style={{
                  position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)", borderRadius: "50%", padding: "3px",
                  background: rank?.current_rank?.color ? `conic-gradient(${rank.current_rank.color}, #9333ea, ${rank.current_rank.color})` : "conic-gradient(#3b82f6, #9333ea, #ec4899, #f59e0b, #3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: "82px", height: "82px", borderRadius: "50%", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {rank?.current_rank?.image_url ? (
                      <img src={rank.current_rank.image_url} alt="rank" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: "24px", fontWeight: 800, color: rank?.current_rank?.color || "#f59e0b" }}>{rank?.current_rank?.name?.charAt(0) || "?"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* ป้ายแรงค์ */}
            <div style={{
              position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)",
              background: rank?.current_rank?.color ? `linear-gradient(135deg, ${rank.current_rank.color}, ${rank.current_rank.color}dd)` : "linear-gradient(135deg, #71717a, #52525b)",
              color: "#fff", fontSize: "9px", fontWeight: 800, padding: "2px 10px", borderRadius: "10px",
              border: "2px solid #09090b", whiteSpace: "nowrap",
            }}>{rank?.current_rank?.name || "ไม่มีแรงค์"}</div>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 4px 0", letterSpacing: "0.5px" }}>{user.full_name || "สมาชิกทั่วไป"}</h1>
          <p style={{ color: "#a1a1aa", fontSize: "14px", margin: 0 }}>@{user.username}</p>

          {/* Progress แรงค์ถัดไป */}
          {rank?.next_rank && (
            <div style={{ width: "100%", maxWidth: "280px", marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#71717a", marginBottom: "4px" }}>
                <span>{rank.current_rank?.name || "-"}</span>
                <span>{rank.next_rank.name}</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#27272a", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${rank.progress}%`, height: "100%", background: rank.current_rank?.color || "#7c3aed", borderRadius: "3px", transition: "width 0.5s" }} />
              </div>
              <p style={{ fontSize: "10px", color: "#52525b", margin: "4px 0 0", textAlign: "center" }}>
                ฝากอีก ฿{((rank.next_rank.min_deposit || 0) - (rank.total_deposit || 0)).toLocaleString()} ถึงแรงค์ถัดไป
              </p>
            </div>
          )}
        </div>

      {/* 💳 Card: กระเป๋าเงินแบบใหม่ (สีม่วงอมชมพู นูน 3D + สวิตช์รับโปร) */}
        <div style={{ 
          background: "linear-gradient(180deg, rgba(88, 28, 135, 0.85) 0%, rgba(157, 23, 77, 0.9) 100%)", 
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", 
          borderRadius: "24px", padding: "24px 20px", marginBottom: "1.5rem",
          border: "1px solid rgba(236, 72, 153, 0.3)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.5), inset 0 3px 2px rgba(255,255,255,0.08), inset 0 -4px 6px rgba(0,0,0,0.4)" 
        }}>
          
          {/* ส่วนบน: ข้อมูล + ปุ่มสวิตช์ */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            
            {/* ฝั่งซ้าย: ข้อมูล */}
            <div style={{ textAlign: "left" }}>
              <span className="blink-text" style={{ fontSize: "15px", fontWeight: 700, color: "#eab308", letterSpacing: "0.5px" }}>ยินดีต้อนรับ !!</span>
              <p style={{ fontSize: "16px", margin: "4px 0 10px", color: "#fafafa" }}>{user?.phone || "-"}</p>
              
              <span className="blink-text" style={{ fontSize: "13px", color: "#eab308" }}>เลขบัญชีธนาคาร</span>
              <p style={{ fontSize: "16px", margin: "4px 0 0", color: "#fafafa", fontWeight: 500 }}>{user?.bank_account || "-"}</p>
            </div>

            {/* ฝั่งขวา: สวิตช์เปิด-ปิดโปร */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <button 
                onClick={() => setAcceptPromo(!acceptPromo)}
                style={{ 
                  position: "relative", width: "68px", height: "32px", borderRadius: "30px", cursor: "pointer",
                  background: acceptPromo ? "linear-gradient(180deg, #16a34a, #15803d)" : "linear-gradient(180deg, #dc2626, #b91c1c)",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)",
                  transition: "background 0.3s",
                  border: acceptPromo ? "2px solid #4ade80" : "2px solid #f87171"
                }}
              >
                <div style={{ 
                  position: "absolute", top: "1px", left: acceptPromo ? "37px" : "1px", 
                  width: "26px", height: "26px", borderRadius: "50%", background: "#fff", 
                  boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 -2px 2px rgba(0,0,0,0.1)",
                  transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }} />
              </button>
              <span style={{ fontSize: "13px", fontWeight: 600, color: acceptPromo ? "#4ade80" : "#f87171" }}>
                {acceptPromo ? "รับโปร" : "ไม่รับโปร"}
              </span>
            </div>
          </div>

          {/* เส้นคั่นสีแดงอ่อน */}
          <div style={{ height: "1px", background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(236, 72, 153, 0.4)", marginBottom: "20px" }} />

          {/* ส่วนล่าง: เครดิต และ คะแนน */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "center" }}>
           <div>
              <p style={{ fontSize: "15px", color: "#fafafa", margin: "0 0 4px" }}>เครดิต</p>
              
              {/* ใช้ Flex ครอบตัวเลขและปุ่มรีเฟรชให้อยู่บรรทัดเดียวกัน */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#eab308", margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                  {wallet?.balance ?? "0.00"} <span style={{ fontSize: "14px", fontWeight: 400 }}>฿</span>
                </p>
                
                {/* 🔄 ปุ่มรีเฟรชเครดิต (อยู่หลัง ฿) */}
                <button 
                  onClick={() => {
                    // เรียก API ดึงข้อมูลกระเป๋าเงินใหม่ทันทีเมื่อกด
                    api.get("/wallet/balance").then((res) => setWallet(res.data.data)).catch(() => {});
                  }}
                  style={{ 
                    background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", 
                    padding: "4px", borderRadius: "50%", color: "#eab308", display: "flex",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                  }}
                  title="รีเฟรชยอดเงิน"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                       style={{ transition: "transform 0.4s ease-in-out" }} 
                       onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(180deg)"} 
                       onMouseLeave={(e) => e.currentTarget.style.transform = "rotate(0deg)"}>
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </button>
              </div>

            </div>
            <div>
              <p style={{ fontSize: "15px", color: "#fafafa", margin: "0 0 4px" }}>คะแนน</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#eab308", margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                {user?.points ?? "200"} 
              </p>
            </div>
          </div>
          
        </div>

       {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Card: รับรางวัล */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* ปุ่มรับยอดเสีย */}
              <a href="/rewards/cashback" className="designer-btn">
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* กรอบไอคอนเดิมจากโค้ดของคุณเป๊ะๆ */}
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <img src="https://i.ibb.co/R4kjVQcm/image.png" alt="cashback" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fafafa" }}>รับยอดเสีย</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#a1a1aa" }}>คืนยอดเสียรายวัน</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: rewards?.cashback?.pending > 0 ? "#f59e0b" : "#71717a" }}>
                      ฿{rewards?.cashback?.pending?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00"}
                    </p>
                    {rewards?.cashback?.pending > 0 && (
                      <span className="badge badge-orange">รอรับ</span>
                    )}
                  </div>
                  <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </a>

              {/* ปุ่มรับค่าแนะนำ */}
              <a href="/rewards/referral" className="designer-btn">
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* กรอบไอคอนเดิมจากโค้ดของคุณเป๊ะๆ */}
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.1))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <img src="https://i.ibb.co/rKmzVHgv/Chat-GPT-Image-1-2569-04-18-15.png" alt="referral" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fafafa" }}>แนะนำเพื่อน</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#a1a1aa" }}>รับค่าคอมจากเพื่อน</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: rewards?.referral?.pending > 0 ? "#10b981" : "#71717a" }}>
                      ฿{rewards?.referral?.pending?.toLocaleString("th-TH", { minimumFractionDigits: 2 }) || "0.00"}
                    </p>
                    {rewards?.referral?.pending > 0 && (
                      <span className="badge badge-green">รอรับ</span>
                    )}
                  </div>
                  <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </a>

              {/* ปุ่มวงล้อเสี่ยงโชค */}
              <a href="/spin-wheel" className="designer-btn">
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* กรอบไอคอนเดิมจากโค้ดของคุณเป๊ะๆ */}
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(250,204,21,0.2), rgba(245,158,11,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", border: "1px solid rgba(250,204,21,0.2)" }}>
                    🎡
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#fafafa" }}>วงล้อเสี่ยงโชค</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#a1a1aa" }}>หมุนลุ้นรางวัลทุกวัน</p>
                  </div>
                </div>
                <svg className="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </a>
            </div>
          </div>

          {/* Card 1: บัญชีธนาคาร */}
          <div>
            <h2 style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600, marginBottom: "12px", paddingLeft: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              การเงิน
            </h2>
            <div className="info-card">
             <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <img 
                  src={`/logos/${user.bank_code || 'BAY'}.webp`}
                  alt={user.bank_code}
                  style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "contain", background: "#fff", padding: "4px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                  onError={(e) => { e.currentTarget.src = "/logos/BBL.webp"; }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#a1a1aa", textTransform: "uppercase" }}>{user.bank_code || "ธนาคาร"}</p>
                  <p style={{ margin: "2px 0", fontSize: "16px", fontWeight: 600, color: "#fafafa", letterSpacing: "1px" }}>{user.bank_account || "-"}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#a1a1aa" }}>{user.bank_name || "-"}</p>
                </div>
                <div className="badge badge-green">
                  อนุมัติ
                </div>
              </div>
              <InfoRow label="คัดลอกเลขบัญชี" value={user.bank_account} canCopy={true} isLast={true} />
            </div>
          </div>

          {/* Card 2: ข้อมูลส่วนตัว */}
          <div>
            <h2 style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600, marginBottom: "12px", paddingLeft: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              ข้อมูลส่วนตัว
            </h2>
            <div className="info-card">
              <InfoRow label="เบอร์โทรศัพท์" value={user.phone} />
              <InfoRow label="สถานะบัญชี" value={user.status === "active" ? "ปกติ" : user.status} />
              <InfoRow label="รหัสแนะนำเพื่อน" value={user.referral_code || "-"} canCopy={true} isLast={true} />
            </div>
          </div>

          {/* Card 3: ระบบ */}
          <div>
            <h2 style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: 600, marginBottom: "12px", paddingLeft: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
              ระบบ
            </h2>
            <div className="info-card">
              <InfoRow label="ใช้งานล่าสุด"
                value={user.last_login_at ? new Date(user.last_login_at).toLocaleDateString("th-TH", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"} 
                isLast={true} 
              />
            </div>
          </div>

        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `

      /* เพิ่ม Class กะพริบสำหรับตัวหนังสือ */
      .blink-text {
        animation: blink 2s linear infinite;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }

     /* --- สไตล์ปุ่มแบบ UI/UX Designer (สีม่วงชมพู 3D) --- */
      .designer-btn {
        text-decoration: none;
        /* เปลี่ยนพื้นหลังเป็น Gradient ม่วง-ชมพู */
        background: linear-gradient(180deg, rgba(88, 28, 135, 0.6) 0%, rgba(157, 23, 77, 0.7) 100%);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 16px 20px;
        /* ขอบสีชมพูอ่อนๆ */
        border: 1px solid rgba(236, 72, 153, 0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
        /* สร้างความนูน 3D เหมือนกระเป๋าเงิน (เงาตกกระทบ + แสงสะท้อนขอบในบน-ล่าง) */
        box-shadow: 0 8px 16px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.1), inset 0 -4px 6px rgba(0,0,0,0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .designer-btn:hover {
        transform: translateY(-3px);
        /* สว่างขึ้นเมื่อเอาเมาส์ชี้ */
        background: linear-gradient(180deg, rgba(107, 33, 168, 0.8) 0%, rgba(190, 24, 93, 0.9) 100%);
        border-color: rgba(236, 72, 153, 0.6);
        box-shadow: 0 12px 24px rgba(0,0,0,0.5), 0 0 15px rgba(236, 72, 153, 0.3), inset 0 2px 2px rgba(255,255,255,0.15), inset 0 -4px 6px rgba(0,0,0,0.4);
      }

      /* ไอคอนลูกศรเลื่อนเมื่อ Hover */
      .arrow-icon {
        color: #52525b;
        transition: all 0.3s ease;
      }
      .designer-btn:hover .arrow-icon {
        color: #a78bfa;
        transform: translateX(4px);
      }

     /* การ์ดข้อมูลทั่วไป (การเงิน, ข้อมูลส่วนตัว, ระบบ) - ธีมม่วงชมพู 3D */
      .info-card {
        /* เปลี่ยนสีพื้นหลังเป็นไล่สีม่วงชมพู */
        background: linear-gradient(180deg, rgba(88, 28, 135, 0.6) 0%, rgba(157, 23, 77, 0.7) 100%);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 16px;
        padding: 0 20px;
        /* เปลี่ยนขอบเป็นสีชมพูเรืองแสง */
        border: 1px solid rgba(236, 72, 153, 0.3);
        /* สร้างความนูน 3D ด้วยเงาเหมือนกล่องด้านบน */
        box-shadow: 0 8px 16px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.1), inset 0 -4px 6px rgba(0,0,0,0.3);
      }

      /* ป้ายกำกับ (รอรับ, อนุมัติ) */
      .badge {
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
      }
      .badge-orange {
        background: rgba(245,158,11,0.15);
        color: #f59e0b;
        border: 1px solid rgba(245,158,11,0.3);
      }
      .badge-green {
        background: rgba(16,185,129,0.15);
        color: #10b981;
        border: 1px solid rgba(16,185,129,0.3);
      }

      /* --- อนิเมชั่นเดิม --- */
      @keyframes flipCard {
          0% { transform: rotateY(0deg); }
          20% { transform: rotateY(0deg); }
          30% { transform: rotateY(180deg); }
          70% { transform: rotateY(180deg); }
          80% { transform: rotateY(360deg); }
          100% { transform: rotateY(360deg); }
      }
      .flip-inner { animation: flipCard 5s ease-in-out infinite; }
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