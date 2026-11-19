// ลิงก์ชวนเพื่อน: /register?ref=CODE → เติมรหัสแนะนำให้อัตโนมัติ
// จำไว้ในเครื่อง 30 วัน เผื่อเพื่อนกดลิงก์แล้วออกไปดูหน้าอื่นก่อนค่อยกลับมาสมัคร
const KEY = "sn_ref";
const KEEP_MS = 30 * 86_400_000;
const VALID = /^[A-Za-z0-9]{4,20}$/;

export function captureReferralCode(): string {
  if (typeof window === "undefined") return "";
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref")?.trim() ?? "";
    if (VALID.test(fromUrl)) {
      const code = fromUrl.toUpperCase();
      localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
      return code;
    }
    const saved = JSON.parse(localStorage.getItem(KEY) || "null") as { code?: string; at?: number } | null;
    if (saved?.code && VALID.test(saved.code) && typeof saved.at === "number" && Date.now() - saved.at < KEEP_MS) return saved.code;
    if (saved) localStorage.removeItem(KEY);
  } catch {
    /* storage blocked — the code can still be typed by hand */
  }
  return "";
}

export function clearReferralCode(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
