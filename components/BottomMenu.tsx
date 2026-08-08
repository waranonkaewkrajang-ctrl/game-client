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
            <img src="/logo.png" alt="Logo" className="-center-icon" onError={(e) => e.currentTarget.style.display='none'} />
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
          position: fixed; bottom: 0; left: 0; width: 100%; height: 75px; 
          z-index: 1000; filter: drop-shadow(0 -4px 10px rgba(0,0,0,0.5)); 
        }
        .-bg-bar {
          position: absolute; bottom: 0; left: 0; width: 100%; height: 65px;
          background: linear-gradient(to bottom, #aa00a0, #2b002b);
          border-top-left-radius: 16px; border-top-right-radius: 16px;
          mask-image: radial-gradient(circle 42px at 50% 0%, transparent 42px, black 43px);
          -webkit-mask-image: radial-gradient(circle 42px at 50% 0%, transparent 42px, black 43px);
        }
        .-left-wrapper, .-right-wrapper {
          position: absolute; bottom: 0; width: 42%; height: 65px; display: flex;
          justify-content: space-evenly; align-items: center; z-index: 10;
        }
        .-left-wrapper { left: 0; }
        .-right-wrapper { right: 0; }
        .-item-wrapper { 
          display: flex; flex-direction: column; align-items: center; 
          text-decoration: none; gap: 4px; cursor: pointer; transition: transform 0.2s ease; 
        }
        .-item-wrapper:hover { transform: translateY(-3px); }
        .-ic-img { width: 30px; height: 30px; object-fit: contain; }
        .-item-wrapper .-text { 
          color: #ffffff; font-size: 0.75rem; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); 
        }
        .-center-wrapper { 
          position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); 
          z-index: 20; display: flex; justify-content: center; align-items: center; text-decoration: none; 
        }
        .-selected {
          position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 76px; height: 76px; 
          background: radial-gradient(circle at 50% 20%, #ffdf00, #ff8c00 50%, #cc3300); 
          border-radius: 50%;
          box-shadow: 0 5px 10px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.7);
          border: 2px solid #ffb300;
        }
        .-center-icon { width: 42px; height: 42px; object-fit: contain; margin-bottom: -2px; }
        .-selected .-text { color: #ffffff; font-size: 0.75rem; font-weight: 800; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }
        @media (min-width: 1024px) {
          .-outer-wrapper { display: none !important; }
        }
      `}} />
    </>
  );
}