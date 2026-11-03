"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { Rank, Rewards, User, Wallet } from "./types";
import { confirmLogout, toast } from "./lib";
import HeroBanner from "./components/HeroBanner";
import QuickActionGrid from "./components/QuickActionGrid";
import WalletCard from "./components/WalletCard";
import RewardsRow from "./components/RewardsRow";
import RankProgress from "./components/RankProgress";
import BankSection from "./components/BankSection";
import PersonalInfo from "./components/PersonalInfo";
import SettingsCard from "./components/SettingsCard";
import SystemCard from "./components/SystemCard";
import ProfileSkeleton from "./components/ProfileSkeleton";
import { FOCUS, GLASS, PRESS } from "./components/ui";
import styles from "./profile.module.css";

// the modal (and its bank list) only loads when the user opens it
const BankChangeModal = dynamic(() => import("./components/BankChangeModal"), { ssr: false });

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

  // same 4 GET endpoints as before — now in parallel; each one still fails independently
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
      <div className="mx-auto max-w-[480px] px-4 pt-10">
        <div className={`${GLASS} p-6 text-center`} role="alert">
          <p className="text-lg font-semibold text-white">โหลดข้อมูลโปรไฟล์ไม่สำเร็จ</p>
          <p className="mt-1 text-sm text-fuchsia-100/70">ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต แล้วลองอีกครั้ง</p>
          <button
            type="button"
            onClick={() => { setUserFailed(false); setReloadKey((k) => k + 1); }}
            className={`mt-5 min-h-[48px] rounded-2xl bg-linear-to-b from-yellow-200 to-[#eab308] px-6 font-semibold text-yellow-950 ${PRESS} ${FOCUS}`}
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-clip text-white">
      <div className={styles.blob} aria-hidden="true" />

      <div
        className={
          "relative z-10 mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 min-[769px]:max-w-[520px] " +
          "pt-[calc(16px+env(safe-area-inset-top))] pb-[calc(104px+env(safe-area-inset-bottom))] lg:pb-16"
        }
      >
        <div className="flex flex-col gap-4">
          <HeroBanner user={user} rank={rank} onLogout={confirmLogout} />
          <QuickActionGrid />
        </div>
        <WalletCard username={user.username} wallet={wallet} acceptPromo={acceptPromo} refreshing={refreshing} onRefresh={refreshWallet} />
        <RewardsRow rewards={rewards} />
        <RankProgress rank={rank} />
        <BankSection user={user} onChangeBank={() => setShowBankModal(true)} />
        <PersonalInfo user={user} />
        <SettingsCard acceptPromo={acceptPromo} onTogglePromo={togglePromo} />
        <SystemCard user={user} onLogout={confirmLogout} />
      </div>

      {showBankModal && (
        <BankChangeModal initialBankCode={user.bank_code || "KBANK"} initialName={user.full_name || ""} onClose={closeBankModal} />
      )}
    </div>
  );
}
