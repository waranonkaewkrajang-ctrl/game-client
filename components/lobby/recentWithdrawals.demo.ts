// Recent-withdrawals data model + a clearly-marked DEMO dataset.
// There is no withdrawals-feed API yet, so the lobby renders this simulated list with `live={false}`
// (the header then says "ข้อมูลจำลอง" instead of claiming real-time updates).
// To connect real data later: map the API rows to `WithdrawalItem` and pass them with `live`.

import { AVATARS, avatarSrc } from "@/app/profile/avatars";

export type WithdrawalStatus = "success" | "pending";

export interface WithdrawalItem {
  id: string;
  /** image URL — the /profile chibi set (avatarSrc / getAvatarPath), never a member photo */
  avatar: string;
  /** already masked, e.g. "คุณ T**k" — the component never receives a full name */
  maskedDisplayName: string;
  /** amount in THB */
  amount: number;
  /** pre-formatted, e.g. "เมื่อ 2 นาทีที่แล้ว" */
  relativeTime: string;
  status: WithdrawalStatus;
}

// Fixed-seed PRNG (mulberry32): the same 100 rows on the server and in every browser → no hydration mismatch.
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DEMO_COUNT = 100;

function buildDemo(): WithdrawalItem[] {
  const rand = seeded(168);
  const rows: WithdrawalItem[] = [];
  let minutes = 1;
  for (let i = 0; i < DEMO_COUNT; i++) {
    // first letter cycles with step 7 (coprime with 26); the last letter adds a per-lap offset → 100 unique "X**y" pairs
    const first = UPPER[(i * 7) % 26];
    const last = LOWER[(i * 11 + Math.floor(i / 26) * 5 + 3) % 26];
    // amounts 300 – 49,950 THB, rounded to 50, skewed toward smaller withdrawals
    const amount = Math.round((300 + Math.pow(rand(), 2.2) * 49_650) / 50) * 50;
    const time = minutes < 60 ? `เมื่อ ${minutes} นาทีที่แล้ว` : `เมื่อ ${Math.floor(minutes / 60)} ชั่วโมงที่แล้ว`;
    rows.push({
      id: `demo-${i + 1}`,
      avatar: avatarSrc(AVATARS[(i * 7) % AVATARS.length]), // step 7 is coprime with 18 → neighbours never repeat, all 18 used evenly
      maskedDisplayName: `คุณ ${first}**${last}`,
      amount,
      relativeTime: time,
      status: "success",
    });
    minutes += 1 + Math.floor(rand() * 3); // each next row is 1–3 minutes older
  }
  return rows;
}

/** DEMO ONLY — 100 simulated rows for layout/rotation testing. Not real members or transactions. */
export const DEMO_WITHDRAWALS: WithdrawalItem[] = buildDemo();
