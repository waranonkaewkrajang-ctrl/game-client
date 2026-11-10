
"use client";

/**
 * SNAKE168 sample withdrawal receipt.
 *
 * IMPORTANT:
 * - Withdrawal records are simulated.
 * - This component never generates withdrawal amounts.
 * - All amounts come directly from item.amount.
 * - Member names, times and statuses come from the original item.
 * - Reference codes are supplied by the existing parent logic.
 * - Receipt themes are decorative and do not represent real banks.
 * - No bank-issued transaction confirmation is implied.
 */

import { useEffect, useRef } from "react";
import type { WithdrawalItem } from "./recentWithdrawals.demo";
import {
  STATUS_LABEL,
  formatWithdrawalAmount,
} from "./withdrawalFormat";
import styles from "./WithdrawalReceipt.module.css";
import { getReceiptTheme } from "./receiptTheme";



/** 100 unique fictional Thai full names for demo receipts only. */
const DEMO_NAMES = [
  "กิตติพงษ์ วัฒนากุล",
  "ธนวัฒน์ ศิริพัฒน์",
  "ณัฐวุฒิ รัตนโชติ",
  "พีรพัฒน์ สุขประเสริฐ",
  "ภัทรพล จันทร์สว่าง",
  "ศุภกร ทองวิไล",
  "วรเมธ อัครเดช",
  "ปกรณ์ ชัยมงคล",
  "อนุชา บุญเรือง",
  "ธีรภัทร เกียรติไพบูลย์",
  "นราวิชญ์ พิพัฒนกุล",
  "ชยพล วงศ์สวัสดิ์",
  "อธิวัฒน์ แสงอรุณ",
  "ภูริณัฐ วิเศษชัย",
  "จักรพงษ์ ธรรมรักษ์",
  "ธนกฤต อินทรสุวรรณ",
  "รัชชานนท์ มณีรัตน์",
  "ก้องภพ ศรีประภา",
  "พิชญุตม์ สุขสมบูรณ์",
  "วรากร พรหมพิทักษ์",
  "ณัฐพงศ์ วัฒนกิจ",
  "สิรวิชญ์ บุญประดับ",
  "ธนากร รุ่งรัตนชัย",
  "ภาคภูมิ ศิริธนากุล",
  "อภิสิทธิ์ เจริญวัฒนา",
  "ปริญญา จิตต์ประสงค์",
  "ชาญณรงค์ แก้วมณี",
  "เอกภพ พัฒนศักดิ์",
  "ธนภัทร สุวรรณโชติ",
  "วรวิทย์ ประเสริฐกุล",
  "กฤตภาส วงศ์เจริญ",
  "ศรัณย์ นาคประดิษฐ์",
  "ทศพล อรุณรุ่ง",
  "พงศกร วิริยะกุล",
  "ณรงค์ฤทธิ์ ทองประยูร",
  "ภูวดล ศรีพิทักษ์",
  "ธนโชติ สกุลวัฒน์",
  "จิรายุ พงษ์ไพศาล",
  "วรเชษฐ์ รัตนพิสุทธิ์",
  "ปวริศ สุขอนันต์",
  "ธีรเดช พรประภา",
  "ชินวัตร แก้วประเสริฐ",
  "กิตติศักดิ์ วงศ์วิเศษ",
  "อัครพล จันทร์ประดับ",
  "นพดล ธนโชคชัย",
  "พีรวิชญ์ มงคลวัฒนา",
  "สิทธิชัย วัฒนศิริ",
  "ธนบดี บุญพิพัฒน์",
  "ศุภณัฐ แสงทอง",
  "ปฐมพงศ์ อินทรรักษ์",
  "ปรียาภรณ์ วัฒนมงคล",
  "ณิชาภัทร ศิริรุ่งเรือง",
  "กัญญารัตน์ ทองสุข",
  "พิชญาภา รัตนวรรณ",
  "สุภัสสรา จันทร์เจริญ",
  "ธัญชนก วงศ์ประเสริฐ",
  "ศิริพร บุญวัฒนา",
  "พิมพ์ชนก แสงประทีป",
  "วรัญญา พัฒนโชติ",
  "ชลธิชา สุวรรณกุล",
  "ปณิตา ศรีสมบัติ",
  "ณัฐธิดา พรหมรักษ์",
  "กมลชนก อินทรวิเศษ",
  "อรปรียา แก้วสวัสดิ์",
  "นภัสสร วัฒนชัย",
  "เบญจพร มณีโชติ",
  "ศศิธร ธรรมเจริญ",
  "กุลธิดา รุ่งไพบูลย์",
  "พัชราภรณ์ สุขวัฒนา",
  "สิริกานต์ วงศ์มณี",
  "ธัญญลักษณ์ ทองพิทักษ์",
  "ชุติมา ศรีสุวรรณ",
  "อัญชิสา จิตต์เจริญ",
  "ณิชารีย์ พัฒนวงศ์",
  "พิมพ์มาดา แสงวิเศษ",
  "วราภรณ์ รัตนกุล",
  "กัญญาภัค บุญประเสริฐ",
  "ปาริฉัตร ศิริโชติ",
  "อริสรา จันทร์วัฒนา",
  "มนัสนันท์ สุขไพศาล",
  "จิราภา ทองเจริญ",
  "พรนภา วงศ์พิพัฒน์",
  "สุชานันท์ อินทรมงคล",
  "นลินรัตน์ แก้วรุ่งเรือง",
  "พัชรินทร์ ธนวัฒนกุล",
  "รินรดา ศรีวิเศษ",
  "ชนากานต์ บุญสวัสดิ์",
  "อรณิชา วัฒนประภา",
  "ณัฐกานต์ มณีประเสริฐ",
  "ศิรินภา พรหมโชติ",
  "กุลธิดา รัตนไพบูลย์",
  "ชญานิศ สุขเจริญ",
  "ธนพร วงศ์พิทักษ์",
  "ปิยธิดา แสงสุวรรณ",
  "สุพิชญา จันทร์มงคล",
  "วรินทรา บุญไพศาล",
  "ภัทรธิดา ศิริวิเศษ",
  "นริศรา ทองวัฒนา",
  "กมลวรรณ พัฒนประเสริฐ",
  "อัญญารินทร์ สุขมณี",
] as const;


