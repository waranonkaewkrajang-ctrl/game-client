"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { avatarSrc, loadAvatar, subscribeAvatar } from "@/app/profile/avatars";
import { getAvatarPath } from "@/app/profile/utils/avatar";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [balance, setBalance] = useState<number | null>(null);
  // Navbar only renders client-side (I18nProvider mounts children after hydration),
  // so reading localStorage in the initializer is safe and runs once on mount — same as before.
  const [session] = useState(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("user_token");
    const userData = localStorage.getItem("user_data");
    return token && userData ? { username: JSON.parse(userData).username as string } : null;
  });
  const [username] = useState(session?.username ?? "");
  const [isLoggedIn, setIsLoggedIn] = useState(!!session);
  const [menuOpen, setMenuOpen] = useState(false);
  // display only: the avatar picked on /profile (same localStorage key + fallback as the Profile hero)
  const savedAvatar = useSyncExternalStore(subscribeAvatar, () => (username ? loadAvatar(username) : null), () => null);
  const avatarUrl = savedAvatar ? avatarSrc(savedAvatar) : getAvatarPath(username || "guest");

  useEffect(() => {
    if (session) {
      const fetchBalance = () => {
        api.get("/wallet/balance").then((res) => setBalance(res.data.data.balance)).catch(() => {});
      };

      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // close drawer with Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const handleLogout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_data");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
  // display guard: never crash the header if the balance payload is missing/non-numeric
  const hasBalance = typeof balance === "number" && Number.isFinite(balance);
  // no notification source exists yet → never show the unread dot
  const hasUnread = false;

  const navLinks = [
    { href: "/lobby", label: t("nav.enterGame") },
    { href: "/promotions", label: t("nav.promotion") },
    { href: "/wallet", label: t("nav.walletMenu") },
    { href: "/history", label: t("nav.history") },
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const drawerItems: { label: string; href: string; icon: React.ReactNode; external?: boolean }[] = [
    { label: t("nav.enterGame"), href: "/lobby", icon: <img src="/icons/game.webp" className={styles.drawerIcon} alt="" /> },
    { label: t("nav.promotion"), href: "/promotions", icon: <img src="/icons/menu/footer-menu-ic-left-2.webp" className={styles.drawerIcon} alt="" /> },
    { label: t("nav.walletMenu"), href: "/wallet", icon: <img src="/icons/menu/footer-menu-ic-right-1.webp" className={styles.drawerIcon} alt="" /> },
    { label: t("nav.contact"), href: "https://lin.ee/rjOBayDx", icon: <img src="/icons/contact.webp" className={styles.drawerIcon} alt="" />, external: true },
    { label: t("nav.profile"), href: "/profile", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.left}>
            {isLoggedIn && (
              <button
                type="button"
                className={styles.menuBtn}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
                aria-expanded={menuOpen}
                aria-controls="user-drawer"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
              </button>
            )}
            <Link href="/lobby" className={styles.logoLink} aria-label="SNAKE168">
              <img src="/logo.png" alt="SNAKE168" className={styles.logo} width={96} height={48} />
            </Link>
          </div>

          {isLoggedIn && (
            <nav className={styles.nav} aria-label="Main">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className={`${styles.navLink} ${isActive(l.href) ? styles.navLinkActive : ""}`} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              ))}
            </nav>
          )}

          <div className={styles.right}>
            {isLoggedIn && (
              <>
                <Link href="/wallet" className={styles.balance} aria-label={`${t("wallet.balance")} ${hasBalance ? fmt(balance as number) : ""}`}>
                  <img alt="" src="/icons/coin.svg" className={styles.coin} width={18} height={18} />
                  <span className={styles.balanceValue}>{hasBalance ? fmt(balance as number) : "…"}</span>
                  <span className={styles.topup}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    <span className={styles.topupText}>{t("nav.topup")}</span>
                  </span>
                </Link>

                {/* Notification bell (mobile + desktop). There is no notification API yet, so there's nothing to open
                    and no unread count: the dot stays hidden. TODO: hook up hasUnread + onClick once the backend has notifications. */}
                <button type="button" className={styles.bell} aria-label={hasUnread ? "แจ้งเตือน (มีรายการใหม่)" : "แจ้งเตือน"} title="แจ้งเตือน (เร็วๆ นี้)">
                  {/* gold bell artwork: transparent cut-out of public/icons/notification-bell.webp (169×192, lossless) */}
                  <img src="/icons/notification-bell-cut.webp" alt="" width={26} height={26} className={styles.bellImg} draggable={false} decoding="async" />
                  {hasUnread && <span className={styles.bellDot} aria-hidden="true" />}
                </button>

                {/* wrapper only lets the mobile CSS resize the flag; display: contents keeps the layout unchanged */}
                <span className={styles.lang}>
                  <LanguageSwitcher />
                </span>

                <button type="button" className={styles.avatarBtn} onClick={() => setMenuOpen(true)} aria-label={username || "Account"} aria-controls="user-drawer">
                  <span className={styles.avatar}>
                    <Image src={avatarUrl} alt="" width={34} height={34} unoptimized className={styles.avatarImg} />
                  </span>
                  <span className={styles.avatarName}>{username}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Desktop drawer (≥1024px) */}
      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)}>
          <div id="user-drawer" className={styles.drawer} role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div className={styles.drawerUser}>
                <span className={`${styles.avatar} ${styles.avatarLg}`}>
                  <Image src={avatarUrl} alt="" width={46} height={46} unoptimized className={styles.avatarImg} />
                </span>
                <div>
                  <div className={styles.drawerName}>{username}</div>
                  <div className={styles.drawerRole}>สมาชิก</div>
                </div>
                <button type="button" className={styles.drawerClose} onClick={() => setMenuOpen(false)} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className={styles.drawerBalance}>
                <div className={styles.drawerBalanceLabel}>{t("wallet.balance")}</div>
                <div className={styles.drawerBalanceValue}>฿{hasBalance ? fmt(balance as number) : "0.00"}</div>
              </div>
            </div>

            <div className={styles.drawerActions}>
              <Link href="/wallet?tab=deposit" onClick={() => setMenuOpen(false)} className={`${styles.drawerAction} ${styles.drawerDeposit}`}>
                <img src="/icons/menu/footer-menu-ic-right-1.webp" alt="" width={18} height={18} /> {t("nav.deposit")}
              </Link>
              <Link href="/wallet?tab=withdraw" onClick={() => setMenuOpen(false)} className={`${styles.drawerAction} ${styles.drawerWithdraw}`}>
                <img src="/icons/menu/footer-menu-ic-right-2.webp" alt="" width={18} height={18} /> {t("nav.withdraw")}
              </Link>
            </div>

            <nav className={styles.drawerNav}>
              {drawerItems.map((item) => item.external ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className={styles.drawerLink}>
                  {item.icon}<span>{item.label}</span>
                </a>
              ) : (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`${styles.drawerLink} ${pathname === item.href ? styles.drawerLinkActive : ""}`}>
                  {item.icon}<span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className={styles.drawerFoot}>
              <button type="button" onClick={() => { handleLogout(); setMenuOpen(false); }} className={styles.logout}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                <span>{t("nav.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
