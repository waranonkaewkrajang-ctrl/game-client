export const BANKS = [
  { code: "SCB", name: "ไทยพาณิชย์", logo: "SCB" },
  { code: "KBANK", name: "กสิกรไทย", logo: "KBANK" },
  { code: "BBL", name: "กรุงเทพ", logo: "BBL" },
  { code: "KTB", name: "กรุงไทย", logo: "KTB" },
  { code: "TTB", name: "ทีทีบี", logo: "TTB" },
  { code: "BAY", name: "กรุงศรี", logo: "BAY" },
  { code: "GSB", name: "ออมสิน", logo: "GSB" },
  { code: "LH", name: "แลนด์ แอนด์ เฮ้าส์", logo: "LHFG" },
  { code: "CIMB", name: "ซีไอเอ็มบี ไทย", logo: "CIMBT" },
  { code: "UOB", name: "ยูโอบี", logo: "UOBT" },
  { code: "TISCO", name: "ทิสโก้", logo: "TISCO" },
  { code: "KK", name: "เกียรตินาคินภัทร", logo: "KKP" },
  { code: "TRUEWALLET", name: "TrueWallet", logo: "TRUEWALLET" },
] as const;

export type RegistrationForm = {
  phone: string;
  password: string;
  password_confirmation: string;
  bank_code: string;
  bank_account: string;
  bank_name: string;
  referral_code: string;
};
export type RegistrationErrors = Partial<Record<keyof RegistrationForm, string>>;

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("66") && digits.length === 11 ? `0${digits.slice(2)}` : digits;
}

export function validateRegistration(form: RegistrationForm, step: 1 | 2): RegistrationErrors {
  const errors: RegistrationErrors = {};
  if (!/^0[689]\d{8}$/.test(normalizePhone(form.phone))) errors.phone = "กรอกเบอร์มือถือไทย 10 หลัก เช่น 0812345678";
  if (form.password.length < 6) errors.password = "ใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร";
  if (form.password_confirmation !== form.password || !form.password_confirmation) errors.password_confirmation = "รหัสผ่านทั้งสองช่องต้องตรงกัน";
  if (step === 1) return errors;
  if (!BANKS.some(bank => bank.code === form.bank_code)) errors.bank_code = "กรุณาเลือกธนาคารหรือวอลเล็ท";
  if (form.bank_code === "TRUEWALLET") {
    if (!/^0[689]\d{8}$/.test(form.bank_account)) errors.bank_account = "กรอกเบอร์ TrueWallet 10 หลัก";
  } else if (!/^\d{6,20}$/.test(form.bank_account)) errors.bank_account = "กรอกเลขบัญชี 6–20 หลัก ไม่ต้องใส่ขีด";
  if (!/^[ก-ฮะ-์a-zA-Z]{2,}(\s+[ก-ฮะ-์a-zA-Z]{2,})+$/.test(form.bank_name.trim()) || form.bank_name.trim().length > 100) {
    errors.bank_name = "กรอกชื่อและนามสกุลไทยหรืออังกฤษ คั่นด้วยเว้นวรรค ให้ตรงกับบัญชี";
  }
  if (form.referral_code.trim().length > 20) errors.referral_code = "รหัสแนะนำต้องไม่เกิน 20 ตัวอักษร";
  return errors;
}

// Keep the existing API contract. New members no longer need to invent a username.
// Legacy members still need backend phone lookup support; never resolve users client-side.
export function registrationPayload(form: RegistrationForm) {
  const phone = normalizePhone(form.phone);
  return { ...form, username: phone, phone, bank_name: form.bank_name.trim().replace(/\s+/g, " "), referral_code: form.referral_code.trim() };
}
