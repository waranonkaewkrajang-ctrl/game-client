"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import api from "@/lib/api";

const HIDE_NAVBAR_PAGES = ["/login", "/register"];

export default function NavbarWrapper() {
  const pathname = usePathname();
  const [maintenance, setMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api.get("/maintenance/check").then((res) => {
      setMaintenance(res.data.maintenance === true);
      setChecked(true);
    }).catch(() => setChecked(true));
  }, [pathname]);

  if (HIDE_NAVBAR_PAGES.includes(pathname)) return null;

  // ถ้าอยู่ระหว่างปิดปรับปรุง แสดงหน้า maintenance แทน
  if (checked && maintenance) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "white", textAlign: "center", padding: "2rem",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔧</div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 0.5rem", color: "#f59e0b" }}>
          ปิดปรับปรุงระบบชั่วคราว
        </h1>
        <p style={{ fontSize: "1rem", color: "#94a3b8", maxWidth: "400px", lineHeight: 1.6 }}>
          ขออภัยในความไม่สะดวก ระบบกำลังปรับปรุงเพื่อให้บริการที่ดีขึ้น กรุณากลับมาใหม่ภายหลัง
        </p>
        <div style={{ marginTop: "2rem", padding: "12px 24px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "12px" }}>
          <p style={{ fontSize: "0.85rem", color: "#f59e0b", margin: 0, fontWeight: 600 }}>
            ติดต่อสอบถาม: Line หรือโทรหาเราได้เลย
          </p>
        </div>
      </div>
    );
  }

  return <Navbar />;
}