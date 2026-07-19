"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      if (res.data.status === "two_factor_required") {
        setTwoFactorToken(res.data.two_factor_token);
        setStep("2fa");
      } else {
        localStorage.setItem("user_token", res.data.data.token);
        localStorage.setItem("user_data", JSON.stringify(res.data.data.user));
        router.push("/lobby");
      }
    } catch (err: any) {
      Swal.fire({ 
        icon: "error", 
        title: "เข้าสู่ระบบไม่สำเร็จ", 
        text: err.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 
        background: "#1a1a2e", 
        color: "#e2e8f0",
        confirmButtonColor: "#7c3aed"
      });
    } finally { setLoading(false); }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-2fa", { two_factor_token: twoFactorToken, otp });
      localStorage.setItem("user_token", res.data.data.token);
      localStorage.setItem("user_data", JSON.stringify(res.data.data.user));
      router.push("/lobby");
    } catch (err: any) {
      Swal.fire({ 
        icon: "error", 
        title: "รหัส OTP ไม่ถูกต้อง", 
        background: "#1a1a2e", 
        color: "#e2e8f0",
        confirmButtonColor: "#7c3aed"
      });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem", 
      background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", 
      position: "relative", overflow: "hidden", fontFamily: "sans-serif" 
    }}>
      
      {/* พื้นหลังลูกเต๋าเคลื่อนไหว */}
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

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
        
        {/* Header / Logo */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          {/* ใช้ Logo แบบรูปภาพ */}
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              width: "220px", 
              height: "auto", 
              margin: "0 auto", 
              display: "block", 
              filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.5))" 
            }} 
            onError={(e) => { e.currentTarget.style.display = 'none'; document.getElementById('fallback-logo')!.style.display = 'flex'; }}
          />
          {/* Fallback ตัวอักษร G (ถ้าโหลดรูปไม่ขึ้น) */}
          <div id="fallback-logo" style={{ display: "none", width: "80px", height: "80px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", borderRadius: "20px", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", fontSize: "2.5rem", fontWeight: 800, color: "white", boxShadow: "0 8px 30px rgba(124,58,237,0.4)" }}>G</div>
        </div>

        {/* Form Container (Glassmorphism Effect) */}
        <div className="glass-card">
          {step === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              <h2 style={{ textAlign: "center", color: "#fff", margin: "0 0 0.5rem 0", fontSize: "1.5rem", fontWeight: "700" }}>
                เข้าสู่ระบบ
              </h2>
              
              {/* ช่องที่ 1: ชื่อผู้ใช้งาน */}
              <div className="input-group">
                <label>ชื่อผู้ใช้งาน</label>
                <input 
                  type="text" 
                  placeholder="กรอกชื่อผู้ใช้งาน..." 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>

              {/* ช่องที่ 2: รหัสผ่าน */}
              <div className="input-group">
                <label>รหัสผ่าน</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ paddingRight: "44px" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#64748b",
                  }}>
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.8rem", color: "#94a3b8" }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#7c3aed", cursor: "pointer" }} />
                  จำฉันไว้ในระบบ
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); Swal.fire({ title: "ลืมรหัสผ่าน?", text: "กรุณาติดต่อแอดมินเพื่อรีเซ็ตรหัสผ่าน", icon: "info", background: "#1a1a2e", color: "#e2e8f0", confirmButtonColor: "#7c3aed" }); }} style={{ color: "#a855f7", textDecoration: "none", fontSize: "0.8rem", fontWeight: 500 }}>
                  ลืมรหัสผ่าน?
                </a>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <span className="spinner"></span> : "เข้าสู่ระบบ"}
              </button>

              <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>ยังไม่มีบัญชีใช่หรือไม่? </span>
                <a href="/register" className="register-link">สมัครสมาชิก</a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "center" }}>
              <div>
                <h3 style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px 0" }}>ยืนยันตัวตน 2FA</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>กรอกรหัส 6 หลักจากแอป<br/>Google Authenticator ของคุณ</p>
              </div>

              <input 
                className="otp-input"
                placeholder="000000" 
                maxLength={6} 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
                required 
                autoFocus
              />

              <button type="submit" className="submit-btn" disabled={loading || otp.length !== 6}>
                {loading ? <span className="spinner"></span> : "ยืนยันรหัส OTP"}
              </button>

              <button type="button" onClick={() => setStep("login")} className="back-btn">
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </form>
          )}

          {/* 🟢 1. วางแทรกโค้ดชุดนี้ลงไปตรงนี้เลยครับ 🟢 */}
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1rem", fontWeight: 500 }}>
              ติดต่อสอบถามปัญหาหรือข้อสงสัยได้ที่
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              
              {/* ปุ่ม Line */}
              <a href="https://lin.ee/UbpbDVFT" className="btn-line" target="_blank" rel="noopener noreferrer">
                <svg className="me-1" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.4811 0.000347137H4.55729C2.05693 -0.00299835 0.00356961 2.01479 3.662e-06 4.50732V20.3764C-0.00314276 22.8691 2.02169 24.9156 4.52236 24.9189H20.4464C22.9472 24.9221 24.9997 22.9044 25.0035 20.4114V4.54192C25.0071 2.04929 22.9824 0.00369453 20.4811 0.000244141" fill="#00B900"></path>
                  <path d="M21.5645 11.3638C21.5645 7.30419 17.4809 4.00141 12.4609 4.00141C7.44169 4.00141 3.35742 7.30419 3.35742 11.3637C3.35742 15.0032 6.59614 18.051 10.9709 18.6274C11.2674 18.6911 11.6709 18.8223 11.773 19.0748C11.8647 19.3041 11.8331 19.6635 11.8023 19.8951C11.8023 19.8951 11.6955 20.5353 11.6725 20.6717C11.6328 20.9011 11.4896 21.5688 12.4609 21.1607C13.4326 20.7527 17.7038 18.0842 19.6136 15.8935H19.6133C20.9326 14.4517 21.5645 12.9885 21.5645 11.3637" fill="#FFF"></path>
                  <path d="M10.6131 9.40203H9.97458C9.92759 9.40203 9.88252 9.4206 9.84925 9.45368C9.81598 9.48675 9.79723 9.53163 9.79712 9.57846V13.5316C9.79715 13.5548 9.80176 13.5777 9.8107 13.5992C9.81963 13.6206 9.83271 13.64 9.84919 13.6564C9.86567 13.6728 9.88522 13.6858 9.90674 13.6946C9.92825 13.7035 9.9513 13.708 9.97458 13.708H10.6131C10.7111 13.708 10.7903 13.629 10.7903 13.5316V9.57846C10.7903 9.53167 10.7716 9.48682 10.7383 9.45376C10.7051 9.4207 10.66 9.40213 10.6131 9.40213M15.0083 9.40203H14.3697C14.3227 9.40203 14.2777 9.42061 14.2445 9.45369C14.2112 9.48677 14.1925 9.53165 14.1925 9.57846V11.9271L12.3747 9.48052C12.3704 9.47431 12.3659 9.46834 12.3609 9.46265L12.3597 9.4616C12.3563 9.45778 12.3527 9.45412 12.349 9.45063L12.3457 9.4477C12.3427 9.4449 12.3396 9.44229 12.3363 9.43987C12.3349 9.4384 12.3334 9.43736 12.3318 9.43621C12.3286 9.43412 12.3256 9.43182 12.3224 9.42994C12.3208 9.42873 12.319 9.42768 12.3171 9.4268C12.3139 9.42492 12.3108 9.42293 12.3077 9.42137C12.3058 9.42053 12.304 9.41948 12.3021 9.41875C12.2988 9.41715 12.2954 9.41571 12.2919 9.41447L12.2862 9.41238C12.2827 9.41109 12.2791 9.40997 12.2756 9.40903L12.2695 9.40736L12.2593 9.40506C12.2568 9.4047 12.2543 9.40442 12.2519 9.40422C12.2487 9.40349 12.2456 9.40328 12.2424 9.40297C12.2394 9.40266 12.2364 9.40266 12.2333 9.40245C12.2311 9.40245 12.2293 9.40213 12.227 9.40213H11.5887C11.5417 9.4021 11.4966 9.42065 11.4633 9.45371C11.43 9.48677 11.4113 9.53163 11.4111 9.57846V13.5316C11.4112 13.5548 11.4158 13.5778 11.4247 13.5992C11.4337 13.6206 11.4467 13.6401 11.4632 13.6565C11.4797 13.6728 11.4993 13.6858 11.5208 13.6947C11.5423 13.7035 11.5654 13.708 11.5887 13.708H12.227C12.2503 13.708 12.2734 13.7035 12.2949 13.6947C12.3164 13.6858 12.336 13.6728 12.3525 13.6565C12.369 13.6401 12.382 13.6206 12.391 13.5992C12.3999 13.5778 12.4045 13.5548 12.4046 13.5316V11.1837L14.2246 13.6334C14.2372 13.6511 14.2531 13.6664 14.2713 13.6783C14.275 13.6806 14.2787 13.6829 14.2824 13.685C14.284 13.6861 14.2856 13.6868 14.2874 13.6876C14.2901 13.6892 14.2929 13.6906 14.2958 13.6918L14.3045 13.6955C14.3063 13.6961 14.3079 13.6968 14.3097 13.6973C14.3139 13.6989 14.3177 13.7002 14.3218 13.7013C14.3226 13.7013 14.3235 13.7017 14.3244 13.7018C14.3389 13.7057 14.354 13.708 14.3697 13.708H15.0083C15.1064 13.708 15.1856 13.629 15.1856 13.5316V9.57846C15.1855 9.53167 15.1668 9.48682 15.1336 9.45376C15.1003 9.4207 15.0553 9.40213 15.0083 9.40213M9.07386 12.7181H7.33882V9.57867C7.33882 9.53184 7.32016 9.48693 7.28694 9.4538C7.25372 9.42068 7.20867 9.40206 7.16168 9.40203H6.52295C6.47594 9.40203 6.43086 9.42064 6.39762 9.45376C6.36438 9.48689 6.3457 9.53182 6.3457 9.57867V13.5315C6.34569 13.5546 6.35028 13.5776 6.3592 13.599C6.36813 13.6204 6.38122 13.6398 6.39772 13.6562L6.40035 13.6587C6.43319 13.6904 6.47713 13.7081 6.52285 13.708H9.07386C9.12085 13.7079 9.16589 13.6892 9.19907 13.6561C9.23225 13.6229 9.25085 13.578 9.2508 13.5312V12.8948C9.2508 12.7972 9.17182 12.7182 9.07386 12.7182M18.5346 10.3918C18.6325 10.3918 18.7116 10.3129 18.7116 10.2152V9.57888C18.7116 9.53205 18.693 9.48711 18.6598 9.45395C18.6267 9.42079 18.5816 9.40211 18.5346 9.40203H15.9834C15.9356 9.40203 15.8925 9.42116 15.8605 9.45188C15.8598 9.45262 15.8589 9.45314 15.8584 9.45387C15.8573 9.45492 15.8565 9.45596 15.8557 9.45701C15.8241 9.48969 15.8064 9.53329 15.8064 9.57867V13.5315C15.8064 13.5553 15.8112 13.5788 15.8206 13.6007C15.83 13.6225 15.8437 13.6423 15.861 13.6587C15.8939 13.6903 15.9377 13.708 15.9834 13.708H18.5346C18.5816 13.7079 18.6266 13.6893 18.6598 13.6562C18.6929 13.623 18.7116 13.5782 18.7116 13.5314V12.8948C18.7116 12.848 18.6929 12.8032 18.6598 12.77C18.6266 12.7369 18.5816 12.7183 18.5346 12.7182H16.7997V12.0499H18.5346C18.6325 12.0499 18.7116 11.9708 18.7116 11.8732V11.2368C18.7116 11.19 18.693 11.145 18.6598 11.1119C18.6267 11.0787 18.5816 11.06 18.5346 11.06H16.7997V10.392L18.5346 10.3918Z" fill="#00B900"></path>
                </svg>
                Line
              </a>

              {/* ปุ่ม Telegram */}
              <a href="https://lin.ee/pE8Lf6j" className="btn-telegram" target="_blank" rel="noopener noreferrer">
                <img width="24" height="24" src="https://fs.cdnrc.com/lsm-layout3/images/telegram-logo.png" alt="telegram logo" />
                Telegram
              </a>
              
            </div>
          </div>

        </div>
      </div>

      {/* --- CSS สำหรับ กราฟิกขยับได้ (Animations) และความสวยงาม --- */}
      <style dangerouslySetInnerHTML={{__html: `
        /* 1. กราฟิกภาพขยับด้านหลัง (Animated Background) */
        .animated-bg {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 1;
        }
        .orb {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
          animation: float 10s infinite ease-in-out alternate;
        }
        /* ลูกไฟสีม่วงเข้ม */
        .orb-1 {
          width: 300px; height: 300px; background: #7c3aed;
          top: -50px; left: -100px; animation-duration: 12s;
        }
        /* ลูกไฟสีม่วงชมพู */
        .orb-2 {
          width: 250px; height: 250px; background: #a855f7;
          bottom: -50px; right: -50px; animation-duration: 15s; animation-delay: -5s;
        }
        /* ลูกไฟสีกรมท่าสว่าง */
        .orb-3 {
          width: 200px; height: 200px; background: #3b82f6;
          bottom: 20%; left: 20%; animation-duration: 18s; animation-delay: -2s; opacity: 0.3;
        }
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -40px) scale(1.1); }
        }

        /* 2. ดีไซน์กล่องแก้ว (Glassmorphism Card) */
        .glass-card {
          background: rgba(26, 26, 46, 0.15); /* ปรับความทึบลงเหลือ 0.15 */
          backdrop-filter: blur(6px); /* ลดเบลอลงให้มองทะลุเห็นลูกเต๋า */
          -webkit-backdrop-filter: blur(6px);
          border-radius: 24px;
          padding: 2.5rem 2.25rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* 3. ช่องกรอกข้อมูล */
        .input-group label {
          display: block; font-size: 0.85rem; font-weight: 500; color: #cbd5e1; margin-bottom: 0.5rem;
        }
        .input-group input {
          width: 100%; height: 50px;
          background: rgba(15, 15, 26, 0.7); /* สี #0f0f1a โปร่งแสง */
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; padding: 0 16px; color: #fff; font-size: 1rem;
          transition: all 0.3s ease; box-sizing: border-box; outline: none;
        }
        .input-group input::placeholder { color: #475569; }
        .input-group input:focus {
          border-color: #a855f7;
          background: rgba(15, 15, 26, 0.9);
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
        }

        /* ช่องกรอก OTP (2FA) */
        .otp-input {
          width: 100%; height: 64px; background: rgba(15, 15, 26, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px;
          color: #fff; font-size: 2.25rem; font-weight: 700; letter-spacing: 0.4em;
          text-align: center; outline: none; transition: all 0.3s ease; box-sizing: border-box;
        }
        .otp-input:focus { border-color: #a855f7; box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2); }

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
          top: 0; 
          left: -100%;
          width: 100%; 
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s ease;
        }

        .submit-btn:hover::before { 
          left: 100%; 
        }

        .submit-btn:hover {
          box-shadow: 0 6px 25px rgba(124, 58, 237, 0.6);
          transform: translateY(-2px);
        }

        .submit-btn:active { 
          transform: translateY(0); 
        }

        .submit-btn:disabled { 
          opacity: 0.7; 
          cursor: not-allowed; 
          transform: none; 
        }

        /* ลิงก์ และ ปุ่มกลับ */
        .register-link {
          color: #a855f7; text-decoration: none; font-weight: 600; transition: all 0.2s;
        }
        .register-link:hover { color: #c084fc; text-shadow: 0 0 8px rgba(168, 85, 247, 0.5); }
        .back-btn {
          background: none; border: none; color: #a1a1aa; font-size: 0.85rem;
          cursor: pointer; transition: color 0.2s; padding: 8px; font-weight: 500;
        }
        .back-btn:hover { color: #fff; }

        /* 5. Loading Spinner */
        .spinner {
          width: 22px; height: 22px; border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.05; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.06; }
          85% { opacity: 0.03; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }
      
        /* สไตล์ปุ่มติดต่อแบบสีเต็ม (Solid Colors) */
        .btn-line, .btn-telegram {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 10px; /* ปรับให้โค้งพอดีๆ แบบในภาพ */
          text-decoration: none;
          font-weight: 700; /* ปรับตัวหนังสือหนาขึ้น */
          font-size: 0.95rem;
          transition: all 0.3s ease;
          flex: 1;
          color: #ffffff; /* ตัวอักษรสีขาว */
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); /* เงาบางๆ ให้ปุ่มดูลอยขึ้นมา */
        }
        
        .btn-line {
          background: #00c300; /* สีเขียว Line */
        }
        .btn-line:hover { 
          background: #00a000; 
          transform: translateY(-2px); 
          box-shadow: 0 6px 12px rgba(0, 195, 0, 0.3);
        }

        .btn-telegram {
          background: #2aa2e6; /* สีฟ้า Telegram */
        }
        .btn-telegram:hover { 
          background: #1c8ac7; 
          transform: translateY(-2px); 
          box-shadow: 0 6px 12px rgba(42, 162, 230, 0.3);
        }

        /* 🔴 โค้ดที่เพิ่มเข้ามา เพื่อให้ลูกเต๋าสว่างขึ้น 🔴 */
        div[style*="floatDice"] {
          opacity: 0.15 !important; /* ปรับระดับความชัดลูกเต๋า */
          filter: grayscale(1) brightness(1.2) !important; 
        }

      `}} /> {/* 📌 จุดจบแท็กสไตล์ท้ายไฟล์ของคุณ */}
    </div>
  );
}