"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Rank, Rewards, User, Wallet } from "./types";
import { confirmLogout, toast } from "./lib";
import HeroBanner from "./components/HeroBanner";
import QuickActionGrid from "./components/QuickActionGrid";
import CreditCard from "./components/CreditCard";
import RankCard from "./components/RankCard";
import ReferCard from "./components/ReferCard";
import SettingsCard from "./components/SettingsCard";
import BankSection from "./components/BankSection";
import PersonalInfo from "./components/PersonalInfo";
import SystemCard from "./components/SystemCard";
import ProfileSkeleton from "./components/ProfileSkeleton";
import { CARD, FOCUS, GOLD_BTN, PRESS } from "./components/ui";
import "./styles/tokens.css";
import { JetBrains_Mono } from "next/font/google";

// bank account number only (exposed as --font-jetbrains → --font-mono in tokens.css)
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], display: "swap", variable: "--font-jetbrains" });

// the modal (and its bank list) only loads when the user opens it
const BankChangeModal = dynamic(() => import("./components/BankChangeModal"), { ssr: false });

/** Mobile 480 → tablet 640 → desktop 1380 (1348px content, as measured on the 1440 reference); 16px gutters. */
const SHELL =
  "mx-auto flex w-full max-w-[480px] flex-col gap-4 sm:max-w-[640px] lg:max-w-[1380px] lg:gap-5 " +
  "pl-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] " +
  "pt-[calc(16px+env(safe-area-inset-top))] pb-[calc(104px+env(safe-area-inset-bottom))] lg:pb-16";

export default function ProfileClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [rank, setRank] = useState<Rank | null>(null);
  const [userFailed, setUserFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  // children of I18nProvider only render on the client, so localStorage is available here
  const [acceptPromo, setAcceptPromo] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("accept_promo");
    return saved === null ? true : saved === "1";
  });

  // same 4 GET endpoints as before — in parallel; each one still fails independently
  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    let alive = true;
    Promise.allSettled([
      api.get("/auth/me"),
      api.get("/wallet/balance"),
      api.get("/rewards/summary"),
      api.get("/user/rank"),
    ]).then(([me, bal, rew, rk]) => {
      if (!alive) return;
      if (me.status === "fulfilled") setUser(me.value.data.data);
      else setUserFailed(true);
      if (bal.status === "fulfilled") setWallet(bal.value.data.data);
      if (rew.status === "fulfilled") setRewards(rew.value.data.data);
      if (rk.status === "fulfilled") setRank(rk.value.data.data);
    });
    return () => { alive = false; };
  }, [router, reloadKey]);

  const refreshWallet = () => {
    setRefreshing(true);
    api.get("/wallet/balance").then((res) => setWallet(res.data.data)).catch(() => {}).finally(() => setRefreshing(false));
  };

  const togglePromo = (newVal: boolean) => {
    setAcceptPromo(newVal);
    localStorage.setItem("accept_promo", newVal ? "1" : "0");
    toast(newVal ? "เปิดรับโปรโมชันแล้ว" : "ปิดรับโปรโมชันแล้ว", newVal ? "success" : "info");
  };

  const closeBankModal = useCallback(() => setShowBankModal(false), []);

  if (!user) {
    if (!userFailed) return <ProfileSkeleton />;
    return (
      <div className={`profile-scope min-h-dvh`}>
        <div className={SHELL}>
          <div className={`${CARD} p-6 text-center`} role="alert">
            <p className="text-lg font-semibold">โหลดข้อมูลโปรไฟล์ไม่สำเร็จ</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองอีกครั้ง</p>
            <button
              type="button"
              onClick={() => { setUserFailed(false); setReloadKey((k) => k + 1); }}
              className={`${GOLD_BTN} ${PRESS} ${FOCUS} mt-5`}
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-scope ${mono.variable} min-h-dvh overflow-x-clip`}>
      <div className={SHELL}>
        {/* hero + shortcuts share one panel, as in the reference; on mobile the panel reaches 4px from the edge
            while the cards below keep the 16px gutter (reference: panel 382px, cards 358px at 390) */}
        <div className={`${CARD} -mx-3 flex flex-col gap-4 p-3 sm:mx-0 sm:p-4 lg:gap-6`}>
          <HeroBanner user={user} rank={rank} onLogout={confirmLogout} />
          <QuickActionGrid />
        </div>

        {/* 753 : 554 on desktop (reference), full width each below that */}
        <div className="grid gap-4 lg:grid-cols-[753fr_554fr] lg:gap-6">
          <CreditCard wallet={wallet} rewards={rewards} acceptPromo={acceptPromo} refreshing={refreshing} onRefresh={refreshWallet} />
          <RankCard rank={rank} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <ReferCard user={user} rewards={rewards} className="lg:col-span-2" />
          <SettingsCard acceptPromo={acceptPromo} onTogglePromo={togglePromo} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <BankSection user={user} onChangeBank={() => setShowBankModal(true)} />
          <PersonalInfo user={user} />
          <SystemCard user={user} onLogout={confirmLogout} />
        </div>
      </div>

      {showBankModal && (
        <BankChangeModal initialBankCode={user.bank_code || "KBANK"} initialName={user.full_name || ""} onClose={closeBankModal} />
      )}
    </div>
  );
}
