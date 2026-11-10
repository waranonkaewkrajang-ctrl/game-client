// Shared display helpers for the recent-withdrawals row AND its sample receipt, so both always print the
// exact same text from the same WithdrawalItem (one formatter, no second amount source).
import type { WithdrawalItem } from "./recentWithdrawals.demo";
import { getReceiptTheme } from "./receiptTheme";

const amountFmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** "฿ 25,400.00" */
export const formatWithdrawalAmount = (amount: number) => `฿ ${amountFmt.format(amount)}`;

export const STATUS_LABEL: Record<WithdrawalItem["status"], string> = {
  success: "สำเร็จ",
  pending: "กำลังดำเนินการ",
};

// ---- sample reference: "DEMO-YYYYMMDD-XXXX" ----
// Display-only label for simulated rows: never sent to an API, never stored. The 4-char suffix is a hash of
// the entry's stable id; the date is fixed on first use and cached per id, so the same entry keeps the same
// reference for the whole page session (re-renders and reopening the receipt never change it).
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
const refCache = new Map<string, string>();

function hashSuffix(id: string): string {
  let h = 0x811c9dc5; // FNV-1a 32-bit
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += REF_ALPHABET[h % REF_ALPHABET.length];
    h = Math.floor(h / REF_ALPHABET.length);
  }
  return out;
}

/** Generate a theme-matched demo reference. */
export function demoReference(id: string): string {
  const cached = refCache.get(id);
  if (cached) return cached;

  const theme = getReceiptTheme(id);

  const d = new Date();

  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  const ref = `${theme.code}-${ymd}-${hashSuffix(id)}`;

  refCache.set(id, ref);
  return ref;
}
