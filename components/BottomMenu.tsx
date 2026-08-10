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
          <Link href="/lobby" className="-item-wrapper -promotion">
            <img src="/icons/game.webp" className="-ic-img" alt="เข้าเกม" />
            <span className="-text">เข้าเกม</span>
          </Link>
          <Link href="/promotions" className="-item-wrapper -promotion">
            <img src="https://odin996.com/theme_1/img/footer-menu-ic-left-2.png" className="-ic-img" alt="โปรโมชัน" />
            <span className="-text">โปรโมชัน</span>
          </Link>
        </div>
        <Link href="/wallet" className="-center-wrapper" aria-label="กระเป๋าเงิน">
  <div className="-selected">
    <svg className="-center-icon" width="28" height="28" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1105_3744)">
        <path d="M22.7753 17.2784C22.8827 17.0564 22.8965 16.8014 22.8136 16.5694C22.7308 16.3374 22.5582 16.1474 22.3336 16.0412C22.1091 15.9351 21.8511 15.9215 21.6164 16.0033C21.3817 16.0852 21.1896 16.2559 21.0822 16.4779C20.2547 18.1882 18.9327 19.6176 17.2835 20.5852C15.6342 21.5529 13.7317 22.0153 11.8166 21.914C9.9015 21.8128 8.05977 21.1524 6.52431 20.0164C4.98885 18.8804 3.82862 17.3198 3.19036 15.532C2.5521 13.7442 2.46446 11.8094 2.93852 9.97227C3.41259 8.13519 4.42707 6.47833 5.85368 5.21122C7.28028 3.9441 9.05494 3.12364 10.9532 2.85359C12.8515 2.58354 14.7882 2.87603 16.5183 3.69407C18.0577 4.4273 19.3704 5.55453 20.3202 6.95871L18.9554 6.68361C18.7517 6.64199 18.5399 6.66844 18.353 6.7588C18.1662 6.84916 18.0151 6.9983 17.9233 7.18281L17.8208 7.39482C17.7839 7.63668 17.8451 7.88314 17.9912 8.08058C18.1372 8.27802 18.3562 8.41045 18.6006 8.44906L22.0501 9.20257C22.2936 9.24983 22.5461 9.19986 22.7523 9.06358C22.9586 8.9273 23.1019 8.7158 23.1509 8.47535L23.868 5.04389C23.9158 4.80321 23.8652 4.55361 23.7274 4.34968C23.5895 4.14575 23.3756 4.00409 23.1323 3.95569C22.8883 3.90836 22.6352 3.95742 22.4273 4.09236C22.2195 4.22731 22.0733 4.43738 22.0203 4.67757L21.7665 5.83271C20.6476 4.20199 19.1178 2.88795 17.3281 2.02031C15.2631 1.04395 12.9516 0.694848 10.6859 1.01717C8.4202 1.33948 6.30206 2.31874 4.59934 3.8311C2.89661 5.34347 1.68578 7.32101 1.11996 9.51366C0.554139 11.7063 0.658743 14.0156 1.42054 16.1495C2.18234 18.2833 3.56712 20.146 5.39977 21.5019C7.23241 22.8577 9.43061 23.6459 11.7164 23.7667C14.0022 23.8876 16.2729 23.3356 18.2413 22.1807C20.2098 21.0258 21.7876 19.3198 22.7753 17.2784Z" fill="#111111"></path>
        <path d="M16.4785 14.8533C16.4792 14.1784 16.2606 13.5198 15.8525 12.9677C15.4444 12.4156 14.8668 11.997 14.1989 11.7693L11.6644 10.9478C11.4145 10.8504 11.1991 10.6871 11.0436 10.4771C10.888 10.2672 10.7989 10.0192 10.7866 9.76263C10.7903 9.43279 10.9307 9.11767 11.1772 8.88569C11.4238 8.65371 11.7566 8.5236 12.1034 8.52362H12.6697C13.443 8.52304 14.2019 8.72327 14.8643 9.10272C15.1066 9.24202 15.397 9.2841 15.6718 9.2197C15.9467 9.15529 16.1833 8.98968 16.3298 8.7593C16.4762 8.52892 16.5205 8.25264 16.4528 7.99124C16.3851 7.72983 16.2109 7.50472 15.9687 7.36542C15.2497 6.96272 14.457 6.69312 13.6325 6.57084V5.56078C13.6325 5.2929 13.5206 5.03598 13.3215 4.84656C13.1223 4.65714 12.8522 4.55072 12.5706 4.55072C12.289 4.55072 12.0189 4.65714 11.8197 4.84656C11.6206 5.03598 11.5087 5.2929 11.5087 5.56078V6.53044C10.7592 6.6503 10.0729 7.00378 9.55771 7.53526C9.04253 8.06674 8.72775 8.74605 8.66289 9.46631C8.59803 10.1866 8.78677 10.9069 9.19942 11.514C9.61207 12.121 10.2252 12.5804 10.9423 12.8197L13.4768 13.6682C13.7267 13.7655 13.9421 13.9288 14.0977 14.1388C14.2532 14.3488 14.3424 14.5967 14.3546 14.8533C14.3509 15.1832 14.2105 15.4983 13.964 15.7303C13.7174 15.9623 13.3846 16.0924 13.0379 16.0923H12.4715C11.6982 16.0929 10.9394 15.8927 10.2769 15.5132C10.0347 15.3739 9.7442 15.3319 9.46937 15.3963C9.19455 15.4607 8.95788 15.6263 8.81143 15.8567C8.66498 16.087 8.62074 16.3633 8.68845 16.6247C8.75616 16.8861 8.93027 17.1112 9.17248 17.2505C9.89153 17.6532 10.6842 17.9228 11.5087 18.0451V19.0282C11.5087 19.2961 11.6206 19.553 11.8197 19.7425C12.0189 19.9319 12.289 20.0383 12.5706 20.0383C12.8522 20.0383 13.1223 19.9319 13.3215 19.7425C13.5206 19.553 13.6325 19.2961 13.6325 19.0282V18.0586C14.4265 17.9261 15.1464 17.5326 15.6665 16.9468C16.1866 16.361 16.474 15.6201 16.4785 14.8533Z" fill="#111111"></path>
      </g>
      <defs>
        <clipPath id="clip0_1105_3744">
          <rect width="24" height="24" fill="white" transform="translate(0.5)"></rect>
        </clipPath>
      </defs>
    </svg>
  </div>
  <span className="-center-text">กระเป๋าเงิน</span>
</Link>
        <div className="-right-wrapper">
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
          mask-image: radial-gradient(circle 35px at 50% 0%, transparent 35px, black 36px);
          -webkit-mask-image: radial-gradient(circle 35px at 50% 0%, transparent 35px, black 36px);
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
          position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); 
          z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; text-decoration: none; 
        }
        .-selected {
          position: relative; display: flex; align-items: center; justify-content: center;
          width: 54px; height: 54px; 
          background: radial-gradient(circle at 50% 20%, #ffdf00, #ff8c00 50%, #cc3300); 
          border-radius: 50%;
          box-shadow: 0 4px 8px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.7);
          border: 2px solid #ffb300;
          transform: translateY(-4px); 
        }
        .-center-icon { width: 28px; height: 28px; object-fit: contain; }
        .-center-text { 
          color: #ffffff; font-size: 0.75rem; font-weight: 800; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); margin-top: 2px;
        }
        @media (min-width: 1024px) {
          .-outer-wrapper { display: none !important; }
        }
      `}} />
    </>
  );
}