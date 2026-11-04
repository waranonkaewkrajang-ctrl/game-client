"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import Swal from "sweetalert2";
import styles from "./login.module.css";

type ApiError = { response?: { data?: { message?: string } } };

/** Real lobby room categories (see ROOM_CATEGORIES in app/lobby/page.tsx) — labels only, no claims. */
const SHOWCASE_TAGS = ["สล็อต", "คาสิโนสด", "ยิงปลา", "กีฬา"];

/** Decorative corner ornaments for the custom form frame (public/login/corner.svg). */
function FrameCorners() {
  return (
    <>
      <span className={`${styles.corner} ${styles.cornerTl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerTr}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBr}`} aria-hidden="true" />
    </>
  );
}

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
  const [logoFailed, setLogoFailed] = useState(false);

  const [contactLinks, setContactLinks] = useState({ line: "#", telegram: "#" });
  useEffect(() => {
    api.get("/contact-links").then((res) => setContactLinks(res.data)).catch(() => {});
  }, []);

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
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: (err as ApiError).response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
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
    } catch {
      Swal.fire({
        icon: "error",
        title: "รหัส OTP ไม่ถูกต้อง",
        background: "#1a1a2e",
        color: "#e2e8f0",
        confirmButtonColor: "#7c3aed"
      });
    } finally { setLoading(false); }
  };

  const showForgot = (e: React.MouseEvent) => {
    e.preventDefault();
    Swal.fire({ title: "ลืมรหัสผ่าน?", text: "กรุณาติดต่อแอดมินเพื่อรีเซ็ตรหัสผ่าน", icon: "info", background: "#1a1a2e", color: "#e2e8f0", confirmButtonColor: "#7c3aed" });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        {/* ---------- Brand showcase (layered WebP stage + logo) ---------- */}
        <section className={styles.showcase} aria-label="SNAKE168">
          <div className={styles.stage}>
            <Image
              src="/login/stage.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className={styles.stageImg}
              preload
            />
            <div className={styles.emblem}>
              {!logoFailed ? (
                <Image
                  src="/logo.png"
                  alt="SNAKE168"
                  width={582}
                  height={428}
                  sizes="(min-width: 1024px) 340px, 200px"
                  className={styles.logo}
                  preload
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <div className={styles.logoFallback} aria-label="SNAKE168">S</div>
              )}
            </div>
          </div>

          <div className={styles.showcaseCopy}>
            <p className={styles.eyebrow}>SNAKE168 MEMBER</p>
            <h2 className={styles.showcaseTitle}>ยินดีต้อนรับสู่ SNAKE168</h2>
            <p className={styles.showcaseText}>เข้าสู่ระบบเพื่อเข้าเล่นเกม ดูโปรโมชัน และจัดการกระเป๋าเงินของคุณ</p>
            <ul className={styles.tags}>
              {SHOWCASE_TAGS.map((tag) => <li key={tag} className={styles.tag}>{tag}</li>)}
            </ul>
          </div>
        </section>

        {/* ---------- Form panel ---------- */}
        <section className={styles.panel}>
          <div className={styles.card}>
            <FrameCorners />

            {step === "login" ? (
              <form key="login" onSubmit={handleLogin} className={styles.form} aria-busy={loading}>
                <header className={styles.head}>
                  <h1 className={styles.title}>เข้าสู่ระบบ</h1>
                  <span className={styles.divider} aria-hidden="true" />
                  <p className={styles.subtitle}>กรอกชื่อผู้ใช้งานและรหัสผ่านของคุณ</p>
                </header>

                <div className={styles.field}>
                  <label htmlFor="login-username" className={styles.label}>ชื่อผู้ใช้งาน</label>
                  <div className={styles.control}>
                    <span className={styles.fieldIcon} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </span>
                    <input
                      id="login-username"
                      type="text"
                      className={styles.input}
                      placeholder="กรอกชื่อผู้ใช้งาน"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="login-password" className={styles.label}>รหัสผ่าน</label>
                  <div className={styles.control}>
                    <span className={styles.fieldIcon} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className={`${styles.input} ${styles.inputWithToggle}`}
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className={styles.toggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      aria-pressed={showPassword}
                      aria-controls="login-password"
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.row}>
                  <label className={styles.check}>
                    <input type="checkbox" className={styles.checkInput} checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    <span className={styles.checkBox} aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                    </span>
                    <span>จำฉันไว้ในระบบ</span>
                  </label>
                  <a href="#" onClick={showForgot} className={styles.link}>ลืมรหัสผ่าน?</a>
                </div>

                <button type="submit" className={styles.submit} disabled={loading}>
                  <span className={styles.submitInner}>
                    {loading ? (
                      <><span className={styles.spinner} aria-hidden="true" /><span>กำลังเข้าสู่ระบบ…</span></>
                    ) : (
                      <>
                        <span>เข้าสู่ระบบ</span>
                        <svg className={styles.submitArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      </>
                    )}
                  </span>
                </button>

                <div className={styles.or} aria-hidden="true"><span>หรือ</span></div>

                <Link href="/register" className={styles.secondary}>
                  ยังไม่มีบัญชี? <strong>สมัครสมาชิก</strong>
                </Link>
              </form>
            ) : (
              <form key="2fa" onSubmit={handleVerify2FA} className={styles.form} aria-busy={loading}>
                <header className={`${styles.head} ${styles.headCenter}`}>
                  <span className={styles.shield} aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                  </span>
                  <h1 className={styles.title}>ยืนยันตัวตน 2FA</h1>
                  <span className={styles.divider} aria-hidden="true" />
                  <p className={styles.subtitle}>กรอกรหัส 6 หลักจากแอป<br />Google Authenticator ของคุณ</p>
                </header>

                <label htmlFor="login-otp" className={styles.srOnly}>รหัส OTP 6 หลัก</label>
                <input
                  id="login-otp"
                  className={styles.otp}
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  required
                  autoFocus
                />

                <button type="submit" className={styles.submit} disabled={loading || otp.length !== 6}>
                  <span className={styles.submitInner}>
                    {loading ? <><span className={styles.spinner} aria-hidden="true" /><span>กำลังตรวจสอบ…</span></> : "ยืนยันรหัส OTP"}
                  </span>
                </button>

                <button type="button" onClick={() => setStep("login")} className={styles.back}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                  กลับไปหน้าเข้าสู่ระบบ
                </button>
              </form>
            )}

            {/* Contact */}
            <div className={styles.contact}>
              <p className={styles.contactLabel}>ติดต่อสอบถามปัญหาหรือข้อสงสัยได้ที่</p>
              <div className={styles.contactRow}>
                <a href={contactLinks.line} className={`${styles.contactBtn} ${styles.line}`} target="_blank" rel="noopener noreferrer">
                  <span className={styles.contactIcon} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 .9l-.1.9c0 .3-.2 1 .9.5 1.1-.4 5.8-3.4 7.9-5.9C21.3 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8Zm-3.6 10.4H6.5c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.3h1.4c.3 0 .5.2.5.5s-.2.5-.5.5Zm1.9-.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.8Zm4.5 0c0 .2-.1.4-.3.5h-.2c-.2 0-.3-.1-.4-.2l-1.9-2.6v2.3c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.2.1-.4.3-.5h.2c.2 0 .3.1.4.2l1.9 2.6V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.8Zm3.1-2.4c.3 0 .5.2.5.5s-.2.5-.5.5h-1.4v.9h1.4c.3 0 .5.2.5.5s-.2.5-.5.5h-1.9c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5h1.9c.3 0 .5.2.5.5s-.2.5-.5.5h-1.4v.9h1.4Z" /></svg>
                  </span>
                  Line
                </a>
                <a href={contactLinks.telegram} className={`${styles.contactBtn} ${styles.telegram}`} target="_blank" rel="noopener noreferrer">
                  <span className={styles.contactIcon} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21.9 4.6 18.8 19.3c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.2.2-.5.5-1 .5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L7 13.4l-4.6-1.4c-1-.3-1-1 .2-1.5l17.9-6.9c.8-.3 1.6.2 1.4 1Z" /></svg>
                  </span>
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
