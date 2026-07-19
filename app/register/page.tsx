"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", phone: "", password: "", password_confirmation: "", bank_code: "SCB", bank_account: "", bank_name: "", referral_code: "" });
  const [loading, setLoading] = useState(false);

  const banks = [
    { code: "SCB", name: "ไทยพาณิชย์" }, { code: "KBANK", name: "กสิกรไทย" }, { code: "BBL", name: "กรุงเทพ" },
    { code: "KTB", name: "กรุงไทย" }, { code: "TMB", name: "ทหารไทยธนชาต" }, { code: "BAY", name: "กรุงศรี" },
    { code: "GSB", name: "ออมสิน" }, { code: "TBANK", name: "ธนชาต" }, { code: "CIMB", name: "ซีไอเอ็มบี" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      Swal.fire({ icon: "error", title: "สมัครไม่สำเร็จ", text: err.response?.data?.message || "เกิดข้อผิดพลาด", background: "#1a1a2e", color: "#e2e8f0", confirmButtonColor: "#7c3aed" });
    } finally { setLoading(false); }
  };

  const set = (key: string, val: string) => setForm({ ...form, [key]: val });

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", alignItems: "center", justifyContent: "center", 
      padding: "2rem 1rem", 
      background: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)",
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

            {/* แถวที่ 3: ธนาคาร */}
            <div className="input-group">
              <label>ธนาคาร</label>
              <div style={{ position: "relative" }}>
                <select value={form.bank_code} onChange={(e) => set("bank_code", e.target.value)} required>
                  {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
                {/* Custom Dropdown Arrow */}
                <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#64748b" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {/* แถวที่ 4: เลขบัญชี & ชื่อบัญชี */}
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
          background: rgba(26, 26, 46, 0.5);
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
          background: rgba(15, 15, 26, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; padding: 0 16px; color: #fff; font-size: 1rem;
          transition: all 0.3s ease; box-sizing: border-box; outline: none;
        }
        .input-group select {
          appearance: none; /* ซ่อนลูกศรเดิมของเบราว์เซอร์ */
          cursor: pointer;
        }
        .input-group select option {
          background: #1a1a2e; /* สีพื้นหลังตอนกดเลือก dropdown */
          color: white;
        }
        .input-group input::placeholder { color: #475569; }
        .input-group input:focus, .input-group select:focus {
          border-color: #a855f7;
          background: rgba(15, 15, 26, 0.9);
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