"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const storedUser = localStorage.getItem("user_data");
    if (!token) { router.push("/login"); return; }
    if (storedUser) setUserData(JSON.parse(storedUser));
    fetchWallet();
    fetchFinanceSettings();
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
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", position: "relative", overflow: "hidden", fontFamily: "'Kanit', sans-serif" }} className="pb-20 md:pb-10">

      {/* พื้นหลังลูกเต๋าเคลื่อนไหว */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${(i * 7) % 100}%`, left: `${(i * 11) % 100}%`, fontSize: `${18 + (i % 4) * 10}px`, opacity: 0.03 + (i % 3) * 0.015, animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`, animationDelay: `${i * 1.2}s`, filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
        ))}
      </div>

      <div className="mt-4 md:mt-8" style={{ position: "relative", zIndex: 10 }}>
        <div className="flex justify-center w-full">
          <div className="flex flex-col gap-4 w-full max-w-[820px] mx-auto px-4">

            {/* --- 1. เมนู Tabs ฝาก/ถอน --- */}
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/lobby")} className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#2B3259] text-white bg-[#181C31] hover:bg-[#2B3259] transition-colors shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
              </button>

              <div className="flex p-[4px] w-full rounded-full h-[46px] bg-[#181C31] border border-[#2B3259]">
                <button type="button" onClick={() => { setTab("deposit"); setAmount(""); }} className={`flex-1 flex items-center justify-center rounded-full text-base font-bold transition-all ${tab === "deposit" ? "bg-[#7c3aed] text-white shadow-md shadow-purple-500/20" : "text-[#717690] hover:text-white"}`}>
                  ฝากเงิน
                </button>
                <button type="button" onClick={() => { setTab("withdraw"); setAmount(""); }} className={`flex-1 flex items-center justify-center rounded-full text-base font-bold transition-all ${tab === "withdraw" ? "bg-[#7c3aed] text-white shadow-md shadow-purple-500/20" : "text-[#717690] hover:text-white"}`}>
                  ถอนเงิน
                </button>
              </div>

              <button onClick={() => router.push("/history")} className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#2B3259] text-white bg-[#181C31] hover:bg-[#2B3259] transition-colors shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
            </div>

            {/* --- 2. ส่วนกล่องเนื้อหาหลัก (ฝั่งซ้าย: วิธีชำระ / ฝั่งขวา: จำนวนเงิน) --- */}
            <form onSubmit={tab === "deposit" ? handleDeposit : handleWithdraw} className="flex flex-col lg:flex-row gap-4 w-full">

              {/* 🟢 ส่วนที่ 1: เลือกวิธีชำระเงิน (ช่องทาง) */}
              <div className="bg-[#181C31] flex flex-col gap-3 rounded-[1.25rem] border border-[#2B3259] w-full lg:w-[260px] shrink-0 p-4">
                <div className="font-bold text-sm text-white mb-1">
                  {tab === "deposit" ? "เลือกช่องทางการฝากเงิน" : "ช่องทางการถอนเงิน"}
                </div>

                {tab === "deposit" ? (
                  <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                    {finance.channels.map((ch) => (
                      <div key={ch} onClick={() => {
                        if (ch === "truewallet" && truewalletAccounts.length > 0) {
                          // Logic เปิด Popup TrueWallet เดิม
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
                            showConfirmButton: true, confirmButtonText: "ปิด", confirmButtonColor: "#ef4444",
                            background: "#fff", color: "#0f172a",
                            didOpen: () => {
                              const popup = document.querySelector('.swal2-popup') as HTMLElement;
                              if (popup) { popup.style.colorScheme = 'light'; popup.style.backgroundColor = '#ffffff'; }
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
                                const m = Math.floor(twSeconds / 60); const s = twSeconds % 60;
                                if (twTimerEl) twTimerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
                              }, 1000);
                            },
                          });
                        } else {
                          setChannel(ch);
                        }
                      }} 
                      className={`cursor-pointer rounded-[14px] border h-[80px] lg:h-[90px] flex flex-col items-center justify-center transition-all ${channel === ch ? "border-[#7c3aed] bg-[#7c3aed]/20 shadow-inner" : "border-[#2B3259] bg-[#0F111A] hover:border-[#7c3aed]/50"}`}>
                        <img className="w-7 h-7 lg:w-8 lg:h-8 mb-1" alt={ch} src={channelIcons[ch]?.icon || channelIcons.bank_transfer.icon} />
                        <span className="text-[10px] lg:text-[11px] font-medium text-[#e2e8f0]">{channelIcons[ch]?.label || ch}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[14px] border border-[#7c3aed] bg-[#7c3aed]/10 flex flex-col items-center justify-center p-6 h-full min-h-[140px]">
                    <img className="w-12 h-12 mb-3 drop-shadow-md" alt="icon" src="https://fs.cdnrc.com/payment-layout/svg/bank.svg" />
                    <span className="text-sm font-medium text-white text-center leading-snug">โอนเข้าบัญชีธนาคาร<br/><span className="text-[#a855f7] text-xs">ที่ลงทะเบียนไว้เท่านั้น</span></span>
                  </div>
                )}
              </div>

              {/* 🟢 ส่วนที่ 2: กรอกจำนวนเงิน & ยืนยัน */}
              <div className="flex flex-col flex-1 gap-4">

                {/* แสดงกล่องบัญชีลูกค้า (เฉพาะตอนถอน) */}
                {tab === "withdraw" && userData && (
                  <div className="flex items-center gap-3 rounded-[1.25rem] border border-[#7c3aed] bg-[#181C31] p-4 shadow-lg shadow-[#7c3aed]/5">
                    <img alt="Bank" width="40" height="40" className="shrink-0 rounded-[10px] bg-white object-contain p-1" src={`https://fs.cdnrc.com/payment-layout/iconbank/${userData.bank_code || 'BAY'}.png`} onError={(e) => { e.currentTarget.src = "https://fs.cdnrc.com/payment-layout/svg/bank.svg"; }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-[15px] font-semibold truncate leading-tight">{userData.bank_name || "บัญชีรับเงินของคุณ"}</div>
                      <div className="text-[#94a3b8] text-[13px] font-mono mt-0.5">{userData.bank_code} — {userData.bank_account}</div>
                    </div>
                  </div>
                )}

                {/* กล่องหลักสำหรับกรอกตัวเลข */}
                <div className="bg-[#181C31] flex flex-col rounded-[1.25rem] border border-[#2B3259] p-4 lg:p-6 w-full">
                  <div className="text-center font-medium text-white text-[15px] mb-3">
                    ระบุยอดเงินที่ต้องการ{tab === "deposit" ? "ฝาก" : "ถอน"}
                  </div>

                  {/* Input กล่องใหญ่ตรงกลาง */}
                  <div className="bg-[#0F111A] flex flex-col items-center justify-center rounded-[1rem] border border-[#2B3259] p-4 mb-4 relative">
                    <span className="text-[#717690] text-[11px] mb-1">
                      ขั้นต่ำ {minAmount.toLocaleString()} / สูงสุด {maxAmount.toLocaleString()} ฿
                    </span>
                    <div className="flex items-center justify-center">
                      <span className="text-[#a855f7] text-2xl font-bold mr-1">฿</span>
                      <input
                        inputMode="numeric"
                        className="bg-transparent text-white text-[32px] font-bold text-center outline-none border-none w-full max-w-[200px] placeholder:text-[#333b5c]"
                        type="text"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                    </div>
                  </div>

                  {/* ปุ่มด่วน (100, 300, 500...) */}
                  <div className={`grid gap-2 mb-5 ${finance.amounts.length <= 5 ? "grid-cols-5" : "grid-cols-4 md:grid-cols-5"}`}>
                    {finance.amounts.map((val) => (
                      <button key={val} type="button" onClick={() => addAmount(val)} className="flex items-center justify-center rounded-[10px] border border-[#2B3259] bg-[#0F111A] hover:border-[#a855f7] hover:text-[#a855f7] text-[#cbd5e1] h-[40px] text-[12px] font-semibold transition-all">
                        +{val >= 1000 ? `${(val/1000)}k` : val}
                      </button>
                    ))}
                  </div>

                  {/* คำเตือนด้านล่าง */}
                  <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-xl p-3 text-center mb-5">
                    {tab === "deposit" ? (
                      <p className="text-[#fca5a5] text-[11px] md:text-[12px] leading-relaxed m-0">
                        <strong className="text-[#ef4444]">คำเตือน:</strong> QR Code ใช้ได้ครั้งเดียว ห้ามโอนซ้ำยอดเดิม<br/>เงินจะเข้าอัตโนมัติภายใน 3-5 นาที
                      </p>
                    ) : (
                      <p className="text-[#fca5a5] text-[11px] md:text-[12px] leading-relaxed m-0">
                        กรุณาตรวจสอบชื่อ-นามสกุล และเลขบัญชีให้ถูกต้อง<br/>ระบบจะโอนเข้าบัญชีที่ลงทะเบียนไว้เท่านั้น
                      </p>
                    )}
                  </div>

                  {/* ปุ่มตกลง / ยกเลิก */}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setAmount("")} className="flex-1 h-[46px] rounded-xl font-bold text-white text-[14px] bg-[#333b5c] hover:bg-[#475569] transition-colors">
                      ล้างยอด
                    </button>
                    <button type="submit" disabled={loading || !amount} className="flex-[2] h-[46px] rounded-xl font-bold text-white text-[15px] bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] shadow-lg shadow-[#10b981]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? "กำลังโหลด..." : tab === "deposit" ? "ยืนยันการฝากเงิน" : "ยืนยันการถอนเงิน"}
                    </button>
                  </div>

                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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