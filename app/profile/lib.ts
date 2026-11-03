// Small client helpers shared by the profile components.

/** SweetAlert2 is loaded only when a dialog/toast is actually needed. */
export async function swal() {
  return (await import("sweetalert2")).default;
}

const DARK = { background: "#1a1a2e", color: "#e2e8f0" } as const;

export async function toast(text: string, icon?: "success" | "info") {
  const Swal = await swal();
  return Swal.fire({
    text,
    icon,
    toast: true,
    position: "top",
    showConfirmButton: false,
    timer: 2000,
    background: "#27272a",
    color: "#fafafa",
  });
}

export async function alertBox(opts: { icon: "warning" | "success" | "error"; title: string; text?: string; confirmButtonColor: string }) {
  const Swal = await swal();
  return Swal.fire({ ...DARK, ...opts });
}

/** Same copy behaviour as before: ignore empty / "-" values, then show a toast. */
export async function copyText(text: string | null | undefined, label: string) {
  if (!text || text === "-") return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* clipboard may be blocked (http / permissions) — still show feedback below */
  }
  toast(`คัดลอก${label}แล้ว`);
}

export const num = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : 0;
};

export const baht = (v: unknown, digits = 2) =>
  num(v).toLocaleString("th-TH", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Logout: confirm with SweetAlert, then clear the same keys as before and go to /login. */
export async function confirmLogout() {
  const Swal = await swal();
  const res = await Swal.fire({
    ...DARK,
    icon: "question",
    title: "ออกจากระบบ?",
    text: "ต้องการออกจากระบบใช่หรือไม่",
    showCancelButton: true,
    confirmButtonText: "ออกจากระบบ",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#52525b",
    reverseButtons: true,
  });
  if (res.isConfirmed) {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    window.location.href = "/login";
  }
}
