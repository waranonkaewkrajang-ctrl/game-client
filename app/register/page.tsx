"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", phone: "", password: "", password_confirmation: "", bank_code: "SCB", bank_account: "", bank_name: "", referral_code: "" });
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const banks = [
    { code: "SCB",   name: "ไทยพาณิชย์",     color: "#4E2A84", logo: "/logos/SCB.webp" },
    { code: "KBANK", name: "กสิกรไทย",       color: "#138F2D", logo: "/logos/KBANK.webp" },
    { code: "BBL",   name: "กรุงเทพ",        color: "#1E3A8A", logo: "/logos/BBL.webp" },
    { code: "KTB",   name: "กรุงไทย",        color: "#1BA5E0", logo: "/logos/KTB.webp" },
    { code: "TTB",   name: "ทีทีบี",          color: "#FC6F21", logo: "/logos/TTB.webp" },
    { code: "BAY",   name: "กรุงศรี",        color: "#FEC52E", logo: "/logos/BAY.webp" },
    { code: "GSB",   name: "ออมสิน",         color: "#EB1188", logo: "/logos/GSB.webp" },
    { code: "LH",    name: "แลนด์ แอนด์ เฮ้าส์", color: "#6D9B34", logo: "/logos/LHFG.webp" },
    { code: "CIMB",  name: "ซีไอเอ็มบี ไทย",  color: "#7B0E2F", logo: "/logos/CIMBT.webp" },
    { code: "UOB",   name: "ยูโอบี",          color: "#0B3D91", logo: "/logos/UOBT.webp" },
    { code: "TISCO", name: "ทิสโก้",          color: "#1A3B6B", logo: "/logos/TISCO.webp" },
    { code: "KK",    name: "เกียรตินาคินภัทร",  color: "#004E2F", logo: "/logos/KKP.webp" },
    { code: "TRUEWALLET", name: "TrueWallet", color: "#FF6F00", logo: "/logos/TRUEWALLET.webp" },
  ];

  // 🔒 Validate ชื่อบัญชีจริง
  const validateFullName = (name: string): string | null => {
    const trimmed = name.trim();
    
    if (!trimmed) return "กรุณากรอกชื่อบัญชี";
    
    // 1. ต้องมี 2 คำขึ้นไป (ชื่อ + นามสกุล)
    const words = trimmed.split(/\s+/);
    if (words.length < 2) {
      return "กรุณากรอกชื่อ และ นามสกุล (คั่นด้วยเว้นวรรค)";
    }
    
    // 2. แต่ละคำต้องมีอย่างน้อย 2 ตัวอักษร
    for (const word of words) {
      if (word.length < 2) {
        return "ชื่อและนามสกุลต้องมีอย่างน้อย 2 ตัวอักษร";
      }
    }
    
    // 3. รับเฉพาะไทย + อังกฤษ (ห้ามตัวเลข/สัญลักษณ์)
    const validPattern = /^[ก-๙a-zA-Z\s]+$/;
    if (!validPattern.test(trimmed)) {
      return "ชื่อต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น (ห้ามตัวเลข/สัญลักษณ์)";
    }
    
    // 4. Blacklist ชื่อธนาคาร + คำต้องห้าม
    const blacklist = [
      'truewallet', 'true wallet', 'truemoney', 'true money',
      'scb', 'ไทยพาณิชย์', 'siam commercial',
      'kbank', 'กสิกร', 'kasikorn',
      'ktb', 'กรุงไทย', 'krung thai',
      'bay', 'กรุงศรี', 'krungsri',
      'bbl', 'กรุงเทพ', 'bangkok bank',
      'ttb', 'ทหารไทย', 'tmb',
      'gsb', 'ออมสิน',
      'baac', 'ธกส', 'ธ.ก.ส.',
      'ghb', 'อาคารสงเคราะห์',
      'cimb', 'ซีไอเอ็มบี',
      'test', 'admin', 'user', 'demo', 'null', 'none',
    ];
    
    const lowerName = trimmed.toLowerCase().replace(/\s+/g, '');
    for (const bad of blacklist) {
      const cleanBad = bad.toLowerCase().replace(/\s+/g, '');
      if (lowerName === cleanBad) {
        return "กรุณากรอกชื่อ-นามสกุลจริง (ห้ามใช้ชื่อธนาคาร)";
      }
    }
    
    return null; // ✅ ผ่าน
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔒 Validate ชื่อบัญชี
    const nameError = validateFullName(form.bank_name);
    if (nameError) {
      Swal.fire({ icon: "error", title: "ข้อมูลไม่ถูกต้อง", text: nameError, background: "#ffffff", color: "#0f172a", confirmButtonColor: "#7c3aed" });
      return;
    }
    
    if (form.password !== form.password_confirmation) {
      Swal.fire({ icon: "error", title: "รหัสผ่านไม่ตรงกัน", background: "#1a1a2e", color: "#e2e8f0", confirmButtonColor: "#7c3aed" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem("user_token", res.data.data.token);
      localStorage.setItem("user_data", JSON.stringify(res.data.data.user));
      Swal.fire({ icon: "success", title: "สมัครสมาชิกสำเร็จ", timer: 1500, showConfirmButton: false, background: "#1a1a2e", color: "#e2e8f0" });
      setTimeout(() => router.push("/lobby"), 1500);
    } catch (err: any) {
      // ดึงข้อความ error ตัวแรกจาก validation (ชื่อซ้ำ/เบอร์ซ้ำ/เลขบัญชีซ้ำ)
      const errors = err.response?.data?.errors;
      const firstError = errors ? Object.values(errors)[0] : null;
      const msg = (Array.isArray(firstError) ? firstError[0] : firstError) || err.response?.data?.message || "เกิดข้อผิดพลาด";
      Swal.fire({
        icon: "error",
        title: "สมัครไม่สำเร็จ",
        text: msg,
        background: "#ffffff",
        color: "#0f172a",
        confirmButtonColor: "#7c3aed",
        confirmButtonText: "ตกลง",
      });
      
    } finally { setLoading(false); }
  };

  const set = (key: string, val: string) => {
    if (key === "bank_code" && val === "TRUEWALLET") {
      setForm({ ...form, bank_code: val, bank_name: "" });
  } else {
    setForm({ ...form, [key]: val });
  }
};

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", alignItems: "center", justifyContent: "center", 
      padding: "2rem 1rem", 
      background: "url('/bg-desktop.webp') center/cover no-repeat",
      position: "relative", overflow: "hidden", fontFamily: "sans-serif" 
    }}>
      
      {/* พื้นหลังลูกเต๋าเคลื่อนไหว (แบบเดียวกับหน้า Login) */}
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

      <div style={{ width: "100%", maxWidth: "480px", position: "relative", zIndex: 10 }}>
        
        {/* Form Container (Glassmorphism Effect) */}
        <div className="glass-card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* 🟢 วางแทรกโค้ดนี้ตรงนี้ครับ 🟢 */}
            <h2 style={{ textAlign: "center", color: "#fff", margin: "0 0 0.5rem 0", fontSize: "1.5rem", fontWeight: "700" }}>
              สมัครสมาชิก
            </h2>
            
            {/* แถวที่ 1: ชื่อผู้ใช้ & เบอร์โทร */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="input-group">
                <label>ชื่อผู้ใช้งาน</label>
                <input placeholder="Username" value={form.username} onChange={(e) => set("username", e.target.value)} required />
              </div>
              <div className="input-group">
                <label>เบอร์โทรศัพท์</label>
                <input placeholder="0812345678" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
              </div>
            </div>

            {/* แถวที่ 2: รหัสผ่าน & ยืนยันรหัสผ่าน */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="input-group">
                <label>รหัสผ่าน</label>
                <input type="password" placeholder="อย่างน้อย 6 ตัว" value={form.password} onChange={(e) => set("password", e.target.value)} required />
              </div>
              <div className="input-group">
                <label>ยืนยันรหัสผ่าน</label>
                <input type="password" placeholder="กรอกอีกครั้ง" value={form.password_confirmation} onChange={(e) => set("password_confirmation", e.target.value)} required />
              </div>
            </div>

            {/* แถวที่ 3: ธนาคาร (ปรับใหม่ใส่โลโก้ได้) */}
            <div className="input-group" style={{ position: "relative" }}>
              <label>ธนาคาร / วอลเล็ท</label>
              
              {/* ปุ่มกดเปิด/ปิด Dropdown */}
              <div 
                className="custom-select-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img 
                    src={banks.find(b => b.code === form.bank_code)?.logo} 
                    alt="logo" 
                    onError={(e) => {
                      // ถ้าหารูปไม่เจอ ให้ใช้สีพื้นหลังแทน
                      e.currentTarget.style.display = 'none';
                      if(e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                      }
                    }}
                    style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} 
                  />
                  {/* กล่องสีสำรอง กรณีไม่มีรูป */}
                  <div style={{ display: "none", width: "24px", height: "24px", borderRadius: "50%", background: banks.find(b => b.code === form.bank_code)?.color || "#666" }} />
                  <span>{banks.find(b => b.code === form.bank_code)?.name}</span>
                </div>
                <div style={{ transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s", color: "#64748b" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              {/* รายการตัวเลือกที่จะโผล่มาตอนกด */}
              {isDropdownOpen && (
                <>
                  <div 
                    style={{ position: "fixed", inset: 0, zIndex: 10 }} 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  
                  <div className="custom-select-options">
                    <div style={{ padding: "4px 12px", fontSize: "0.75rem", color: "#94a3b8", fontWeight: "bold" }}>เลือกธนาคาร/วอลเล็ท</div>
                    {banks.map((b) => (
                      <div 
                        key={b.code} 
                        className="custom-select-item"
                        onClick={() => {
                          set("bank_code", b.code);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <img 
                          src={b.logo} 
                          alt={b.name} 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if(e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                            }
                          }}
                          style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} 
                        />
                        <div style={{ display: "none", width: "24px", height: "24px", borderRadius: "50%", background: b.color }} />
                        <span>{b.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* แถวที่ 4: เลขบัญชี & ชื่อบัญชี (ซ่อนเมื่อเลือก TrueWallet) */}
            {form.bank_code === "TRUEWALLET" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label>เบอร์ TrueWallet</label>
                  <input placeholder="0812345678" value={form.bank_account} onChange={(e) => set("bank_account", e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>ชื่อ-นามสกุล</label>
                  <input placeholder="ชื่อจริง นามสกุล" value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} required />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="input-group">
                  <label>เลขบัญชี</label>
                  <input placeholder="1234567890" value={form.bank_account} onChange={(e) => set("bank_account", e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>ชื่อบัญชี</label>
                  <input placeholder="ชื่อ-นามสกุล" value={form.bank_name} onChange={(e) => set("bank_name", e.target.value)} required />
                </div>
              </div>
            )}

            {/* แถวที่ 5: รหัสแนะนำ */}
            <div className="input-group">
              <label>รหัสแนะนำ (ถ้ามี)</label>
              <input placeholder="รหัสเพื่อนชวน" value={form.referral_code} onChange={(e) => set("referral_code", e.target.value)} />
            </div>

            {/* ปุ่ม Submit แบบมีแสงวิ่ง */}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner"></span> : "สมัครสมาชิก"}
            </button>

            {/* ลิงก์กลับไปหน้า Login */}
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>มีบัญชีแล้วใช่หรือไม่? </span>
              <a href="/login" className="login-link">เข้าสู่ระบบ</a>
            </div>

          </form>
        </div>
      </div>

      {/* --- CSS สำหรับ กราฟิกขยับได้ (Animations) และความสวยงาม --- */}
      <style dangerouslySetInnerHTML={{__html: `
        /* ดีไซน์กล่องแก้ว (Glassmorphism Card) */
        .glass-card {
          background: rgba(15, 15, 30, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 2.5rem 2.25rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* ช่องกรอกข้อมูล */
        .input-group label {
          display: block; font-size: 0.85rem; font-weight: 500; color: #cbd5e1; margin-bottom: 0.5rem;
        }
        .input-group input, .input-group select {
          width: 100%; height: 50px;
          background: rgba(30, 30, 50, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; padding: 0 16px; color: #fff; font-size: 1rem;
          transition: all 0.3s ease; box-sizing: border-box; outline: none;
        }
        /* สไตล์สำหรับ Dropdown ธนาคารแบบใหม่ */
        .custom-select-trigger {
          width: 100%; height: 50px;
          background: rgba(30, 30, 50, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; padding: 0 16px;
          display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; color: #fff; transition: all 0.3s ease;
          box-sizing: border-box;
        }
        .custom-select-trigger:hover {
          border-color: #a855f7;
          background: rgba(40, 40, 60, 1);
        }
        .custom-select-options {
          position: absolute; top: calc(100% + 8px); left: 0; width: 100%;
          background: rgba(26, 26, 46, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; padding: 8px;
          max-height: 260px; overflow-y: auto;
          z-index: 20;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.7);
        }
        .custom-select-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 8px; cursor: pointer;
          color: #fff; transition: background 0.2s;
        }
        .custom-select-item:hover {
          background: rgba(168, 85, 247, 0.2);
        }
        /* Custom Scrollbar ให้ Dropdown ดูกลืนไปกับ UI */
        .custom-select-options::-webkit-scrollbar { width: 6px; }
        .custom-select-options::-webkit-scrollbar-track { background: transparent; }
        .custom-select-options::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
        .custom-select-options::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .input-group input::placeholder { color: #475569; }
        .input-group input:focus, .input-group select:focus {
          border-color: #a855f7;
          background: rgba(40, 40, 60, 1);
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
        }

        /* ปุ่ม Submit (แสงวิ่ง) */
        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          margin-top: 0.5rem;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }
        .submit-btn:hover::before { left: 100%; }
        .submit-btn:hover {
          box-shadow: 0 6px 25px rgba(124, 58, 237, 0.6);
          transform: translateY(-2px);
        }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        /* ลิงก์ด้านล่าง */
        .login-link {
          color: #a855f7; text-decoration: none; font-weight: 600; transition: all 0.2s;
        }
        .login-link:hover { color: #c084fc; text-shadow: 0 0 8px rgba(168, 85, 247, 0.5); }

        /* Loading Spinner */
        .spinner {
          width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Animation ลูกเต๋า */
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