export const RECEIPT_THEMES = {
  gold: {
    header: "#897047",
    label: "น้ำตาลทอง",
    logo: "/logos/BAY.webp",
    code: "BAY",
    name: "กรุงศรี",
  },
  blue: {
    header: "#20529B",
    label: "น้ำเงิน",
    logo: "/logos/BBL.webp",
    code: "BBL",
    name: "กรุงเทพ",
  },
  purple: {
    header: "#7039A4",
    label: "ม่วง",
    logo: "/logos/SCB.webp",
    code: "SCB",
    name: "ไทยพานิชย์",
  },
  green: {
    header: "#16835A",
    label: "เขียว",
    logo: "/logos/KBANK.webp",
    code: "KBANK",
    name: "กสิกรไทย",
  },
} as const;

type ReceiptTheme = keyof typeof RECEIPT_THEMES;

const THEME_KEYS: ReceiptTheme[] = [
  "gold",
  "blue",
  "purple",
  "green",
];

export function getReceiptTheme(id: string) {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }

  const index = (hash >>> 0) % THEME_KEYS.length;

  return RECEIPT_THEMES[THEME_KEYS[index]];
}