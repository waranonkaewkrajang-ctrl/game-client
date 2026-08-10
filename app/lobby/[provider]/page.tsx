"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
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
        const gameUrl = res.data.data.game_url;
        if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
          window.location.href = gameUrl;
        } else {
          window.open(gameUrl, "_blank");
        }
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "เปิดเกมไม่สำเร็จ", text: err.response?.data?.message || "กรุณาลองใหม่", background: "#14142a", color: "#e2e8f0", confirmButtonColor: "#dc2626" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "transparent", paddingBottom: "70px", position: "relative", overflow: "hidden" }}>

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
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 16px", position: "relative", zIndex: 1 }}>

        {/* Room Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "20px",
          padding: "14px 18px",
          background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(88,28,135,0.15) 60%, transparent)",
          borderRadius: "14px",
          borderLeft: "3px solid #a855f7",
          boxShadow: "0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* เส้นแสงเรืองด้านบน */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)",
          }}></div>

          {/* ปุ่มกลับ 3D */}
          <button
            onClick={() => router.push("/lobby")}
            style={{
              background: "linear-gradient(180deg, #ef4444 0%, #b91c1c 50%, #7f1d1d 100%)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "10px",
              color: "#fff",
              padding: "9px 18px",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              letterSpacing: "0.3px",
              boxShadow: "0 4px 0 #450a0a, 0 6px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 3px rgba(69,10,10,0.6)",
              textShadow: "0 1px 2px rgba(0,0,0,0.4)",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 0 #450a0a, 0 8px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 3px rgba(69,10,10,0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
e.currentTarget.style.boxShadow = "0 4px 0 #450a0a, 0 6px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 3px rgba(69,10,10,0.6)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "translateY(2px)";
e.currentTarget.style.boxShadow = "0 2px 0 #450a0a, 0 3px 5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 3px rgba(69,10,10,0.6)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
          >
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>←</span>
            <span>กลับ</span>
          </button>

          {/* ข้อความ 3D */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: 900,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "0.5px",
              background: "linear-gradient(180deg, #ffffff 0%, #e9d5ff 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4)) drop-shadow(0 0 8px rgba(168,85,247,0.3))",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              ห้อง {provider}
            </h2>
            <span style={{
              fontSize: "0.72rem",
              color: "#c084fc",
              fontWeight: 700,
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              letterSpacing: "0.3px",
              marginTop: "2px",
              display: "inline-block",
            }}>
              {loading ? (
                "กำลังโหลด..."
              ) : (
                <>เกมทั้งหมด <span style={{ color: "#fbbf24", fontWeight: 900, fontSize: "0.85rem" }}>{games.length}</span> เกม</>
              )}
            </span>
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="games-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ background: "#14142a", borderRadius: "14px", aspectRatio: "3/4", animation: "pulse 1.5s ease-in-out infinite" }} />
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
          <div className="games-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {games.map((game) => (
              <div key={game.id} onClick={() => handleLaunchGame(game)} style={{ cursor: "pointer", position: "relative", overflow: "visible" }}>
               <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: "14px", overflow: "hidden", position: "relative", background: "#121214", transition: "transform 0.3s ease" }}
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

    /* 🆕 บังคับ 2 คอลัมน์บนมือถือ */
        @media (max-width: 768px) {
          .games-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
    </div>
  );
}