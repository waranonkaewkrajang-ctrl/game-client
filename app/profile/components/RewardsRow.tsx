"use client";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Rewards } from "../types";
import { baht, num } from "../lib";
import { FOCUS, GLASS, Icon, PRESS, Section, Svg } from "./ui";

function RewardLink({ href, title, hint, art, pending, badgeTone }: {
  href: string;
  title: string;
  hint: string;
  art: ReactNode;
  pending?: number | null;
  badgeTone?: string;
}) {
  const amount = num(pending);
  const hasAmount = pending !== undefined;
  return (
    <Link
      href={href}
      className={`flex min-h-[72px] items-center gap-3 px-4 py-3 hover:bg-white/[0.04] ${PRESS} ${FOCUS} focus-visible:-outline-offset-2`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-yellow-400/20 bg-linear-to-br from-yellow-500/20 to-pink-500/10">
        {art}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-white">{title}</span>
        <span className="block truncate text-xs text-fuchsia-100/65">{hint}</span>
      </span>
      {hasAmount && (
        <span className="text-right">
          <span className={`block text-base font-semibold tabular-nums ${amount > 0 ? "text-[#eab308] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "text-white/40"}`}>
            ฿{baht(amount)}
          </span>
          {amount > 0 && (
            <span className={`mt-0.5 inline-block rounded-full border px-2 py-px text-[11px] font-semibold ${badgeTone}`}>รอรับ</span>
          )}
        </span>
      )}
      <Svg size={18} className="shrink-0 text-fuchsia-200/50">{Icon.chevron}</Svg>
    </Link>
  );
}

export default function RewardsRow({ rewards }: { rewards: Rewards | null }) {
  return (
    <Section id="rewards" title="รับรางวัล">
      <div className={`${GLASS} divide-y divide-white/[0.07] overflow-hidden`}>
        <RewardLink
          href="/rewards/cashback"
          title="รับยอดเสีย"
          hint="คืนยอดเสียรายวัน"
          pending={rewards?.cashback?.pending ?? 0}
          badgeTone="border-amber-400/40 bg-amber-500/15 text-amber-300"
          art={<Image src="https://i.ibb.co/R4kjVQcm/image.png" alt="" width={28} height={28} unoptimized className="size-7 object-contain" />}
        />
        <RewardLink
          href="/rewards/referral"
          title="แนะนำเพื่อน"
          hint="รับค่าคอมจากเพื่อน"
          pending={rewards?.referral?.pending ?? 0}
          badgeTone="border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
          art={<Image src="https://i.ibb.co/rKmzVHgv/Chat-GPT-Image-1-2569-04-18-15.png" alt="" width={28} height={28} unoptimized className="size-7 object-contain" />}
        />
        <RewardLink
          href="/spin-wheel"
          title="วงล้อเสี่ยงโชค"
          hint="หมุนลุ้นรางวัลทุกวัน"
          art={<Svg size={24} className="text-[#eab308]">{Icon.wheel}</Svg>}
        />
      </div>
    </Section>
  );
}
