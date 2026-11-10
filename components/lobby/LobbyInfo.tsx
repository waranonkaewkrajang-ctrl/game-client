"use client";
/**
 * Lobby info block — design-reference/lobby-info-section/lobby-info-sectionwhy-snake168-abc-reference.png
 * One connected section on a light, translucent local surface (the mountains stay visible):
 * "ทำไมต้อง SNAKE168?" (open, unboxed features) — divider — FAQ (open accordion, two columns on desktop)
 * — divider — support links.
 * Placed under "ยอดถอนล่าสุด" on /lobby.
 *
 * Content policy — every statement is either a fact from the site itself or neutral wording:
 *  - deposit / withdrawal minimums: live from GET /finance/settings (same endpoint as the Wallet page);
 *    the answer falls back to "see the Wallet page" when the value is unavailable — no hardcoded amounts
 *  - withdrawals: admin approval + paid to the registered account only (Wallet page behaviour / wallet.note2)
 *  - provider count: the real number of providers with active games (passed in by the lobby)
 *  - contact buttons: LINE / Telegram from GET /contact-links (same as the bottom menu); a button renders
 *    only for a real http(s) URL — no invented IDs, phone numbers or opening hours
 *  - no speed promises, "24 hours", "100% safe", bonus amounts or testimonials
 * Copy lives in lib/i18n (lobbyInfo.*) and is DRAFT wording pending content approval.
 */
import { useEffect, useId, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trans, useTranslation } from "react-i18next";
import api from "@/lib/api";
import styles from "./LobbyInfo.module.css";

// features: public/images/why-snake168/*.webp — all transparent RGBA. Five are 1024×1024 icons; all-devices.webp
// is the 1536×1024 desktop + smartphone SNAKE168 artwork, shown wider so both devices stay recognisable.
// next/image serves a small 1x/2x copy for the box; the source files are untouched.
const FEATURES = [
  { key: "f1", icon: "deposit-withdraw", w: 1024, h: 1024 },
  { key: "f2", icon: "account-security", w: 1024, h: 1024 },
  { key: "f3", icon: "game-variety", w: 1024, h: 1024 },
  { key: "f4", icon: "promotions", w: 1024, h: 1024 },
  { key: "f5", icon: "customer-support", w: 1024, h: 1024 },
  { key: "f6", icon: "all-devices", w: 1536, h: 1024 },
] as const;

// desktop: two FAQ columns (q1–q4 | q5–q7), DOM order = reading/tab order; phones: one column with the first
// MOBILE_VISIBLE questions, the rest behind "ดูคำถามเพิ่มเติม" (collapsible again)
const FAQ_GROUPS = [["q1", "q2", "q3", "q4"], ["q5", "q6", "q7"]] as const;
type FaqKey = (typeof FAQ_GROUPS)[number][number];
const MOBILE_VISIBLE = 5;

// FAQ answer links → verified routes in app/ (register, login, wallet, history, profile, promotions)
const FAQ_LINKS = {
  register: <Link href="/register" className={styles.faqLink} />,
  login: <Link href="/login" className={styles.faqLink} />,
  wallet: <Link href="/wallet" className={styles.faqLink} />,
  history: <Link href="/history" className={styles.faqLink} />,
  profile: <Link href="/profile" className={styles.faqLink} />,
  promotions: <Link href="/promotions" className={styles.faqLink} />,
};

const isHttpUrl = (v: unknown): v is string => typeof v === "string" && /^https?:\/\//i.test(v);

const svgProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const ChevronIcon = () => <svg {...svgProps} width="18" height="18"><path d="M6 9l6 6 6-6" /></svg>;
const HeadsetIcon = () => (
  <svg {...svgProps} width="40" height="40" strokeWidth={1.6}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="13" width="4" height="6" rx="1.5" />
    <rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M19 19v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
  </svg>
);
const ChatIcon = () => (
  <svg {...svgProps} width="20" height="20"><path d="M21 11.5c0 4.1-4 7.5-9 7.5-1 0-2-.1-2.9-.4L5 20l1.2-3.3C4.2 15.4 3 13.6 3 11.5 3 7.4 7 4 12 4s9 3.4 9 7.5z" /></svg>
);
const PlaneIcon = () => (
  <svg {...svgProps} width="20" height="20"><path d="M21.5 3.5L2.8 10.7c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 5.6c.3.9 1.4 1.1 2 .4l2.6-2.9 4.7 3.5c.7.5 1.7.1 1.9-.8l3-14.6c.2-1-.8-1.8-1.9-1.4z" /><path d="M7.5 14l10-7.5-7.5 9.5" /></svg>
);

