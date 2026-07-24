"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Swal from "sweetalert2";

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [tab, setTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null); 

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const storedUser = localStorage.getItem("user_data");
    
    if (!token) { 
      router.push("/login"); 
      return; 
    }

    // 🟢 ดึงข้อมูล User จาก LocalStorage มาใช้งาน
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    fetchWallet();
  }, []);

  const fetchWallet = () => {
    api.get("/wallet/balance").then((res) => setWallet(res.data.data)).catch(() => {});
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await api.post("/deposits", { amount: parseFloat(amount), channel });
      Swal.fire({ icon: "success", title: "แจ้งฝากเงินสำเร็จ", text: "รอ Admin อนุมัติ", timer: 2000, showConfirmButton: false });
      setAmount("");
      fetchWallet();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "ไม่สำเร็จ", text: err.response?.data?.message || "เกิดข้อผิดพลาด" });
    } finally { setLoading(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      await api.post("/withdrawals", { amount: parseFloat(amount) });
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

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", position: "relative", overflow: "hidden", fontFamily: "'Kanit', sans-serif" }} className="pb-24 md:pb-10">
      
      {/* 🎲 1. วางเลเยอร์ลูกเต๋าไว้ตรงนี้ (เป็นลูกตัวแรกของ div หลัก) */}
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div style={{ position: "absolute", top: "0%", left: "0%", fontSize: "18px", opacity: 0.03, animation: "floatDice 22s ease-in-out infinite", animationDelay: "0s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "7%", left: "11%", fontSize: "28px", opacity: 0.045, animation: "floatDice 25s ease-in-out infinite", animationDelay: "1.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "14%", left: "22%", fontSize: "38px", opacity: 0.06, animation: "floatDice 28s ease-in-out infinite", animationDelay: "2.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "21%", left: "33%", fontSize: "48px", opacity: 0.03, animation: "floatDice 31s ease-in-out infinite", animationDelay: "3.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "28%", left: "44%", fontSize: "18px", opacity: 0.045, animation: "floatDice 34s ease-in-out infinite", animationDelay: "4.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "35%", left: "55%", fontSize: "28px", opacity: 0.06, animation: "floatDice 22s ease-in-out infinite", animationDelay: "6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "42%", left: "66%", fontSize: "38px", opacity: 0.03, animation: "floatDice 25s ease-in-out infinite", animationDelay: "7.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "49%", left: "77%", fontSize: "48px", opacity: 0.045, animation: "floatDice 28s ease-in-out infinite", animationDelay: "8.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "56%", left: "88%", fontSize: "18px", opacity: 0.06, animation: "floatDice 31s ease-in-out infinite", animationDelay: "9.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "63%", left: "99%", fontSize: "28px", opacity: 0.03, animation: "floatDice 34s ease-in-out infinite", animationDelay: "10.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "70%", left: "10%", fontSize: "38px", opacity: 0.045, animation: "floatDice 22s ease-in-out infinite", animationDelay: "12s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "77%", left: "21%", fontSize: "48px", opacity: 0.06, animation: "floatDice 25s ease-in-out infinite", animationDelay: "13.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "84%", left: "32%", fontSize: "18px", opacity: 0.03, animation: "floatDice 28s ease-in-out infinite", animationDelay: "14.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "91%", left: "43%", fontSize: "28px", opacity: 0.045, animation: "floatDice 31s ease-in-out infinite", animationDelay: "15.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "98%", left: "54%", fontSize: "38px", opacity: 0.06, animation: "floatDice 34s ease-in-out infinite", animationDelay: "16.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "5%", left: "65%", fontSize: "48px", opacity: 0.03, animation: "floatDice 22s ease-in-out infinite", animationDelay: "18s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "12%", left: "76%", fontSize: "18px", opacity: 0.045, animation: "floatDice 25s ease-in-out infinite", animationDelay: "19.2s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "19%", left: "87%", fontSize: "28px", opacity: 0.06, animation: "floatDice 28s ease-in-out infinite", animationDelay: "20.4s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "26%", left: "98%", fontSize: "38px", opacity: 0.03, animation: "floatDice 31s ease-in-out infinite", animationDelay: "21.6s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
    <div style={{ position: "absolute", top: "33%", left: "9%", fontSize: "48px", opacity: 0.045, animation: "floatDice 34s ease-in-out infinite", animationDelay: "22.8s", filter: "grayscale(1) brightness(0.4)" }}>🎲</div>
  </div>

      <div className="page-content mt-6" style={{ position: "relative", zIndex: 10 }}>
        <div className="flex justify-center">
          <div dir="ltr" data-orientation="horizontal" className="group/tabs flex gap-2 data-[orientation=horizontal]:flex-col box-container w-[860px] mx-auto px-4">
            
            {/* Header: Tabs & Nav Buttons */}
            <div className="flex items-center gap-2">
              {/* Back Button */}
              <button onClick={() => router.push("/lobby")} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all outline-none hover:bg-primary/90 size-9 md:!w-auto md:!px-3 rounded-full border-2 border-primary-500 dark:border-primary-200 text-primary-500 dark:text-primary-300 bg-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
              </button>

              {/* Tabs */}
              <div role="tablist" aria-orientation="horizontal" className="p-[3px] inline-flex items-center justify-center bg-card w-full rounded-full h-10! bg-[#181C31]">
                <button type="button" role="tab" onClick={() => { setTab("deposit"); setAmount(""); }} data-state={tab === "deposit" ? "active" : "inactive"} className="text-primary-500 hover:text-primary-200 dark:text-primary-300 relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 px-2 py-1 whitespace-nowrap transition-all data-[state=active]:bg-primary-500 data-[state=active]:text-white font-bold text-lg rounded-full">
                  ฝากเงิน
                </button>
                <button type="button" role="tab" onClick={() => { setTab("withdraw"); setAmount(""); }} data-state={tab === "withdraw" ? "active" : "inactive"} className="text-primary-500 hover:text-primary-200 dark:text-primary-300 relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 px-2 py-1 whitespace-nowrap transition-all data-[state=active]:bg-primary-500 data-[state=active]:text-white font-bold text-lg rounded-full">
                  ถอนเงิน
                </button>
              </div>

              {/* History Button */}
              <button onClick={() => router.push("/history")} className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all outline-none hover:bg-primary/90 size-9 md:!w-auto md:!px-3 rounded-full border-2 border-primary-500 dark:border-primary-200 text-primary-500 dark:text-primary-300 bg-card">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <g>
                    <path d="M16.0547 0.342773V3.90598H19.6176L16.0547 0.342773Z" fill="currentColor"></path>
                    <path d="M15.4688 5.07812C15.1452 5.07812 14.8828 4.81578 14.8828 4.49219V0H6.48438C5.51512 0 4.72656 0.788555 4.72656 1.75781V8.30816C4.91961 8.29066 5.11496 8.28125 5.3125 8.28125C7.30969 8.28125 9.09754 9.19438 10.2807 10.625H16.6406C16.9642 10.625 17.2266 10.8873 17.2266 11.2109C17.2266 11.5345 16.9642 11.7969 16.6406 11.7969H11.0527C11.4189 12.5116 11.6551 13.3033 11.7309 14.1406H16.6406C16.9642 14.1406 17.2266 14.403 17.2266 14.7266C17.2266 15.0502 16.9642 15.3125 16.6406 15.3125H11.7309C11.5557 17.2476 10.5218 18.9385 9.01398 20H18.2031C19.1724 20 19.9609 19.2114 19.9609 18.2422V5.07812H15.4688ZM16.6406 8.28125H8.04688C7.72328 8.28125 7.46094 8.01891 7.46094 7.69531C7.46094 7.37172 7.72328 7.10938 8.04688 7.10938H16.6406C16.9642 7.10938 17.2266 7.37172 17.2266 7.69531C17.2266 8.01891 16.9642 8.28125 16.6406 8.28125Z" fill="currentColor"></path>
                    <path d="M5.3125 9.45312C2.40473 9.45312 0.0390625 11.8188 0.0390625 14.7266C0.0390625 17.6343 2.40473 20 5.3125 20C8.22027 20 10.5859 17.6343 10.5859 14.7266C10.5859 11.8188 8.22027 9.45312 5.3125 9.45312ZM6.875 15.3125H5.3125C4.98891 15.3125 4.72656 15.0502 4.72656 14.7266V12.3828C4.72656 12.0592 4.98891 11.7969 5.3125 11.7969C5.63609 11.7969 5.89844 12.0592 5.89844 12.3828V14.1406H6.875C7.19859 14.1406 7.46094 14.403 7.46094 14.7266C7.46094 15.0502 7.19859 15.3125 6.875 15.3125Z" fill="currentColor"></path>
                  </g>
                </svg>
                <span className="md:!block hidden">ประวัติ</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 outline-none mt-4 w-full">
              {/* 🔴 ปรับเป็น flex-col บนมือถือ และ md:flex-row บนคอม พร้อมเพิ่ม gap เป็น 6 */}
              <form onSubmit={tab === "deposit" ? handleDeposit : handleWithdraw} className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
                
                {/* Left Panel: Payment Methods */}
                <div className="bg-[#181C31] text-card-foreground flex flex-col gap-3 rounded-xl border border-[#2B3259] shadow-sm w-full md:w-[250px] shrink-0 p-3 md:p-4">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-sm text-white">
                      {tab === "deposit" ? "เลือกวิธีการฝากเงิน" : "ช่องทางการถอนเงิน"}
                    </div>
                  </div>

                  {tab === "deposit" ? (
                    <div className="flex justify-center w-full">
                      <div className="grid grid-cols-3 md:grid-cols-2 gap-2 w-full">

                        {/* บัญชีธนาคาร */}
                        {/* 🟢 แก้ไข: ลบ aspect-square ออก แล้วใส่ h-20 md:h-24 แทน */}
                        <div onClick={() => setChannel("bank_transfer")} className={`cursor-pointer rounded-xl border w-full h-20 md:h-24 text-center p-2 flex items-center justify-center transition-all ${channel === "bank_transfer" ? "border-[#7c3aed] bg-[#7c3aed]/10" : "border-[#2B3259] hover:bg-[#2B3259]/50"}`}>
                          <div className="flex flex-col justify-center items-center gap-1.5">
                            <img className="w-7 h-7 md:w-8 md:h-8" alt="icon" src="https://fs.cdnrc.com/payment-layout/svg/bank.svg" />
                            <span className="text-[10px] md:text-xs font-medium text-white">บัญชีธนาคาร</span>
                          </div>
                        </div>

                        {/* QR Payment */}
                        <div onClick={() => setChannel("promptpay")} className={`cursor-pointer rounded-xl border relative w-full h-20 md:h-24 text-center p-2 flex items-center justify-center transition-all ${channel === "promptpay" ? "border-[#7c3aed] bg-[#7c3aed]/10" : "border-[#2B3259] hover:bg-[#2B3259]/50"}`}>
                          <div className="pointer-events-none absolute left-[-4px] top-[-4px]">
                            <img alt="fast" width="32" height="32" src="https://fs.cdnrc.com/payment-layout/svg/ribbon/super-fast.svg" />
                          </div>
                          <div className="flex flex-col justify-center items-center gap-1.5">
                            <img className="w-7 h-7 md:w-8 md:h-8" alt="icon" src="https://fs.cdnrc.com/payment-layout/svg/qr-payment.svg" />
                            <span className="text-[10px] md:text-xs font-medium text-white">QR Payment</span>
                          </div>
                        </div>

                        {/* True Wallet */}
                        <div onClick={() => setChannel("truewallet")} className={`cursor-pointer rounded-xl border w-full h-20 md:h-24 text-center p-2 flex items-center justify-center transition-all ${channel === "truewallet" ? "border-[#7c3aed] bg-[#7c3aed]/10" : "border-[#2B3259] hover:bg-[#2B3259]/50"}`}>
                          <div className="flex flex-col justify-center items-center gap-1.5">
                            <img className="w-7 h-7 md:w-8 md:h-8" alt="icon" src="https://fs.cdnrc.com/payment-layout/svg/true-wallet.svg" />
                            <span className="text-[10px] md:text-xs font-medium text-white">True Wallet</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#7c3aed] bg-[#7c3aed]/10 text-center p-6 w-full flex flex-col items-center justify-center">
                      <img className="w-10 h-10 mx-auto mb-3" alt="icon" src="https://fs.cdnrc.com/payment-layout/svg/bank.svg" />
                      <span className="text-sm font-medium text-white">ถอนเข้าบัญชีธนาคาร<br/>ที่ลงทะเบียนไว้</span>
                    </div>
                  )}
                </div>

                {/* Right Panel: Amount & Action */}
                {/* 🟢 1. ปรับ gap ให้กล่องบน-ล่างห่างกันมากขึ้น (gap-6 md:gap-8) */}
                <div className="flex flex-col w-full flex-1 gap-6 md:gap-8">
                  
                  {/* 🟢 วางโค้ดใหม่ตรงนี้ 🟢 */}
                  <div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-1 md:gap-0 mb-3 md:mb-4">
                      <label className="text-sm font-medium text-white">เลือกบัญชีโอนสมาชิก</label>
                      {tab === "deposit" && (
                        <span className="text-red-500 text-[11px] md:text-xs text-left md:text-right">
                          กรุณาใช้บัญชีที่ลงทะเบียนไว้เท่านั้น
                        </span>
                      )}
                    </div>
                    
                    <button 
                      type="button" 
                      className="flex items-center justify-between gap-2 rounded-md border border-[#2B3259] bg-[#0F111A] px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none w-full min-w-0 h-9 transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="w-full overflow-hidden text-left">
                        {userData ? (
                          <div className="flex items-center gap-4 min-w-0 w-full text-white">
                            <img 
                              alt="Bank Logo" 
                              width="28" 
                              height="28" 
                              className="shrink-0 rounded-full bg-white object-contain" 
                              src={`https://fs.cdnrc.com/payment-layout/iconbank/${userData.bank_name || 'BAY'}.png`}
                              onError={(e) => { e.currentTarget.src = "https://fs.cdnrc.com/payment-layout/svg/bank.svg"; }}
                            />
                            <span className="truncate font-medium text-[13px] md:text-base">
                              {userData.bank_account_name || "บัญชีของฉัน"} - {userData.bank_account}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 min-w-0 text-[#717690]">
                            กำลังโหลดข้อมูล...
                          </div>
                        )}
                      </span>
                      
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-50 text-white">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                    </button>
                  </div>

                  {/* ส่วนที่ 2: ระบุจำนวนเงิน และ ปุ่มกดเพิ่มเงิน */}
                  <div className="bg-[#181C31] text-card-foreground flex flex-col gap-5 rounded-2xl border border-[#2B3259] shadow-sm p-4 md:p-6 mb-8">
                    
                    <div className="flex justify-center w-full">
                      <label className="text-sm font-medium text-white text-center">
                        ระบุจำนวนเงิน{tab === "deposit" ? "ฝาก" : "ถอน"}
                      </label>
                    </div>
                    
                    {/* 1. กล่องกรอกตัวเลข (ปรับให้เล็กลง) */}
                    <div className="flex flex-col items-center justify-center rounded-xl border border-[#2B3259] py-4 relative bg-[#0F111A] h-20 md:h-22 shadow-inner">
                      <span className="absolute top-2 text-[#717690] text-[10px] md:text-xs pointer-events-none">
                        ขั้นต่ำ: 100 / สูงสุด 200,000
                      </span>
                      <div className="flex justify-center items-center w-full gap-1 mt-2">
                        <input 
                          inputMode="numeric" 
                          className="text-[#a855f7] bg-transparent text-center text-2xl md:text-3xl font-bold outline-none border-none w-full max-w-[150px] placeholder:text-[#2B3259]"
                          type="text" 
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        />
                      </div>
                    </div>

                        {/* 🟢 เปลี่ยน gap-4 เป็น gap-2 และเพิ่ม mb-24 เพื่อดันให้พ้นเมนูด้านล่างบนมือถือ */}
                    <div className="flex gap-2 w-full">
                      
                      {/* ปุ่มยกเลิก - โทนแดง Rose */}
                      <button 
                        type="button" 
                        onClick={() => setAmount("")} 
                        className="cursor-pointer inline-flex items-center justify-center rounded-xl text-xs md:text-sm font-medium transition-all border border-[#9f1239] bg-gradient-to-b from-[#e11d48] to-[#be123c] text-white hover:from-[#be123c] hover:to-[#9f1239] shadow-[0_2px_10px_rgba(225,29,72,0.15)] h-10 md:h-11 flex-1"
                      >
                        ยกเลิก
                      </button>
                      
                      {/* ปุ่มยืนยัน - โทนเขียว Emerald */}
                      <button 
                        type="submit" 
                        disabled={loading || !amount} 
                        className="cursor-pointer inline-flex items-center justify-center rounded-xl text-xs md:text-sm font-medium transition-all border border-[#047857] bg-gradient-to-b from-[#10b981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857] shadow-[0_2px_10px_rgba(16,185,129,0.15)] disabled:opacity-50 h-10 md:h-11 flex-1" 
                      >
                        {loading ? "กำลังทำรายการ..." : "ยืนยัน"}
                      </button>

                    </div>

                    {/* 3. ปุ่ม + จำนวนเงิน */}
                    <div className="grid grid-cols-5 gap-1.5 md:gap-2 mt-2">
                      {[100, 300, 500, 1000, 5000].map((val) => (
                        <button 
                          key={val} 
                          type="button" 
                          onClick={() => addAmount(val)} 
                          className="cursor-pointer inline-flex items-center justify-center gap-0.5 md:gap-1.5 rounded-lg font-medium transition-all border border-[#2B3259] bg-[#0F111A] hover:bg-[#7c3aed]/20 hover:border-[#7c3aed] text-white h-10 md:h-11 px-1 md:px-2 text-[11px] md:text-sm shadow-sm"
                        >
                          <img alt="coin" className="w-4 h-4 shrink-0 hidden md:block" src="https://fs.cdnrc.com/payment-layout/svg/coin.svg" />
                          +{val}
                        </button>
                      ))}
                    </div>

                    {/* 🟢 4. ข้อความแจ้งเตือน (วางต่อจากตรงนี้ลงมาจนจบไฟล์เลยครับ) */}
                    <div className="flex flex-col items-center gap-1 text-center mt-2 px-2">
                      {tab === "deposit" ? (
                        <>
                          <span className="text-xs md:text-sm text-red-500 font-medium">QR Code จะสามารถใชัสแกนได้เพียงครั้งเดียวเท่านั้น !</span>
                          <span className="text-xs md:text-sm text-red-500 font-medium">หลังจากฝากเงินสำเร็จรอไม่เกิน 5 นาที เงินจะเข้ากระเป๋าอัตโนมัติ</span>
                        </>
                      ) : (
                        <span className="text-[11px] md:text-xs text-[#fbbf24]">เงินจะโอนเข้าบัญชีที่ท่านลงทะเบียนไว้เท่านั้น</span>
                      )}
                    </div>

                  </div>
                </div>

              </form>
              <div className="h-6 md:h-0 w-full shrink-0 bg-transparent pointer-events-none"></div>
            </div>

          </div>
        </div>
      </div>

      {/* 🎲 อย่าลืมวางแท็ก style ลูกเต๋าไว้ก่อนปิด div หลักตัวสุดท้ายสุดของหน้านี้ */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.05; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.06; }
          85% { opacity: 0.03; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }
        div[style*="floatDice"] {
          opacity: 0.15 !important;
          filter: grayscale(1) brightness(1.2) !important;
        }
      `}} />
    </div>
  );
}