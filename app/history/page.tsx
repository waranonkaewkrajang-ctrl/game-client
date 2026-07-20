"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"transactions" | "games">("transactions");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gameLogs, setGameLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    api.get("/wallet/transactions").then((res) => { setTransactions(res.data.data.data || res.data.data || []); setLoading(false); }).catch(() => setLoading(false));
    api.get("/games/history").then((res) => setGameLogs(res.data.data.data || res.data.data || [])).catch(() => {});
  }, []);

  const fmt = (n: number) => n?.toLocaleString("th-TH", { minimumFractionDigits: 2 });

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#e2e8f0", marginBottom: "1rem" }}>ประวัติ</h1>

        <div style={{ display: "flex", gap: 0, marginBottom: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "4px" }}>
          {[{ key: "transactions" as const, label: "ธุรกรรม" }, { key: "games" as const, label: "การเล่นเกม" }].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, background: tab === t.key ? "#7c3aed" : "transparent", color: tab === t.key ? "white" : "#64748b" }}>{t.label}</button>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>กำลังโหลด...</p> :

          tab === "transactions" ? (
            transactions.length === 0 ? <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>ยังไม่มีรายการ</p> :
            transactions.map((tx: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{tx.description || tx.type}</p>
                  <p style={{ fontSize: "0.7rem", color: "#64748b", margin: "2px 0 0" }}>{new Date(tx.created_at).toLocaleString("th-TH")}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", color: tx.direction === "in" ? "#10b981" : "#ef4444", margin: 0 }}>{tx.direction === "in" ? "+" : "-"}฿{fmt(parseFloat(tx.amount))}</p>
                  <p style={{ fontSize: "0.65rem", color: "#64748b", margin: "2px 0 0" }}>คงเหลือ ฿{fmt(parseFloat(tx.balance_after))}</p>
                </div>
              </div>
            ))
          ) : (
            gameLogs.length === 0 ? <p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>ยังไม่มีประวัติเล่นเกม</p> :
            gameLogs.map((log: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{log.game_name || log.game_id}</p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "3px" }}>
                    <span style={{ fontSize: "0.6rem", background: "rgba(124,58,237,0.15)", color: "#a855f7", padding: "1px 6px", borderRadius: "999px", fontWeight: 600 }}>{log.provider}</span>
                    <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{new Date(log.created_at).toLocaleString("th-TH")}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.78rem", color: "#ef4444", margin: 0 }}>เดิมพัน ฿{fmt(parseFloat(log.bet_amount))}</p>
                  <p style={{ fontSize: "0.78rem", color: "#10b981", margin: "2px 0 0" }}>ชนะ ฿{fmt(parseFloat(log.win_amount))}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}