"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

interface FinanceSettings {
  min_deposit: number;
  max_deposit: number;
  min_withdraw: number;
  max_withdraw: number;
  banks: { bank_code: string; bank_account: string; bank_name: string; is_active: boolean }[];
  channels: string[];
  amounts: number[];
}

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [finance, setFinance] = useState<FinanceSettings>({
    min_deposit: 100, max_deposit: 200000,
    min_withdraw: 300, max_withdraw: 200000,
    banks: [], channels: ["bank_transfer", "promptpay", "truewallet"],
    amounts: [100, 300, 500, 1000, 5000],
  });
  const [selectedBank, setSelectedBank] = useState<number>(0);
  const [truewalletAccounts, setTruewalletAccounts] = useState<{phone: string; name: string; is_active: boolean}[]>([]);

  const searchParams = useSearchParams();
  const [selectedPromo, setSelectedPromo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const storedUser = localStorage.getItem("user_data");
    if (!token) { router.push("/login"); return; }
    if (storedUser) setUserData(JSON.parse(storedUser));
    fetchWallet();
    fetchFinanceSettings();

    // โหลดโปรถ้ามี ?promo=ID และเปิดรับโปรอยู่
    const promoId = searchParams.get("promo");
    const acceptPromo = localStorage.getItem("accept_promo");
    if (promoId && acceptPromo !== "0") {
      api.get(`/promotions/${promoId}`).then((res) => {
        if (res.data.data) setSelectedPromo(res.data.data);
      }).catch(() => {});
    }
  }, []);

  const fetchWallet = () => {
    api.get("/wallet/balance").then((res) => setWallet(res.data.data)).catch(() => {});
  };

  const fetchFinanceSettings = () => {
    api.get("/finance/settings").then((res) => {
      if (res.data.data) {
        setFinance(res.data.data);
        if (res.data.data.truewallet_accounts) {
          setTruewalletAccounts(res.data.data.truewallet_accounts.filter((w: any) => w.is_active));
        }
      }
    }).catch(() => {});
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (val < finance.min_deposit) {
      Swal.fire({ icon: "warning", title: `ฝากขั้นต่ำ ${finance.min_deposit.toLocaleString()} บาท` });
      return;
    }
    if (val > finance.max_deposit) {
      Swal.fire({ icon: "warning", title: `ฝากสูงสุด ${finance.max_deposit.toLocaleString()} บาท` });
      return;
    }
    setLoading(true);
    try {
      await api.post("/deposits", {
        amount: val,
        channel,
        promotion_id: selectedPromo?.id || null,
      });

      if (finance.banks.length > 0) {
        const minutesLimit = 15;
        let secondsLeft = minutesLimit * 60;
        const banksHtml = finance.banks.map((b, i) => `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:8px">
            <img src="https://fs.cdnrc.com/payment-layout/iconbank/${b.bank_code}.png" style="width:40px;height:40px;border-radius:8px;background:#fff;padding:3px;object-fit:contain;border:1px solid #e2e8f0" />
            <div style="flex:1;text-align:left">
              <div style="font-size:13px;color:#64748b">${b.bank_code}</div>
              <div style="font-size:16px;font-weight:700;color:#0f172a;letter-spacing:0.5px">${b.bank_account}</div>
              <div style="font-size:13px;color:#475569">${b.bank_name}</div>
            </div>
            <button type="button" class="swal-copy" data-account="${b.bank_account}" style="background:#7c3aed;color:white;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer">คัดลอก</button>
          </div>
        `).join("");

        Swal.fire({
          html: `
            <div style="text-align:center;padding:4px 0">
              <div style="width:50px;height:50px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style="font-size:17px;font-weight:700;color:#0f172a;margin:0 0 4px">แจ้งฝากเงินสำเร็จ</h2>
              <p style="font-size:12px;color:#64748b;margin:0 0 14px">กรุณาโอนเงินไปที่บัญชีใดบัญชีหนึ่ง</p>
              ${banksHtml}
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:12px;margin:12px 0">
                <p style="font-size:22px;font-weight:700;color:#0f172a;margin:0">฿${parseFloat(amount).toLocaleString("th-TH", {minimumFractionDigits: 2})}</p>
                <p style="font-size:11px;color:#854d0e;margin:4px 0 0">กรุณาโอนตามจำนวนที่แจ้งเท่านั้น</p>
              </div>
              <div style="display:flex;align-items:center;justify-content:center;gap:6px">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p style="font-size:13px;color:#ef4444;margin:0;font-weight:600">โอนภายใน <span id="swal-timer">${minutesLimit}:00</span></p>
              </div>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonText: "โอนเงินแล้ว",
          confirmButtonColor: "#22c55e",
          allowOutsideClick: false,
          background: "#fff",
          color: "#0f172a",
          didOpen: () => {
            const popup = document.querySelector('.swal2-popup') as HTMLElement;
            if (popup) {
              popup.style.colorScheme = 'light';
              popup.style.backgroundColor = '#ffffff';
              popup.querySelectorAll('*').forEach((el: any) => { el.style.colorScheme = 'light'; });
            }
            document.querySelectorAll(".swal-copy").forEach((btn) => {
              btn.addEventListener("click", () => {
                const acc = btn.getAttribute("data-account") || "";
                navigator.clipboard.writeText(acc);
                btn.textContent = "คัดลอกแล้ว ✓";
                (btn as HTMLElement).style.background = "#22c55e";
                setTimeout(() => { btn.textContent = "คัดลอก"; (btn as HTMLElement).style.background = "#7c3aed"; }, 2000);
              });
            });
            const timerEl = document.getElementById("swal-timer");
            const interval = setInterval(() => {
              secondsLeft--;
              if (secondsLeft <= 0) { clearInterval(interval); Swal.close(); return; }
              const m = Math.floor(secondsLeft / 60);
              const s = secondsLeft % 60;
              if (timerEl) timerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
            }, 1000);
          },
        });
      } else {
        Swal.fire({ icon: "success", title: "แจ้งฝากเงินสำเร็จ", text: "รอ Admin อนุมัติ", timer: 2000, showConfirmButton: false });
      }
      setAmount("");
      fetchWallet();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "ไม่สำเร็จ", text: err.response?.data?.message || "เกิดข้อผิดพลาด" });
    } finally { setLoading(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (val < finance.min_withdraw) {
      Swal.fire({ icon: "warning", title: `ถอนขั้นต่ำ ${finance.min_withdraw.toLocaleString()} บาท` });
      return;
    }
    if (val > finance.max_withdraw) {
      Swal.fire({ icon: "warning", title: `ถอนสูงสุด ${finance.max_withdraw.toLocaleString()} บาท` });
      return;
    }
    setLoading(true);
    try {
      await api.post("/withdrawals", { amount: val });
      Swal.fire({ icon: "success", title: "แจ้งถอนเงินสำเร็จ", text: "รอ Admin อนุมัติ", timer: 2000, showConfirmButton: false });
      setAmount("");
      fetchWallet();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "ไม่สำเร็จ", text: err.response?.data?.message || "เกิดข้อผิดพลาด" });
    } finally { setLoading(false); }
  };

  const addAmount = (val: number) => {
    setAmount((prev) => (parseFloat(prev || "0") + val).toString());
  };

  const channelIcons: Record<string, { icon: string; label: string }> = {
    bank_transfer: { icon: "https://fs.cdnrc.com/payment-layout/svg/bank.svg", label: "บัญชีธนาคาร" },
    promptpay: { icon: "https://fs.cdnrc.com/payment-layout/svg/qr-payment.svg", label: "QR Payment" },
    truewallet: { icon: "https://fs.cdnrc.com/payment-layout/svg/true-wallet.svg", label: "True Wallet" },
  };

  const minAmount = tab === "deposit" ? finance.min_deposit : finance.min_withdraw;
  const maxAmount = tab === "deposit" ? finance.max_deposit : finance.max_withdraw;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", position: "relative", overflow: "hidden", fontFamily: "'Kanit', sans-serif" }} className="pb-24 md:pb-10">

      {/* Dice Background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${(i * 7) % 100}%`, left: `${(i * 11) % 100}%`, fontSize: `${18 + (i % 4) * 10}px`, opacity: 0.03 + (i % 3) * 0.015, animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `${i * 1.2}s`, filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        ))}
      </div>

      <div className="page-content mt-4 md:mt-6" style={{ position: "relative", zIndex: 10 }}>
        <div className="flex justify-center">
          <div className="flex gap-2 flex-col w-full max-w-[860px] mx-auto px-3 md:px-4">

            {/* Header: Tabs */}
            <div className="flex items-center gap-2">
              <button onClick={() => router.push("/lobby")} className="cursor-pointer inline-flex items-center justify-center size-9 rounded-full border-2 border-[#2B3259] text-white bg-[#181C31]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
              </button>

              <div className="p-[3px] inline-flex items-center justify-center w-full rounded-full h-10 bg-[#181C31]">
                <button type="button" onClick={() => { setTab("deposit"); setAmount(""); }} className={`relative inline-flex h-full flex-1 items-center justify-center px-2 py-1 whitespace-nowrap transition-all font-bold text-base md:text-lg rounded-full ${tab === "deposit" ? "bg-[#ef4444] text-white" : "text-[#717690]"}`}>
                  ฝากเงิน
                </button>
                <button type="button" onClick={() => { setTab("withdraw"); setAmount(""); }} className={`relative inline-flex h-full flex-1 items-center justify-center px-2 py-1 whitespace-nowrap transition-all font-bold text-base md:text-lg rounded-full ${tab === "withdraw" ? "bg-[#ef4444] text-white" : "text-[#717690]"}`}>
                  ถอนเงิน
                </button>
              </div>

              <button onClick={() => router.push("/history")} className="cursor-pointer inline-flex items-center justify-center size-9 rounded-full border-2 border-[#2B3259] text-white bg-[#181C31]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
            </div>

            {/* แสดงโปรที่เลือก */}
            {selectedPromo && tab === "deposit" && (
              <div style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.15))",
                border: "1px solid rgba(168,85,247,0.4)",
                borderRadius: "12px", padding: "12px 16px",
                display: "flex", alignItems: "center", gap: "12px",
                marginTop: "8px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", fontWeight: 800, color: "white", flexShrink: 0,
                }}>
                  {selectedPromo.bonus_percent}%
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 700 }}>{selectedPromo.title}</div>
                  <div style={{ color: "#c084fc", fontSize: "0.72rem" }}>
                    ฝากขั้นต่ำ ฿{parseFloat(selectedPromo.min_deposit).toLocaleString()} | โบนัสสูงสุด ฿{parseFloat(selectedPromo.max_bonus).toLocaleString()} | Turnover {selectedPromo.turnover_multiplier}x
                  </div>
                </div>
                <button onClick={() => setSelectedPromo(null)} style={{
                  background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "8px", padding: "4px 10px", cursor: "pointer",
                  color: "#fca5a5", fontSize: "0.7rem", fontWeight: 600,
                }}>ยกเลิก</button>
              </div>
            )}

           {/* Content */}
            <div className="mt-5 md:mt-6 w-full">
              <form onSubmit={tab === "deposit" ? handleDeposit : handleWithdraw} className="flex flex-col md:flex-row gap-5 md:gap-6 w-full">

                {/* Left: Payment Methods (เปลี่ยนเป็นกล่อง 3D) */}
                <div className="finance-card flex flex-col gap-3 w-full md:w-[250px] shrink-0 p-4 md:p-5">
                  <div className="font-bold text-sm text-white text-center tracking-wide">
                    {tab === "deposit" ? "เลือกวิธีการฝากเงิน" : "ช่องทางการถอนเงิน"}
                  </div>

                  {tab === "deposit" ? (
                   <div className="grid grid-cols-3 gap-2 w-full">
                      {finance.channels.map((ch) => (
                        <div key={ch} onClick={() => {
                          if (ch === "truewallet" && truewalletAccounts.length > 0) {
                            const walletsHtml = truewalletAccounts.map((w, i) => `
                              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px;margin-bottom:8px">
                                <img src="https://fs.cdnrc.com/payment-layout/svg/true-wallet.svg" style="width:40px;height:40px;isolation:isolate;filter:none!important;" />
                                <div style="flex:1;text-align:left">
                                  <div style="font-size:13px;color:#166534">${w.name}</div>
                                  <div style="font-size:18px;font-weight:700;color:#0f172a;letter-spacing:1px">${w.phone}</div>
                                </div>
                                <button type="button" class="tw-copy" data-phone="${w.phone}" style="background:#22c55e;color:white;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer">คัดลอก</button>
                              </div>
                            `).join("");

                            Swal.fire({
                              html: `
                                <div style="text-align:center;padding:8px 0">
                                  <img src="https://fs.cdnrc.com/payment-layout/svg/true-wallet.svg" style="width:56px;height:56px;margin:0 auto 12px;display:block;isolation:isolate;filter:none!important;" />
                                  <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px">ฝากผ่าน True Wallet</h2>
                                  <p style="font-size:13px;color:#64748b;margin:0 0 16px">กรุณาโอนเงินไปที่บัญชีด้านล่าง</p>
                                  ${walletsHtml}
                                  <p style="font-size:12px;color:#ef4444;font-weight:500;margin-top:12px">โอนเสร็จแล้วเงินจะเข้าอัตโนมัติภายใน 5 นาที</p>
                                  <p style="font-size:24px;color:#ef4444;font-weight:700;margin-top:8px" id="tw-timer">10:00</p>
                                </div>
                              `,
                              showConfirmButton: true,
                              confirmButtonText: "ปิด",
                              confirmButtonColor: "#ef4444",
                              background: "#fff",
                              color: "#0f172a",
                              didOpen: () => {
                                const popup = document.querySelector('.swal2-popup') as HTMLElement;
                                if (popup) {
                                 popup.style.colorScheme = 'light';
                                 popup.style.backgroundColor = '#ffffff';
                                }
                                document.querySelectorAll(".tw-copy").forEach((btn) => {
                                  btn.addEventListener("click", () => {
                                    const phone = btn.getAttribute("data-phone") || "";
                                    navigator.clipboard.writeText(phone);
                                    btn.textContent = "คัดลอกแล้ว ✓";
                                    setTimeout(() => { btn.textContent = "คัดลอก"; }, 2000);
                                  });
                                });
                                let twSeconds = 600;
                                const twTimerEl = document.getElementById("tw-timer");
                                const twInterval = setInterval(() => {
                                  twSeconds--;
                                  if (twSeconds <= 0) { clearInterval(twInterval); Swal.close(); return; }
                                  const m = Math.floor(twSeconds / 60);
                                  const s = twSeconds % 60;
                                  if (twTimerEl) twTimerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
                                }, 1000);
                              },
                            });
                          } else {
                            setChannel(ch);
                          }
                        }} className={`cursor-pointer w-full h-20 md:h-24 text-center p-2 flex items-center justify-center finance-btn ${channel === ch ? "active" : ""}`}>
                          <div className="flex flex-col justify-center items-center gap-1.5">
                            <img className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md" alt={ch} src={channelIcons[ch]?.icon || channelIcons.bank_transfer.icon} />
                            <span className="text-[10px] md:text-xs font-medium text-white">{channelIcons[ch]?.label || ch}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="finance-inner-box text-center p-6 w-full flex flex-col items-center justify-center">
                      <img className="w-10 h-10 mx-auto mb-3 drop-shadow-md" alt="icon" src="https://fs.cdnrc.com/payment-layout/svg/bank.svg" />
                      <span className="text-sm font-medium text-white">ถอนเข้าบัญชีธนาคาร<br/>ที่ลงทะเบียนไว้</span>
                    </div>
                  )}
                </div>

                {/* Right: Amount & Action */}
                <div className="flex flex-col w-full flex-1 gap-4 md:gap-6">

                  {/* บัญชีลูกค้า (ถอน) - ปรับเป็นแบบบุ๋ม */}
                  {tab === "withdraw" && userData && (
                    <div>
                      <label className="text-sm font-semibold text-white mb-2 block px-2 tracking-wide">บัญชีรับเงิน</label>
                      <div className="flex items-center gap-3 p-4 finance-inner-box">
                        <img alt="Bank" width="32" height="32" className="shrink-0 rounded-md bg-white object-contain p-0.5 shadow-md" src={`https://fs.cdnrc.com/payment-layout/iconbank/${userData.bank_code || 'BAY'}.png`} onError={(e) => { e.currentTarget.src = "https://fs.cdnrc.com/payment-layout/svg/bank.svg"; }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-semibold truncate">{userData.bank_name || "บัญชีของฉัน"}</div>
                          <div className="text-[#fbcfe8] text-xs">{userData.bank_code} — {userData.bank_account}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* กรอกจำนวนเงิน (เปลี่ยนเป็นกล่อง 3D) */}
                  <div className="finance-card flex flex-col gap-3 p-4 md:p-5">

                    <div style={{ display: "flex", justifyContent: "center", width: "100%", paddingTop: "4px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 600, color: "white", textAlign: "center", letterSpacing: "0.5px" }}>
                        ระบุจำนวนเงิน{tab === "deposit" ? "ฝาก" : "ถอน"}
                      </label>
                    </div>

                    {/* กล่องกรอกตัวเลขแบบบุ๋ม */}
                    <div className="finance-inner-box flex flex-col items-center justify-center p-4">
                      <span style={{ color: "#fbcfe8", fontSize: "11px", marginBottom: "8px" }}>
                        ขั้นต่ำ: {minAmount.toLocaleString()} / สูงสุด {maxAmount.toLocaleString()}
                      </span>
                      <input
                        inputMode="numeric"
                        style={{ color: "#fdf2f8", background: "transparent", textAlign: "center", fontSize: "1.8rem", fontWeight: 700, outline: "none", border: "none", width: "100%", maxWidth: "200px" }}
                        type="text"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                    </div>

                    {/* ปุ่มยกเลิก / ยืนยัน (ใส่แสงและเงาให้ดูน่ากด) */}
                    <div className="flex gap-2 w-full mt-2">
                      <button type="button" onClick={() => setAmount("")} className="inline-flex items-center justify-center rounded-xl text-xs md:text-sm font-bold transition-all border border-[#9f1239] bg-gradient-to-b from-[#e11d48] to-[#be123c] text-white h-10 md:h-12 flex-1 cursor-pointer shadow-[0_4px_10px_rgba(225,29,72,0.3)] hover:brightness-110">
                        ยกเลิก
                      </button>
                      <button type="submit" disabled={loading || !amount} className="inline-flex items-center justify-center rounded-xl text-xs md:text-sm font-bold transition-all border border-[#047857] bg-gradient-to-b from-[#10b981] to-[#059669] text-white disabled:opacity-50 h-10 md:h-12 flex-1 cursor-pointer shadow-[0_4px_10px_rgba(16,185,129,0.3)] hover:brightness-110">
                        {loading ? "กำลังทำรายการ..." : "ยืนยัน"}
                      </button>
                    </div>

                   {/* ปุ่ม +จำนวนเงิน */}
                    <div className="grid gap-1.5 md:gap-2 mt-2 grid-cols-3 md:grid-cols-5 w-full">
                      {finance.amounts.map((val) => (
                        <button key={val} type="button" onClick={() => addAmount(val)} className="finance-btn inline-flex items-center justify-center gap-0.5 md:gap-1.5 font-medium h-10 md:h-11 px-1 md:px-2 text-[11px] md:text-sm cursor-pointer">
                          <img alt="coin" className="w-3.5 h-3.5 shrink-0 hidden md:block drop-shadow-sm" src="https://fs.cdnrc.com/payment-layout/svg/coin.svg" />
                          +{val >= 1000 ? `${(val/1000)}k` : val}
                        </button>
                      ))}
                    </div>

                    {/* ข้อความแจ้งเตือน */}
                    <div className="flex flex-col items-center gap-1 text-center mt-2 px-2">
                      {tab === "deposit" ? (
                        <>
                          <span className="text-[11px] md:text-xs text-[#fca5a5] font-medium">QR Code จะสามารถใช้สแกนได้เพียงครั้งเดียวเท่านั้น !</span>
                          <span className="text-[11px] md:text-xs text-[#fca5a5] font-medium">หลังจากฝากเงินสำเร็จรอไม่เกิน 5 นาที เงินจะเข้ากระเป๋าอัตโนมัติ</span>
                        </>
                      ) : (
                        <span className="text-[11px] md:text-xs text-[#fde047]">เงินจะโอนเข้าบัญชีที่ท่านลงทะเบียนไว้เท่านั้น</span>
                      )}
                    </div>

                  </div>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `

      /* --- ธีมการ์ด 3D สีม่วงชมพู (เข้ากับหน้า Profile) --- */
        .finance-card {
          background: linear-gradient(180deg, rgba(88, 28, 135, 0.6) 0%, rgba(157, 23, 77, 0.7) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(236, 72, 153, 0.3);
          box-shadow: 0 8px 16px rgba(0,0,0,0.4), inset 0 2px 2px rgba(255,255,255,0.1), inset 0 -4px 6px rgba(0,0,0,0.3);
        }

        /* กล่องด้านใน (ช่องกรอกเงิน, เลือกบัญชี) ให้ดูบุ๋มลึกลงไป */
        .finance-inner-box {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(236, 72, 153, 0.2);
          border-radius: 12px;
          box-shadow: inset 0 4px 8px rgba(0,0,0,0.4);
        }

        /* ปุ่มกดต่างๆ (ช่องทางฝาก, ยอดเงินด่วน) */
        .finance-btn {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(236, 72, 153, 0.2);
          border-radius: 12px;
          color: white;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .finance-btn:hover {
          background: rgba(236, 72, 153, 0.15);
          border-color: rgba(236, 72, 153, 0.5);
        }
        
        /* สถานะเมื่อปุ่มถูกเลือก (Active) */
        .finance-btn.active {
          background: linear-gradient(180deg, rgba(236, 72, 153, 0.4) 0%, rgba(157, 23, 77, 0.5) 100%);
          border-color: rgba(236, 72, 153, 0.8);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2);
        }

        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.05; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.06; }
          85% { opacity: 0.03; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }
      `}} />
    </div>
  );
}