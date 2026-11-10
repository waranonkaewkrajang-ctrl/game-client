"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import { registrationPayload, validateRegistration } from "@/lib/registration";
import type { RegistrationErrors, RegistrationForm } from "@/lib/registration";
import styles from "./register.module.css";
import BankSelect from "./BankSelect";
import PasswordStrength from "./PasswordStrength";

type ApiError = { message?: string; errors?: Record<string, string[] | string> };

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegistrationForm>({ phone: "", password: "", password_confirmation: "", bank_code: "", bank_account: "", bank_name: "", referral_code: "" });
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      formRef.current?.querySelector<HTMLElement>(step === 1 ? '[name="phone"]' : '[name="bank_code"]')?.focus();
    }
  }, [step]);

  const set = (key: keyof RegistrationForm, value: string) => {
    setForm(previous => ({ ...previous, [key]: value, ...(key === "bank_code" && previous.bank_code !== value ? { bank_account: "" } : {}) }));
    setErrors(previous => ({ ...previous, [key]: undefined, ...(key === "bank_code" ? { bank_account: undefined } : {}) }));
    setNotice("");
  };

  const showErrors = (nextErrors: RegistrationErrors) => {
    setErrors(nextErrors);
    if (nextErrors.referral_code) setReferralOpen(true);
    const first = Object.keys(nextErrors)[0];
    const firstStep = ["phone", "password", "password_confirmation"].includes(first);
    if (firstStep) setStep(1);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current || registered) return;
    const nextErrors = validateRegistration(form, step);
    if (Object.keys(nextErrors).length) { showErrors(nextErrors); return; }
    if (step === 1) { setStep(2); setNotice(""); return; }
    submitting.current = true;
    setLoading(true);
    setNotice("");
    try {
      const response = await api.post("/auth/register", registrationPayload(form));
      // A successful registration must never be resubmitted if session persistence fails.
      setRegistered(true);
      const data = response.data?.data;
      if (!data?.token || !data?.user) {
        setNotice("สมัครสำเร็จแล้ว กรุณาไปหน้าเข้าสู่ระบบด้วยเบอร์โทรและรหัสผ่านที่ตั้งไว้");
        return;
      }
      try {
        localStorage.setItem("user_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
      } catch {
        try { localStorage.removeItem("user_token"); } catch {}
        setNotice("สมัครสำเร็จแล้ว แต่เบราว์เซอร์บันทึกการเข้าสู่ระบบไม่ได้ กรุณาไปหน้าเข้าสู่ระบบ");
        return;
      }
      router.push("/lobby");
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiError>(error)) {
        const fieldErrors: RegistrationErrors = {};
        for (const [key, value] of Object.entries(error.response?.data?.errors ?? {})) {
          const field = key === "username" ? "phone" : key;
          if (Object.prototype.hasOwnProperty.call(form, field)) {
            fieldErrors[field as keyof RegistrationForm] = key === "username" ? "เบอร์นี้ไม่สามารถใช้สมัครได้ กรุณาเข้าสู่ระบบหรือติดต่อเจ้าหน้าที่" : String(Array.isArray(value) ? value[0] : value);
          }
        }
        if (Object.keys(fieldErrors).length) showErrors(fieldErrors);
        setNotice(error.response?.status === 429 ? "ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง" : error.response ? "สมัครยังไม่สำเร็จ กรุณาตรวจข้อมูลด้านล่าง หากยังติดปัญหาให้ติดต่อเจ้าหน้าที่" : "ยังไม่ได้รับคำตอบจากระบบ กรุณาตรวจการเชื่อมต่อ หากส่งข้อมูลไปแล้วให้ลองเข้าสู่ระบบก่อนสมัครซ้ำ");
      } else setNotice("ไม่สามารถดำเนินการได้ กรุณาลองเข้าสู่ระบบหรือติดต่อเจ้าหน้าที่");
    } finally { submitting.current = false; setLoading(false); }
  };

  const confirmationMismatch = Boolean(form.password_confirmation) && form.password !== form.password_confirmation;
  const fieldProps = (key: keyof RegistrationForm) => ({
    id: `register-${key}`,
    name: key,
    "aria-invalid": Boolean(errors[key]) || (key === "password_confirmation" && confirmationMismatch),
    "aria-describedby": [key === "password" ? "password-strength" : "", key === "password_confirmation" && form.password_confirmation ? "password-match" : "", errors[key] ? `error-${key}` : ""].filter(Boolean).join(" ") || undefined,
  });
  const fieldError = (key: keyof RegistrationForm) => errors[key] ? <p id={`error-${key}`} className={styles.error}>{errors[key]}</p> : null;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.brand} aria-label="SNAKE168">
          <Link href="/login" aria-label="กลับหน้าเข้าสู่ระบบ"><Image src="/logo.png" alt="SNAKE168" width={582} height={428} sizes="(min-width: 900px) 320px, 130px" className={styles.logo} preload /></Link>
          <div className={styles.brandCopy}><h2>เริ่มต้นได้ง่าย<br />ในสองขั้นตอน</h2><p>ใช้เบอร์โทรเป็นชื่อเข้าใช้งาน<br />พร้อมข้อมูลบัญชีสำหรับรับเงินของคุณ</p><ol><li>เบอร์โทรและรหัสผ่าน</li><li>ธนาคารที่ใช้สมัคร</li></ol></div>
        </aside>
        <section className={styles.card} aria-labelledby="register-title">
          <header className={styles.header}><Link href="/login" className={styles.back}>← เข้าสู่ระบบ</Link><h1 id="register-title">สมัครสมาชิก</h1><p>ไม่ต้องตั้งชื่อผู้ใช้ ใช้เบอร์โทรของคุณได้เลย</p></header>
          <ol className={styles.steps} aria-label="ขั้นตอนการสมัคร"><li aria-current={step === 1 ? "step" : undefined} data-done={step === 2}><span>1</span>บัญชีเข้าใช้งาน</li><li aria-current={step === 2 ? "step" : undefined}><span>2</span>ข้อมูลรับเงิน</li></ol>
          {notice && <p className={registered ? styles.success : styles.notice} role="status">{notice}</p>}
          {registered ? <Link href="/login" className={styles.submit}>ไปหน้าเข้าสู่ระบบ</Link> : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={loading} className={styles.form}>
            {step === 1 ? <fieldset className={styles.fields} disabled={loading}><legend className={styles.srOnly}>บัญชีเข้าใช้งาน</legend>
              <div className={styles.field}><label htmlFor="register-phone">เบอร์โทรศัพท์</label><input {...fieldProps("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="0812345678" maxLength={20} value={form.phone} onChange={e => set("phone", e.target.value.replace(/[^\d+\s()-]/g, ""))} required /><p className={styles.hint}>เบอร์มือถือไทย 10 หลัก ใช้เข้าสู่ระบบครั้งถัดไป</p>{fieldError("phone")}</div>
              <div className={styles.field}><label htmlFor="register-password">ตั้งรหัสผ่าน</label><div className={styles.password}><input {...fieldProps("password")} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="อย่างน้อย 6 ตัวอักษร" value={form.password} onChange={e => set("password", e.target.value)} minLength={6} required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-pressed={showPassword} aria-label={showPassword ? "ซ่อนรหัสผ่านทั้งสองช่อง" : "แสดงรหัสผ่านทั้งสองช่อง"}>{showPassword ? "ซ่อน" : "แสดง"}</button></div><PasswordStrength password={form.password} phone={form.phone} />{fieldError("password")}</div>
              <div className={styles.field}><label htmlFor="register-password_confirmation">ยืนยันรหัสผ่าน</label><input {...fieldProps("password_confirmation")} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="กรอกรหัสผ่านเดิมอีกครั้ง" value={form.password_confirmation} onChange={e => set("password_confirmation", e.target.value)} required />{form.password_confirmation && <p id="password-match" className={confirmationMismatch ? styles.matchError : styles.matchSuccess} role="status">{confirmationMismatch ? "✕ รหัสผ่านยังไม่ตรงกัน กรุณาตรวจอีกครั้ง" : "✓ รหัสผ่านตรงกันแล้ว"}</p>}{fieldError("password_confirmation")}</div>
            </fieldset> : <fieldset className={styles.fields} disabled={loading}><legend className={styles.srOnly}>ข้อมูลรับเงิน</legend>
              <div className={styles.summary}><span>เบอร์เข้าใช้งาน <strong>{form.phone}</strong></span><button type="button" onClick={() => setStep(1)}>แก้ไข</button></div>
              <div className={styles.field}><label id="register-bank-label" htmlFor="register-bank_code">ธนาคารที่ใช้สมัคร</label><BankSelect value={form.bank_code} onChange={value => set("bank_code", value)} error={errors.bank_code} disabled={loading} />{fieldError("bank_code")}</div>
              <div className={styles.field}><label htmlFor="register-bank_account">{form.bank_code === "TRUEWALLET" ? "เบอร์ TrueWallet" : "เลขบัญชีธนาคาร"}</label><input {...fieldProps("bank_account")} type="text" inputMode="numeric" autoComplete="off" placeholder={form.bank_code === "TRUEWALLET" ? "เบอร์ที่ผูกกับ TrueWallet" : "กรอกตัวเลข ไม่ต้องใส่ขีด"} maxLength={form.bank_code === "TRUEWALLET" ? 10 : 20} value={form.bank_account} onChange={e => set("bank_account", e.target.value.replace(/\D/g, ""))} required />{fieldError("bank_account")}</div>
              <div className={styles.field}><label htmlFor="register-bank_name">ชื่อ–นามสกุลเจ้าของบัญชี</label><input {...fieldProps("bank_name")} autoComplete="name" placeholder="ชื่อจริง นามสกุล" maxLength={100} value={form.bank_name} onChange={e => set("bank_name", e.target.value)} required /><p className={styles.hint}>ต้องตรงกับชื่อในบัญชีธนาคารหรือวอลเล็ท</p>{fieldError("bank_name")}</div>
              <details className={styles.optional} open={referralOpen} onToggle={event => setReferralOpen(event.currentTarget.open)}><summary>มีรหัสแนะนำ? <span>ไม่จำเป็นต้องกรอก</span></summary><div className={styles.field}><label htmlFor="register-referral_code">รหัสแนะนำ</label><input {...fieldProps("referral_code")} autoComplete="off" placeholder="รหัสจากผู้แนะนำ" maxLength={20} value={form.referral_code} onChange={e => set("referral_code", e.target.value)} />{fieldError("referral_code")}</div></details>
            </fieldset>}
            <div className={styles.actions}>{step === 2 && <button type="button" className={styles.previous} disabled={loading} onClick={() => setStep(1)}>ย้อนกลับ</button>}<button type="submit" className={styles.submit} disabled={loading}>{loading ? "กำลังสมัครสมาชิก…" : step === 1 ? "ถัดไป → ข้อมูลรับเงิน" : "สมัครสมาชิก"}</button></div>
            <p className={styles.footer}>มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link></p>
          </form>)}
        </section>
      </div>
    </main>
  );
}
