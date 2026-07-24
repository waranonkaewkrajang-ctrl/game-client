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
        if (res.data.data.channels?.length > 0) {
          setChannel(res.data.data.channels[0]);
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
      const bank = finance.banks[selectedBank];
      await api.post("/deposits", {
        amount: val, channel,
        to_bank: bank?.bank_code || null,
        to_account: bank?.bank_account || null,
      });
      if (bank) {
        const minutesLimit = 15;
        let secondsLeft = minutesLimit * 60;

        const popup = Swal.fire({
          html: `
            <div style="text-align:center;padding:8px 0">
              <div style="width:56px;height:56px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 4px">แจ้งฝากเงินสำเร็จ</h2>
              <p style="font-size:13px;color:#64748b;margin:0 0 16px">กรุณาโอนเงินไปที่บัญชีด้านล่าง</p>
              
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:16px">
                <img src="https://fs.cdnrc.com/payment-layout/iconbank/${bank.bank_code}.png" style="width:48px;height:48px;border-radius:12px;background:#fff;padding:4px;object-fit:contain;margin:0 auto 12px;display:block;border:1px solid #e2e8f0" />
                <p style="font-size:13px;color:#64748b;margin:0 0 4px">${bank.bank_code}</p>
                <p style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 4px;letter-spacing:1px" id="swal-account">${bank.bank_account}</p>
                <p style="font-size:14px;color:#475569;margin:0 0 12px">${bank.bank_name}</p>
                <button type="button" id="swal-copy-btn" style="background:#7c3aed;color:white;border:none;border-radius:8px;padding:8px 24px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s">
                  คัดลอกเลขบัญชี
                </button>
              </div>

              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:14px;margin-bottom:16px">
                <p style="font-size:24px;font-weight:700;color:#0f172a;margin:0">฿${parseFloat(amount).toLocaleString("th-TH", {minimumFractionDigits: 2})}</p>
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
          showCancelButton: false,
          allowOutsideClick: false,
          background: "#fff",
          color: "#0f172a",
          customClass: { popup: "swal-clean-popup" },
          didOpen: () => {
            // คัดลอกเลขบัญชี
            const copyBtn = document.getElementById("swal-copy-btn");
            if (copyBtn) {
              copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(bank.bank_account);
                copyBtn.textContent = "คัดลอกแล้ว ✓";
                copyBtn.style.background = "#22c55e";
                setTimeout(() => {
                  copyBtn.textContent = "คัดลอกเลขบัญชี";
                  copyBtn.style.background = "#7c3aed";
                }, 2000);
              });
            }
            // นับถอยหลัง
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
                <button type="button" onClick={() => { setTab("deposit"); setAmount(""); }} className={`relative inline-flex h-full flex-1 items-center justify-center px-2 py-1 whitespace-nowrap transition-all font-bold text-base md:text-lg rounded-full ${tab === "deposit" ? "bg-[#7c3aed] text-white" : "text-[#717690]"}`}>
                  ฝากเงิน
                </button>
                <button type="button" onClick={() => { setTab("withdraw"); setAmount(""); }} className={`relative inline-flex h-full flex-1 items-center justify-center px-2 py-1 whitespace-nowrap transition-all font-bold text-base md:text-lg rounded-full ${tab === "withdraw" ? "bg-[#7c3aed] text-white" : "text-[#717690]"}`}>
                  ถอนเงิน
                </button>
              </div>

              <button onClick={() => router.push("/history")} className="cursor-pointer inline-flex items-center justify-center size-9 rounded-full border-2 border-[#2B3259] text-white bg-[#181C31]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </button>
            </div>

            {/* Content */}
            <div className="mt-3 md:mt-4 w-full">
              <form onSubmit={tab === "deposit" ? handleDeposit : handleWithdraw} className="flex flex-col md:flex-row gap-3 md:gap-6 w-full">

                {/* Left: Payment Methods */}
                <div className="bg-[#181C31] flex flex-col gap-3 rounded-xl border border-[#2B3259] w-full md:w-[250px] shrink-0 p-3 md:p-4">
                  <div className="font-bold text-sm text-white">
                    {tab === "deposit" ? "เลือกวิธีการฝากเงิน" : "ช่องทางการถอนเงิน"}
                  </div>

                  {tab === "deposit" ? (
                    <div className={`grid grid-cols-${Math.min(finance.channels.length, 3)} md:grid-cols-2 gap-2 w-full`}>
                      {finance.channels.map((ch) => (
                        <div key={ch} onClick={() => setChannel(ch)} className={`cursor-pointer rounded-xl border w-full h-20 md:h-24 text-center p-2 flex items-center justify-center transition-all ${channel === ch ? "border-[#7c3aed] bg-[#7c3aed]/10" : "border-[#2B3259] hover:bg-[#2B3259]/50"}`}>
                          <div className="flex flex-col justify-center items-center gap-1.5">
                            <img className="w-7 h-7 md:w-8 md:h-8" alt={ch} src={channelIcons[ch]?.icon || channelIcons.bank_transfer.icon} />
                            <span className="text-[10px] md:text-xs font-medium text-white">{channelIcons[ch]?.label || ch}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#7c3aed] bg-[#7c3aed]/10 text-center p-6 w-full flex flex-col items-center justify-center">
                      <img className="w-10 h-10 mx-auto mb-3" alt="icon" src="https://fs.cdnrc.com/payment-layout/svg/bank.svg" />
                      <span className="text-sm font-medium text-white">ถอนเข้าบัญชีธนาคาร<br/>ที่ลงทะเบียนไว้</span>
                    </div>
                  )}
                </div>

                {/* Right: Amount & Action */}
                <div className="flex flex-col w-full flex-1 gap-4 md:gap-6">

                  {/* บัญชีลูกค้า (ถอน) */}
                  {tab === "withdraw" && userData && (
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">บัญชีรับเงิน</label>
                      <div className="flex items-center gap-3 rounded-2xl border border-[#7c3aed] bg-[#7c3aed]/10 p-4">
                        <img alt="Bank" width="32" height="32" className="shrink-0 rounded-md bg-white object-contain p-0.5" src={`https://fs.cdnrc.com/payment-layout/iconbank/${userData.bank_code || 'BAY'}.png`} onError={(e) => { e.currentTarget.src = "https://fs.cdnrc.com/payment-layout/svg/bank.svg"; }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-semibold truncate">{userData.bank_name || "บัญชีของฉัน"}</div>
                          <div className="text-[#717690] text-xs">{userData.bank_code} — {userData.bank_account}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* กรอกจำนวนเงิน */}
                  <div style={{ background: "#181C31", display: "flex", flexDirection: "column", gap: "12px", borderRadius: "16px", border: "1px solid #2B3259", padding: "20px 16px" }}>

                    <div style={{ display: "flex", justifyContent: "center", width: "100%", paddingTop: "4px" }}>
                      <label style={{ fontSize: "14px", fontWeight: 500, color: "white", textAlign: "center" }}>
                        ระบุจำนวนเงิน{tab === "deposit" ? "ฝาก" : "ถอน"}
                      </label>
                    </div>

                    {/* กล่องกรอกตัวเลข */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "12px", border: "1px solid #2B3259", padding: "16px 12px", background: "#0F111A" }}>
                      <span style={{ color: "#717690", fontSize: "11px", marginBottom: "8px" }}>
                        ขั้นต่ำ: {minAmount.toLocaleString()} / สูงสุด {maxAmount.toLocaleString()}
                      </span>
                      <input
                        inputMode="numeric"
                        style={{ color: "#a855f7", background: "transparent", textAlign: "center", fontSize: "1.5rem", fontWeight: 700, outline: "none", border: "none", width: "100%", maxWidth: "200px" }}
                        type="text"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      />
                    </div>

                    {/* ปุ่มยกเลิก / ยืนยัน */}
                    <div className="flex gap-2 w-full">
                      <button type="button" onClick={() => setAmount("")} className="inline-flex items-center justify-center rounded-xl text-xs md:text-sm font-medium transition-all border border-[#9f1239] bg-gradient-to-b from-[#e11d48] to-[#be123c] text-white h-10 md:h-11 flex-1 cursor-pointer">
                        ยกเลิก
                      </button>
                      <button type="submit" disabled={loading || !amount} className="inline-flex items-center justify-center rounded-xl text-xs md:text-sm font-medium transition-all border border-[#047857] bg-gradient-to-b from-[#10b981] to-[#059669] text-white disabled:opacity-50 h-10 md:h-11 flex-1 cursor-pointer">
                        {loading ? "กำลังทำรายการ..." : "ยืนยัน"}
                      </button>
                    </div>

                    {/* ปุ่ม +จำนวนเงิน (จาก settings) */}
                    <div className={`grid gap-1.5 md:gap-2 mt-1 ${finance.amounts.length <= 5 ? "grid-cols-5" : "grid-cols-4 md:grid-cols-5"}`}>
                      {finance.amounts.map((val) => (
                        <button key={val} type="button" onClick={() => addAmount(val)} className="cursor-pointer inline-flex items-center justify-center gap-0.5 md:gap-1.5 rounded-lg font-medium transition-all border border-[#2B3259] bg-[#0F111A] hover:bg-[#7c3aed]/20 hover:border-[#7c3aed] text-white h-10 md:h-11 px-1 md:px-2 text-[11px] md:text-sm">
                          <img alt="coin" className="w-3.5 h-3.5 shrink-0 hidden md:block" src="https://fs.cdnrc.com/payment-layout/svg/coin.svg" />
                          +{val >= 1000 ? `${(val/1000)}k` : val}
                        </button>
                      ))}
                    </div>

                    {/* ข้อความแจ้งเตือน */}
                    <div className="flex flex-col items-center gap-1 text-center mt-1 px-2">
                      {tab === "deposit" ? (
                        <>
                          <span className="text-[11px] md:text-sm text-red-500 font-medium">QR Code จะสามารถใช้สแกนได้เพียงครั้งเดียวเท่านั้น !</span>
                          <span className="text-[11px] md:text-sm text-red-500 font-medium">หลังจากฝากเงินสำเร็จรอไม่เกิน 5 นาที เงินจะเข้ากระเป๋าอัตโนมัติ</span>
                        </>
                      ) : (
                        <span className="text-[11px] md:text-xs text-[#fbbf24]">เงินจะโอนเข้าบัญชีที่ท่านลงทะเบียนไว้เท่านั้น</span>
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