function getDemoIdentity(id: WithdrawalItem["id"]) {
  const value = String(id);
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  const n = hash >>> 0;
  const name = DEMO_NAMES[n % DEMO_NAMES.length];
  // Masked fictional identifier; not an actual bank account number.
  const account = `XXX-X-${String(n % 10000).padStart(4, "0")}-X`;
  return { name, account };
}

/* =========================================================
   ICONS
   ========================================================= */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function WithdrawalArrows() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 18l5-5 5 5 M7 13l5-5 5 5 M7 8l5-5 5 5" />
    </svg>
  );
}

/* =========================================================
   MINI RECEIPT
   ========================================================= */

interface ReceiptThumbProps {
  item: WithdrawalItem;
  reference?: string;
  className?: string;
  tabIndex?: number;
  onOpen: () => void;
}

export function ReceiptThumb({
  item,
  reference,
  className,
  tabIndex,
  onOpen,
}: ReceiptThumbProps) {
  const theme = getReceiptTheme(item.id);
  const success = item.status === "success";

  return (
    <button
      type="button"
      className={`${styles.thumb} ${className ?? ""}`}
      tabIndex={tabIndex}
      aria-haspopup="dialog"
      aria-label={`ดูสลิปตัวอย่างของ ${item.maskedDisplayName} ยอด ${formatWithdrawalAmount(item.amount)}`}
      onClick={onOpen}
      title="ดูสลิปตัวอย่าง"
    >
      {/* miniature of the expanded slip: coloured header → status icon → amount → label → dashed rule → name → paper edge */}
      <span
        className={styles.thumbHead}
        style={{ backgroundColor: theme.header }}
        aria-hidden="true"
      />

      <span className={styles.thumbContent} aria-hidden="true">
        <span className={`${styles.thumbCheck} ${success ? styles.heroSuccess : styles.heroPending}`}>
          {success ? <CheckIcon /> : <ClockIcon />}
        </span>
        <span className={styles.thumbAmount}>{formatWithdrawalAmount(item.amount)}</span>
        <span className={styles.thumbLabel}>รายการถอน</span>
        <span className={styles.thumbRule} />
        <span className={styles.thumbName}>{item.maskedDisplayName}</span>
      </span>

      <span className={styles.thumbEdge} aria-hidden="true" />
    </button>
  );
}

