"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomMenu() {
  const pathname = usePathname();
  if (["/login", "/register"].includes(pathname)) return null;

  return (
    <>
      <div className="-outer-wrapper mobile-only">
        <div className="-bg-bar"></div>
        <div className="-left-wrapper">
          <Link href="/promotions" className="-item-wrapper -promotion">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-left-2.png" className="-ic-img" alt="โปรโมชัน" />
            <span className="-text">โปรโมชัน</span>
          </Link>
          <Link href="/wallet" className="-item-wrapper -deposit">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-1.png" className="-ic-img" alt="ฝากเงิน" />
            <span className="-text">ฝากเงิน</span>
          </Link>
        </div>
        <Link href="/" className="-center-wrapper" aria-label="หน้าแรก">
          <div className="-selected">
            <img src="https://odin996.com/theme_1/img/logo.png" alt="Logo" className="-center-icon" onError={(e) => e.currentTarget.style.display='none'} />
            <span className="-text">หน้าแรก</span>
          </div>
        </Link>
        <div className="-right-wrapper">
          <Link href="/wallet" className="-item-wrapper -withdraw">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-2.png" className="-ic-img" alt="ถอนเงิน" />
            <span className="-text">ถอนเงิน</span>
          </Link>
          <Link href="/profile" className="-item-wrapper -line">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: "#a78bfa"}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="-text">โปรไฟล์</span>
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .-outer-wrapper { 
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
          height: 75px; display: flex; align-items: flex-end; justify-content: center;
        }
        .-bg-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
          background: linear-gradient(180deg, #2a0a3a 0%, #1a0525 100%);
          border-top: 2px solid rgba(170, 0, 160, 0.4);
          border-radius: 18px 18px 0 0;
        }
        .-left-wrapper, .-right-wrapper {
          position: absolute; bottom: 0; display: flex; align-items: center; height: 60px; gap: 0;
        }
        .-left-wrapper { left: 0; }
        .-right-wrapper { right: 0; }
        .-item-wrapper {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 70px; height: 60px; text-decoration: none; position: relative; z-index: 2;
        }
        .-ic-img { width: 26px; height: 26px; margin-bottom: 2px; }
        .-item-wrapper .-text { font-size: 10px; color: #e0c0ff; font-weight: 600; }
        .-center-wrapper {
          position: relative; z-index: 3; display: flex; flex-direction: column;
          align-items: center; margin-bottom: 18px; text-decoration: none;
        }
        .-center-wrapper .-selected {
          width: 65px; height: 65px; border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          box-shadow: 0 0 15px rgba(245,158,11,0.5), 0 4px 10px rgba(0,0,0,0.4);
          border: 3px solid #1a0525;
        }
        .-center-icon { width: 30px; height: 30px; border-radius: 50%; object-fit: contain; }
        .-center-wrapper .-text { font-size: 10px; color: #f59e0b; font-weight: 700; margin-top: 2px; }
        @media (min-width: 769px) {
          .-outer-wrapper { display: none !important; }
        }
      `}} />
    </>
  );
}