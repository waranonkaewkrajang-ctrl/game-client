"use client";
import { useEffect, useRef, useState } from "react";
import type { Wallet } from "../types";
import { baht, num, prefersReducedMotion } from "../lib";
import { FOCUS, Icon, PRESS, Svg } from "./ui";
import styles from "../profile.module.css";

/** Animates from the previously shown value to `target` (skipped for reduced motion). */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = from.current;
    let raf = 0;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = prefersReducedMotion() ? 1 : Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = start + (target - start) * eased;
      setValue(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

interface Props {
  username: string;
  wallet: Wallet | null;
  acceptPromo: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function WalletCard({ username, wallet, acceptPromo, refreshing, onRefresh }: Props) {
  const balance = useCountUp(num(wallet?.balance));

  return (
    <section aria-label="กระเป๋าเงิน" className={styles.tilt}>
      <div
        className={
          "relative aspect-[1.75/1] min-h-[190px] overflow-hidden rounded-3xl border border-pink-300/25 p-5 " +
          "bg-[radial-gradient(120%_90%_at_0%_0%,rgba(236,72,153,0.35),transparent_60%),linear-gradient(135deg,#4c1d95_0%,#86198f_55%,#9d174d_100%)] " +
          "shadow-[0_18px_30px_-8px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-6px_12px_rgba(0,0,0,0.35)]"
        }
      >
        <span className={styles.sheen} aria-hidden="true" />
        {/* fine guilloche lines — card material */}
        <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.12]" aria-hidden="true">
          <defs>
            <pattern id="wallet-lines" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <path d="M0 7h14" stroke="#fff" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wallet-lines)" />
        </svg>

        <div className="relative flex h-full flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-3">
            {/* EMV-style chip */}
            <svg width="40" height="30" viewBox="0 0 40 30" aria-hidden="true" className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              <defs>
                <linearGradient id="chip" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fde68a" /><stop offset="0.5" stopColor="#eab308" /><stop offset="1" stopColor="#a16207" />
                </linearGradient>
              </defs>
              <rect x="0.5" y="0.5" width="39" height="29" rx="6" fill="url(#chip)" stroke="#713f12" strokeOpacity=".5" />
              <path d="M0 10h12M0 20h12M28 10h12M28 20h12M12 0v30M28 0v30M12 15h16" stroke="#713f12" strokeOpacity=".45" />
            </svg>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                acceptPromo ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-200" : "border-white/20 bg-black/25 text-white/70"
              }`}
            >
              {acceptPromo ? "รับโปรโมชัน" : "ไม่รับโปรโมชัน"}
            </span>
          </div>

          <div>
            <p className="text-xs text-white/70">ยอดเครดิต</p>
            <div className="flex items-center gap-2">
              <p
                className="text-[clamp(1.75rem,8vw,2.25rem)] font-semibold leading-none tabular-nums text-[#eab308] drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)]"
                aria-live="polite"
              >
                ฿{baht(balance)}
              </p>
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                aria-label="รีเฟรชยอดเงิน"
                className={`grid size-12 shrink-0 place-items-center rounded-full text-[#eab308] hover:bg-white/10 disabled:opacity-70 ${PRESS} ${FOCUS}`}
              >
                <Svg size={18} className={refreshing ? styles.spin : ""}>{Icon.refresh}</Svg>
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 text-sm">
            <span className="truncate font-medium tracking-wide text-white/85">{username}</span>
            <span className="shrink-0 text-white/70">
              คะแนน <b className="ml-1 text-base font-semibold tabular-nums text-[#eab308]">{num(wallet?.point_balance).toLocaleString("th-TH")}</b>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
