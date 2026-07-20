"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import Swal from "sweetalert2";

interface Game {
  id: number; product_id: string; game_code: string; game_name: string; game_name_th: string | null;
  category: string | null; type: string | null; image_url: string | null; is_active: boolean;
}

export default function ProviderRoomPage() {
  const router = useRouter();
  const params = useParams();
  const provider = params.provider as string;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    fetchGames();
  }, [provider]);

  const fetchGames = () => {
    setLoading(true);
    api.get("/games", { params: { productId: provider } }).then((res) => {
      const data = res.data.data?.data || res.data.data || [];
      const active = data.filter((g: Game) => g.is_active);
      setGames(active);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleLaunchGame = async (game: Game) => {
    try {
      const res = await api.post("/games/launch", { productId: game.product_id, gameCode: game.game_code, isMobile: window.innerWidth < 768 });
      if (res.data.status === "success" && res.data.data.game_url) {
        window.open(res.data.data.game_url, "_blank");
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "เปิดเกมไม่สำเร็จ", text: err.response?.data?.message || "กรุณาลองใหม่", background: "#14142a", color: "#e2e8f0", confirmButtonColor: "#dc2626" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #1c1c2d 0%, #2a2a4a 100%)", paddingBottom: "70px", position: "relative", overflow: "hidden" }}>

      {/* Dice Background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`dice-${i}`} style={{
            position: "absolute",
            top: `${(i * 7) % 100}%`,
            left: `${(i * 11) % 100}%`,
            fontSize: `${18 + (i % 4) * 10}px`,
            opacity: 0.15,
            animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
            filter: "grayscale(1) brightness(1.2)",
          }}>🎲</div>
        ))}
      </div>

      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 16px", position: "relative", zIndex: 1 }}>

        {/* Room Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", padding: "12px 16px", background: "linear-gradient(90deg, rgba(124,58,237,0.15), transparent)"
            , borderRadius: "10px", borderLeft: "3px solid #7c3aed" }}>
          <button onClick={() => router.push("/lobby")} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", color: "#e2e8f0", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.2)"; e.currentTarget.style.borderColor = "#7c3aed"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}>
            ← กลับ
          </button>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#a78bfa", margin: 0 }}>
              ห้อง {provider}
            </h2>
            <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
              {loading ? "กำลังโหลด..." : `เกมทั้งหมด ${games.length} เกม`}
            </span>
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ background: "#14142a", borderRadius: "12px", aspectRatio: "3/4", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ color: "#4a5568", fontSize: "0.9rem", fontWeight: 600 }}>ไม่พบเกมในค่ายนี้</p>
            <button onClick={() => router.push("/lobby")} style={{ marginTop: "12px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}>
              กลับหน้า Lobby
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
            {games.map((game) => (
              <div key={game.id} onClick={() => handleLaunchGame(game)} style={{ cursor: "pointer", position: "relative", overflow: "visible" }}>
                <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "14px", overflow: "hidden", position: "relative", background: "#121214", transition: "transform 0.3s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                  {game.image_url ? (
                    <img src={game.image_url} alt={game.game_name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} loading="lazy"
                      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = ""} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#2d2d4a", fontSize: "0.65rem" }}>No Image</div>
                  )}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "20px 8px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#a78bfa" }} />
                    <span style={{ fontSize: "0.55rem", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{game.product_id}</span>
                    <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#a78bfa" }} />
                  </div>
                </div>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#e2e8f0", margin: "6px 0 0", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {game.game_name_th || game.game_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.1; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.15 !important; }
          85% { opacity: 0.1; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}} />
    </div>
  );
}