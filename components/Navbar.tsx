"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    const userData = localStorage.getItem("user_data");
    if (token && userData) {
      setIsLoggedIn(true);
      setUsername(JSON.parse(userData).username);
      
      const fetchBalance = () => {
        api.get("/wallet/balance").then((res) => setBalance(res.data.data.balance)).catch(() => {});
      };

      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

  const navItems = [
    { label: "หน้าแรก", href: "/lobby", img: "/nav/home.png" },
    { label: "โปรโมชัน", href: "/promotions", img: "/nav/promo.png" },
    { label: "ฝาก-ถอน", href: "/wallet", img: "/nav/wallet.png" },
    { label: "ประวัติ", href: "/history", img: "/nav/history.png" },
    { label: "โปรไฟล์", href: "/profile", img: "/nav/profile.png" },
  ];

  return (
    <>
      <header style={{ background: "linear-gradient(to bottom, #aa00a0, #2b002b)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 150, backdropFilter: "blur(10px)" }}>
        <a href="/lobby" style={{ textDecoration: "none" }}>
          <img src="/logo.png" alt="Logo" style={{ height: "48px", width: "auto" }} />
        </a>

        {/* Right Side */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          
          {/* 🟢 เปลี่ยนตรงนี้เป็น && และลบปุ่มสมัคร/ล็อกอินด้านล่างทิ้งไปเลย */}
          {isLoggedIn && (
            <>
              {/* 🟢 ปุ่มจำนวนเงิน (ปรับขนาดให้เล็กลง) */}
              <a href="/wallet" style={{ textDecoration: "none", background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(220,38,38,0.1))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", padding: "4px 10px", display: "flex", alignItems: "center", gap: "5px" }}>
                
                {/* ลดขนาดเหรียญลงเหลือ 14px */}
                <img alt="coin" className="shrink-0" src="https://fs.cdnrc.com/payment-layout/svg/coin.svg" style={{ width: "14px", height: "14px" }} />
                
                {/* ลดขนาดฟอนต์ตัวเลขลงเหลือ 0.8rem */}
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#f59e0b", marginTop: "1px" }}>{balance !== null ? fmt(balance) : "..."}</span>
                
                {/* ลดขนาดปุ่มคำว่า "เติม" */}
                <span style={{ background: "#dc2626", color: "white", fontSize: "0.55rem", fontWeight: 700, padding: "2px 6px", borderRadius: "4px" }}>เติม</span>
              </a>

              <button onClick={handleLogout} style={{
                width: "36px", height: "36px", borderRadius: "50%", border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #8b1a1a, #6b1010)",
                boxShadow: "0 2px 8px rgba(139,26,26,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "0.7rem", fontWeight: 800,
                transition: "all 0.2s",
              }} title="ออกจากระบบ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}

        </div>
      </header>

      {/* 🟢 ริชเมนูด้านล่าง (Bottom Menu) แบบใหม่ (โชว์เฉพาะมือถือ) 🟢 */}
      <div className="-outer-wrapper mobile-only">
        {/* พื้นหลังสีม่วงที่มีรอยแหว่งเว้าตรงกลาง */}
        <div className="-bg-bar"></div>

        <div className="-left-wrapper">
          <a href="https://line.me/R/ti/p/@ODIN996" className="-item-wrapper -line" target="_blank" rel="noopener noreferrer nofollow">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-left-1.png" className="-ic-img" alt="Line" />
            <span className="-text">Line</span>
          </a>
          <Link href="/promotions" className="-item-wrapper -promotion">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-left-2.png" className="-ic-img" alt="โปรโมชั่น" />
            <span className="-text">โปรโมชัน</span>
          </Link>
        </div>

        <Link href="/lobby" className="-center-wrapper" aria-label="หน้าแรก">
          <div className="-selected">
            {/* โลโก้ตรงกลางปุ่ม */}
            <img src="https://odin996.com/theme_1/img/logo.png" alt="Odin996" className="-center-icon" onError={(e) => e.currentTarget.style.display='none'} />
            <span className="-text">หน้าแรก</span>
          </div>
        </Link>

        <div className="-right-wrapper">
          <Link href="/wallet" className="-item-wrapper -deposit">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-1.png" className="-ic-img" alt="ฝากเงิน" />
            <span className="-text">ฝากเงิน</span>
          </Link>
          <Link href="/wallet" className="-item-wrapper -withdraw">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-2.png" className="-ic-img" alt="ถอนเงิน" />
            <span className="-text">ถอนเงิน</span>
          </Link>
        </div>
      </div>
    </>
  );
}