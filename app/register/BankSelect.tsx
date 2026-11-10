"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import { BANKS } from "@/lib/registration";
import styles from "./register.module.css";

type Props = { value: string; onChange: (value: string) => void; error?: string; disabled: boolean };

export default function BankSelect({ value, onChange, error, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = BANKS.find(bank => bank.code === value);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  useEffect(() => {
    if (open) root.current?.querySelector(`[data-bank-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const show = () => {
    setActive(Math.max(0, BANKS.findIndex(bank => bank.code === value)));
    setOpen(true);
  };
  const choose = (index: number) => {
    onChange(BANKS[index].code);
    setOpen(false);
    trigger.current?.focus();
  };
  const keys = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "Escape") { setOpen(false); event.preventDefault(); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!open) { show(); return; }
      setActive(index => event.key === "Home" ? 0 : event.key === "End" ? BANKS.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + BANKS.length) % BANKS.length);
    } else if (open && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault(); choose(active);
    } else if (open && event.key.length === 1) {
      const index = BANKS.findIndex(bank => bank.name.toLowerCase().startsWith(event.key.toLowerCase()));
      if (index >= 0) { event.preventDefault(); setActive(index); }
    }
  };

  return <div ref={root} className={styles.bankPicker}>
    <button ref={trigger} id="register-bank_code" name="bank_code" type="button" role="combobox" aria-labelledby="register-bank-label" aria-haspopup="listbox" aria-expanded={open} aria-controls="register-bank-list" aria-activedescendant={open ? `bank-option-${active}` : undefined} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? "error-bank_code" : undefined} disabled={disabled} className={styles.bankTrigger} onKeyDown={keys} onClick={() => open ? setOpen(false) : show()}>
      <span className={styles.bankChoice}>{selected ? <><Image src={`/logos/${selected.logo}.webp`} alt="" width={30} height={30} /><span>{selected.name}</span></> : <span className={styles.bankPlaceholder}>เลือกธนาคาร</span>}</span>
      <span aria-hidden="true" className={styles.bankChevron}>{open ? "⌃" : "⌄"}</span>
    </button>
    {open && <div id="register-bank-list" role="listbox" aria-labelledby="register-bank-label" className={styles.bankList}>
      {BANKS.map((bank, index) => <button key={bank.code} id={`bank-option-${index}`} type="button" role="option" aria-selected={bank.code === value} tabIndex={-1} data-bank-index={index} data-active={active === index} className={styles.bankOption} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>
        <Image src={`/logos/${bank.logo}.webp`} alt="" width={30} height={30} /><span>{bank.name}</span><span className={styles.bankCheck} aria-hidden="true">{bank.code === value ? "✓" : ""}</span>
      </button>)}
    </div>}
  </div>;
}
