"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [balance, setBalance] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);

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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <a href="/lobby" style={{ textDecoration: "none" }}>
    <img src="/logo.png" alt="Logo" style={{ height: "48px", width: "auto" }} />
  </a>
  {isLoggedIn && (
    <button className="desktop-hamburger" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ width: "22px", height: "2.5px", background: "#fff", borderRadius: "2px", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translateY(6.5px)" : "none" }} />
      <span style={{ width: "22px", height: "2.5px", background: "#fff", borderRadius: "2px", transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
      <span style={{ width: "22px", height: "2.5px", background: "#fff", borderRadius: "2px", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translateY(-6.5px)" : "none" }} />
    </button>
  )}
</div>

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

              <LanguageSwitcher />
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
            <img src="/logo.png" alt="Odin996" className="-center-icon" onError={(e) => e.currentTarget.style.display='none'} />
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

      {/* 🆕 Desktop Drawer */}
      {menuOpen && (
        <div className="desktop-drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="desktop-drawer" onClick={(e) => e.stopPropagation()}>

            {/* User Info */}
            <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.15))" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #9333ea, #c084fc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {(username || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{username}</div>
                  <div style={{ fontSize: "0.75rem", color: "#a78bfa" }}>สมาชิก</div>
                </div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "10px 14px" }}>
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginBottom: "2px" }}>ยอดเงินคงเหลือ</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#f59e0b" }}>
                  ฿{balance !== null ? fmt(balance) : "0.00"}
                </div>
              </div>
            </div>

            {/* ปุ่มฝาก/ถอน */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <Link href="/wallet?tab=deposit" onClick={() => setMenuOpen(false)} style={{ padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, #22c55e, #15803d)", color: "#fff", fontSize: "0.85rem", fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-1.png" style={{ width: "18px", height: "18px" }} alt="" /> ฝากเงิน
              </Link>
              <Link href="/wallet?tab=withdraw" onClick={() => setMenuOpen(false)} style={{ padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg, #ef4444, #b91c1c)", color: "#fff", fontSize: "0.85rem", fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-2.png" style={{ width: "18px", height: "18px" }} alt="" /> ถอนเงิน
              </Link>
            </div>

            {/* Menu Items */}
            <div style={{ padding: "8px 0" }}>
              {[
                { label: "หน้าแรก", href: "/lobby", img: "/nav/home.png" },
                { label: "โปรโมชั่น", href: "/promotions", img: "/nav/promo.png" },
                { label: "ฝาก-ถอน", href: "/wallet", img: "/nav/wallet.png" },
                { label: "ประวัติ", href: "/history", img: "/nav/history.png" },
                { label: "โปรไฟล์", href: "/profile", img: "/nav/profile.png" },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 20px", textDecoration: "none",
                  color: pathname === item.href ? "#c084fc" : "#d1d5db",
                  background: pathname === item.href ? "rgba(124,58,237,0.15)" : "transparent",
                  fontSize: "0.9rem", fontWeight: 600, transition: "background 0.2s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = pathname === item.href ? "rgba(124,58,237,0.15)" : "transparent"}
                >
                  <img src={item.img} alt={item.label} style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "8px 0" }}>
              <div onClick={() => { handleLogout(); setMenuOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 20px", cursor: "pointer",
                color: "#f87171", fontSize: "0.9rem", fontWeight: 600, transition: "background 0.2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span>ออกจากระบบ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Desktop Drawer CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .desktop-hamburger { display: none; }
        @media (min-width: 1024px) {
          .desktop-hamburger { display: flex !important; }
        }
        .desktop-drawer-overlay {
          display: none;
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px);
        }
        @media (min-width: 1024px) {
          .desktop-drawer-overlay { display: block; }
        }
        .desktop-drawer {
          position: fixed; top: 0; left: 0;
          width: 300px; height: 100vh;
          background: linear-gradient(180deg, #1a1a2e 0%, #14142a 100%);
          border-right: 1px solid rgba(124,58,237,0.3);
          box-shadow: 4px 0 20px rgba(0,0,0,0.5);
          overflow-y: auto;
          animation: slideIn 0.25s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}} />

    </>
  );
}