export default function LobbyInfo({ providerCount }: { providerCount?: number }) {
  const { t } = useTranslation();
  const baseId = useId();
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [minDeposit, setMinDeposit] = useState<number | null>(null);
  const [minWithdraw, setMinWithdraw] = useState<number | null>(null);
  const [contact, setContact] = useState<{ line?: string; telegram?: string }>({});

  useEffect(() => {
    api.get("/finance/settings").then((res) => {
      const d = res.data?.data;
      if (typeof d?.min_deposit === "number") setMinDeposit(d.min_deposit);
      if (typeof d?.min_withdraw === "number") setMinWithdraw(d.min_withdraw);
    }).catch(() => {});
    api.get("/contact-links").then((res) => {
      const d = res.data ?? {};
      setContact({ line: isHttpUrl(d.line) ? d.line : undefined, telegram: isHttpUrl(d.telegram) ? d.telegram : undefined });
    }).catch(() => {});
  }, []);

  const hasContact = Boolean(contact.line || contact.telegram);
  // answer text with in-page links: <tag>…</tag> markers in lobbyInfo.a1/a2/a3/a5 map to existing App Router
  // routes (Trans builds React elements — no HTML injection). Protected pages keep their own login redirect.
  const linked = (k: string) => <Trans i18nKey={`lobbyInfo.${k}`} components={FAQ_LINKS} />;
  const answer = (key: FaqKey): ReactNode => {
    switch (key) {
      case "q2": return minDeposit !== null ? <>{linked("a2")} {t("lobbyInfo.a2Min", { min: minDeposit.toLocaleString() })}</> : linked("a2");
      case "q3": return minWithdraw !== null ? <>{linked("a3")} {t("lobbyInfo.a3Min", { min: minWithdraw.toLocaleString() })}</> : linked("a3");
      case "q7": return hasContact ? t("lobbyInfo.a7Links") : t("lobbyInfo.a7");
      default: return linked(`a${key.slice(1)}`);
    }
  };

  return (
    <div className={styles.info}>
      {/* ---------- Why SNAKE168 (Style B, open): intro (left / top) + unboxed feature grid on the background ---------- */}
      <section className={styles.why} aria-labelledby={`${baseId}-why`}>
        <div className={styles.intro}>
          <h2 id={`${baseId}-why`} className={styles.whyTitle}>
            <span className={styles.whyLead}>{t("lobbyInfo.whyTitleLead")}</span>
            
<span className={styles.brand}>
  <img
    src="/images/logo/snake168-text-logo.webp"
    alt="SNAKE168"
    width={160}
    height={63}
    decoding="async"
  />
</span>

          </h2>
          <p className={styles.introText}>{t("lobbyInfo.whyIntro")}</p>
        </div>
        <ul className={styles.features}>
          {FEATURES.map((f) => (
            <li key={f.key} className={styles.feature}>
              <span className={styles.featureMedia}>
                <Image
                  src={`/images/why-snake168/${f.icon}.webp`}
                  alt=""
                  width={f.w === f.h ? 72 : 96}
                  height={f.w === f.h ? 72 : 64}
                  className={f.w === f.h ? styles.featureIcon : styles.featureArt}
                  loading="lazy"
                />
              </span>
              <span className={styles.featureBody}>
                <span className={styles.featureTitle}>{t(`lobbyInfo.${f.key}Title`)}</span>
                <span className={styles.featureText}>
                  {f.key === "f3"
                    ? (providerCount ? t("lobbyInfo.f3Text", { n: providerCount }) : t("lobbyInfo.f3TextNoCount"))
                    : t(`lobbyInfo.${f.key}Text`)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- FAQ: open accordion under a thin divider, two columns on desktop ---------- */}
      <section className={styles.block} aria-labelledby={`${baseId}-faq`}>
        <h2 id={`${baseId}-faq`} className={styles.sectionTitle}>{t("lobbyInfo.faqTitle")}</h2>
        <div className={`${styles.faqCols} ${showAll ? styles.faqAll : ""}`}>
          {FAQ_GROUPS.map((group, gi) => (
            <ul key={gi} className={styles.faqList}>
              {group.map((key) => {
                const isOpen = open === key;
                const panelId = `${baseId}-${key}-a`;
                const isExtra = Number(key.slice(1)) > MOBILE_VISIBLE;
                return (
                  <li key={key} className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ""} ${isExtra ? styles.faqExtra : ""}`}>
                    <h3 className={styles.faqQ}>
                      <button
                        type="button"
                        className={styles.faqBtn}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpen(isOpen ? null : key)}
                      >
                        <span className={styles.faqMark} aria-hidden="true">?</span>
                        <span className={styles.faqText}>{t(`lobbyInfo.${key}`)}</span>
                        <span className={styles.chevron}><ChevronIcon /></span>
                      </button>
                    </h3>
                    <div id={panelId} className={styles.faqA} hidden={!isOpen}>
                      <p>{answer(key)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ))}
        </div>
        {/* phones show the first five questions; this reveals the rest in place (no separate FAQ page exists) */}
        <button type="button" className={styles.moreBtn} aria-expanded={showAll} onClick={() => {
            // collapsing hides q6–q7 on phones: close an answer that would otherwise stay open out of view
            if (showAll && open && Number(open.slice(1)) > MOBILE_VISIBLE) setOpen(null);
            setShowAll((v) => !v);
          }}>
          {showAll ? t("lobbyInfo.showLess") : t("lobbyInfo.showAll")}
        </button>
      </section>

      {/* ---------- Support (only with a configured contact channel), under a thin divider ---------- */}
      {hasContact && (
        <section className={`${styles.block} ${styles.contact}`} aria-labelledby={`${baseId}-contact`}>
          <div className={styles.contactInfo}>
            <span className={styles.contactIcon}><HeadsetIcon /></span>
            <div>
              <h2 id={`${baseId}-contact`} className={styles.contactTitle}>{t("lobbyInfo.contactTitle")}</h2>
              <p className={styles.contactText}>{t("lobbyInfo.contactText")}</p>
            </div>
          </div>
          <div className={styles.contactActions}>
            {contact.line && (
              <a href={contact.line} target="_blank" rel="noopener noreferrer" className={`${styles.contactBtn} ${styles.line}`}>
                <ChatIcon /><span>{t("lobbyInfo.contactLine")}</span>
              </a>
            )}
            {contact.telegram && (
              <a href={contact.telegram} target="_blank" rel="noopener noreferrer" className={`${styles.contactBtn} ${styles.telegram}`}>
                <PlaneIcon /><span>{t("lobbyInfo.contactTelegram")}</span>
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
