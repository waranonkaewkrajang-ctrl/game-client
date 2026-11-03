// Shapes returned by the existing backend endpoints (unchanged contracts).

/** GET /auth/me → res.data.data */
export interface User {
  full_name?: string | null;
  username: string;
  phone?: string | null;
  bank_code?: string | null;
  bank_account?: string | null;
  bank_name?: string | null;
  status?: string | null;
  referral_code?: string | null;
  last_login_at?: string | null;
}

/** GET /wallet/balance → res.data.data */
export interface Wallet {
  balance?: number | string | null;
  point_balance?: number | string | null;
}

/** GET /rewards/summary → res.data.data */
export interface Rewards {
  cashback?: { pending?: number | null } | null;
  referral?: { pending?: number | null } | null;
}

export interface RankInfo {
  name?: string | null;
  color?: string | null;
  image_url?: string | null;
  min_deposit?: number | null;
}

/** GET /user/rank → res.data.data */
export interface Rank {
  current_rank?: RankInfo | null;
  next_rank?: RankInfo | null;
  progress?: number | null;
  total_deposit?: number | null;
}

/** POST /bank-change body */
export interface BankChangeForm {
  new_bank_code: string;
  new_bank_account: string;
  new_bank_name: string;
}

export const BANK_LIST: { code: string; name: string }[] = [
  { code: "KBANK", name: "กสิกรไทย" }, { code: "SCB", name: "ไทยพาณิชย์" },
  { code: "KTB", name: "กรุงไทย" }, { code: "BBL", name: "กรุงเทพ" },
  { code: "BAY", name: "กรุงศรี" }, { code: "GSB", name: "ออมสิน" },
  { code: "TTB", name: "ทีทีบี" }, { code: "KKP", name: "เกียรตินาคิน" },
  { code: "CIMBT", name: "ซีไอเอ็มบี" }, { code: "TISCO", name: "ทิสโก้" },
  { code: "UOBT", name: "ยูโอบี" }, { code: "BAAC", name: "ธ.ก.ส." },
  { code: "TRUEWALLET", name: "ทรูมันนี่ วอลเล็ท" },
];

export const GOLD = "#eab308";