function ReceiptPaper({
  item,
  reference,
  titleId,
}: {
  item: WithdrawalItem;
  reference: string;
  titleId: string;
}) {
  const theme = getReceiptTheme(item.id);
  const success = item.status === "success";
  const demoIdentity = getDemoIdentity(item.id);

  return (
    <article className={styles.slip}>
      {/* นำ header, slipBody และ edge
          จาก ReceiptDialog เดิมมาวางที่นี่ */}
    </article>
  );
}

/* =========================================================
   FULL RECEIPT POPUP
   ========================================================= */

interface ReceiptDialogProps {
  item: WithdrawalItem;
  reference: string;
  onClose: () => void;
}

export function ReceiptDialog({
  item,
  reference,
  onClose,
}: ReceiptDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const theme = getReceiptTheme(item.id);
  const success = item.status === "success";
  const demoIdentity = getDemoIdentity(item.id);

  const titleId = `receipt-title-${item.id}`;
  const noticeId = `receipt-notice-${item.id}`;

  /*
   * Native modal dialog:
   * - Appears above the page and navigation.
   * - Locks document scrolling.
   * - Restores focus to the opening element.
   * - Avoids depending on the asynchronous close event.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (!dialog.open) {
      dialog.showModal();
    }

    closeButtonRef.current?.focus();

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;

    root.style.overflow = "hidden";

    return () => {
      if (dialog.open) {
        dialog.close();
      }

      root.style.overflow = previousOverflow;

      openerRef.current?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={noticeId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <article className={styles.slip}>

        {/* Close popup */}
        <button
          ref={closeButtonRef}
          type="button"
          className={styles.close}
          aria-label="ปิดสลิป"
          onClick={onClose}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M7 7l10 10M17 7L7 17" />
          </svg>
        </button>

        {/* ============================================
            HEADER
           ============================================ */}

        <header
          className={styles.slipHead}
          style={{ backgroundColor: theme.header }}
        >
          <div className={styles.brand}>
            <img
              src={theme.logo}
              alt=""
              className={styles.brandLogo}
              width={42}
              height={42}
              decoding="async"
            />

            <div className={styles.brandText}>
  <span className={styles.brandTitle}>
  {theme.name}
</span>

  <span id={titleId} className={styles.subtitle}>
    {demoIdentity.name} ({demoIdentity.account})
  </span>
</div>
          </div>
        </header>

        {/* ============================================
            RECEIPT BODY
           ============================================ */}

        <div className={styles.slipBody}>

          {/* Withdrawal direction */}
          <div
            className={styles.actionArrows}
            aria-hidden="true"
          >
            <WithdrawalArrows />
          </div>

          {/* Transaction details */}
          <dl className={styles.details}>

            <div className={styles.detailRow}>
              <dt>สมาชิก (ชื่อในรายการ)</dt>
              <dd>{item.maskedDisplayName}</dd>
            </div>

            <div className={styles.detailRow}>
              <dt>เวลาทำรายการ</dt>
              <dd>{item.relativeTime}</dd>
            </div>

            <div className={styles.detailRow}>
              <dt>เลขอ้างอิง</dt>
              <dd className={styles.mono}>
                {reference}
              </dd>
            </div>

          </dl>

          <hr className={styles.rule} />

          {/* Amount details */}
          <dl className={styles.details}>

            <div className={styles.detailRow}>
              <dt>จำนวนเงิน</dt>
              <dd>
                {formatWithdrawalAmount(item.amount)}
              </dd>
            </div>

            <div className={styles.detailRow}>
              <dt>สถานะ</dt>
              <dd
                className={
                  success
                    ? styles.textSuccess
                    : styles.textPending
                }
              >
                {STATUS_LABEL[item.status]}
              </dd>
            </div>

          </dl>

          {/* ============================================
              RESULT
             ============================================ */}

          <div className={styles.hero}>

            <span
              className={`${styles.heroIcon} ${
                success
                  ? styles.heroSuccess
                  : styles.heroPending
              }`}
              aria-hidden="true"
            >
              {success ? (
                <CheckIcon />
              ) : (
                <ClockIcon />
              )}
            </span>

            <strong className={styles.heroAmount}>
              {formatWithdrawalAmount(item.amount)}
            </strong>

            <span
              className={`${styles.heroStatus} ${
                success
                  ? styles.textSuccess
                  : styles.textPending
              }`}
            >
              {STATUS_LABEL[item.status]}
            </span>

          </div>
        </div>

        {/* Decorative receipt edge */}
        <span
          className={styles.edge}
          aria-hidden="true"
        />

      </article>
    </dialog>
  );
}
