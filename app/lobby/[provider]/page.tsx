"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import ProviderGameCard, { ProviderGameCardSkeleton } from "@/components/lobby/ProviderGameCard";
import { favoriteKey, useFavoriteGames } from "@/components/lobby/favoriteGames";
import { alertFavoriteSaveFailed, launchGame } from "@/components/lobby/launchGame";

interface Game {
  id: number; product_id: string; game_code: string; game_name: string; game_name_th: string | null;
  category: string | null; type: string | null; image_url: string | null; is_active: boolean;
}

// provider id → measured cover ratio (client-side, per session; see coverRatio below)
const coverRatioByProvider = new Map<string, number>();

export default function ProviderRoomPage() {
  const router = useRouter();
  const params = useParams();
  const provider = params.provider as string;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  // width / height of this provider's cover artwork (measured from the first loaded image; null = 3:4 default).
  // Remembered per provider for this browser session, so re-entering a room lays out skeletons and cards at the
  // final ratio straight away (no resize when the first cover loads). Only written on the client (image onLoad),
  // so server render and hydration both start from null on a full refresh.
  const [coverRatio, setCoverRatio] = useState<number | null>(() => coverRatioByProvider.get(provider) ?? null);
  const [ratioFor, setRatioFor] = useState(provider);
  if (ratioFor !== provider) { setRatioFor(provider); setCoverRatio(coverRatioByProvider.get(provider) ?? null); } // switching provider
  const rememberCoverRatio = (w: number, h: number) => {
    coverRatioByProvider.set(provider, w / h);
    setCoverRatio((r) => r ?? w / h);
  };
  // favorite games (browser-local; see components/lobby/favoriteGames.ts)
  const { isFavorite, toggle: toggleFavorite } = useFavoriteGames();
  const handleToggleFavorite = (game: Game) => {
    if (!toggleFavorite(favoriteKey(game.product_id, game.game_code))) alertFavoriteSaveFailed();
  };

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

  // shared with the lobby's favorites tab (components/lobby/launchGame.ts — same request and behaviour)
  const handleLaunchGame = (game: Game) => launchGame(game);

  return (
    <div style={{ minHeight: "100vh", background: "transparent", paddingBottom: "70px", position: "relative", overflow: "hidden" }}>
      {/* transparent root: the site-wide mountain background (body::before in globals.css) shows through */}

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
          // placeholders = the card's own frame/ratio/name line (was: translucent #14142a tiles pulsing 30–60% opacity,
          // fixed 3:4 and no name line → a different colour that flickered, then a layout jump when cards arrived)
          <div
            className="games-grid"
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px",
              ...(coverRatio ? { ["--cover-ar" as string]: coverRatio } : {}),
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <ProviderGameCardSkeleton key={i} />
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
          <div
            className="games-grid"
            style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px",
              // cover box = the provider's real artwork ratio (first cover that loads)
              ...(coverRatio ? { ["--cover-ar" as string]: coverRatio } : {}),
            }}
          >
            {games.map((game, i) => (
              <ProviderGameCard
                key={game.id}
                title={game.game_name_th || game.game_name}
                imageUrl={game.image_url}
                productId={game.product_id}
                category={game.category}
                onLaunch={() => handleLaunchGame(game)}
                favorite={isFavorite(favoriteKey(game.product_id, game.game_code))}
                onToggleFavorite={() => handleToggleFavorite(game)}
                eager={i < 8}
                onCoverLoad={coverRatio ? undefined : rememberCoverRatio}
              />
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

        /* 🆕 บังคับ 2 คอลัมน์บนมือถือ */
        @media (max-width: 768px) {
          .games-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
        }
      `}} />

    
    </div>
  );
}