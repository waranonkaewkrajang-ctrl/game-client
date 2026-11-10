"use client";

import { useEffect, useState } from "react";
import { assessPassword, loadPasswordEstimator } from "@/lib/password-strength";
import type { PasswordAssessment } from "@/lib/password-strength";
import styles from "./register.module.css";

const LABELS = ["อ่อนมาก", "อ่อน", "ปานกลาง", "แข็งแรง", "แข็งแรงมาก"];

export default function PasswordStrength({ password, phone }: { password: string; phone: string }) {
  const [assessment, setAssessment] = useState<{ password: string; phone: string; result: PasswordAssessment | null } | null>(null);
  useEffect(() => {
    if (!password) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      loadPasswordEstimator().then(estimator => {
        if (!cancelled) setAssessment({ password, phone, result: assessPassword(estimator, password, phone) });
      }).catch(() => {
        if (!cancelled) setAssessment({ password, phone, result: null });
      });
    }, 180);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [password, phone]);

  const current = assessment?.password === password && assessment.phone === phone ? assessment : null;
  const result = password ? current?.result : null;
  const label = !password ? "ยังไม่ได้กรอก" : !current ? "กำลังประเมิน…" : !result ? "ยังประเมินไม่ได้" : LABELS[result.score];
  const level = result?.score ?? -1;
  return <div id="password-strength" className={styles.strength} data-level={level}>
    <div className={styles.strengthHeading}><span>ความแข็งแรงรหัสผ่าน</span><strong aria-live="polite" aria-atomic="true">{label}</strong></div>
    <div className={styles.strengthBars} role="meter" aria-label="ความแข็งแรงรหัสผ่านโดยประมาณ" aria-valuemin={0} aria-valuemax={5} aria-valuenow={result ? level + 1 : 0} aria-valuetext={label}>
      {[0, 1, 2, 3, 4].map(index => <span key={index} data-filled={Boolean(result) && index <= level} />)}
    </div>
    <p className={styles.strengthAdvice}>{result?.advice ?? (current && password ? "โหลดตัวประเมินไม่สำเร็จ คุณยังสมัครได้ตามเงื่อนไขขั้นต่ำ" : "แนะนำอย่างน้อย 12 ตัวอักษร หลีกเลี่ยงเบอร์โทรและคำที่เดาง่าย")}</p>
  </div>;
}
