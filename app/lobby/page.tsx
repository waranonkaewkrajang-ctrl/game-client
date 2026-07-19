"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import GameSidebar from "@/components/GameSidebar";
import Swal from "sweetalert2";
import Link from "next/link";

interface Game {
  id: number; product_id: string; game_code: string; game_name: string; game_name_th: string | null;
  category: string | null; type: string | null; image_url: string | null; is_active: boolean;
}

export default function LobbyPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("highlight");
  const [gameCategories, setGameCategories] = useState<{id: string; label: string; count: number}[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    api.get("/games/products").then((res) => { if (res.data.status === "success") setProducts(res.data.data || []); }).catch(() => {});
    fetchGames();
  }, []);

  const fetchGames = (productId?: string, searchTerm?: string) => {
    setLoading(true);
    const params: any = {};
    if (productId) params.productId = productId;
    if (searchTerm) params.search = searchTerm;
    api.get("/games", { params }).then((res) => {
      const data = res.data.data?.data || res.data.data || [];
      const active = data.filter((g: Game) => g.is_active);
      setAllGames(active);
      setGames(active);
      setLoading(false);

      const catMap: Record<string, number> = {};
      active.forEach((g: Game) => {
        const cat = g.category || g.type || "OTHER";
        catMap[cat] = (catMap[cat] || 0) + 1;
      });
      const cats = Object.entries(catMap)
        .map(([id, count]) => ({
          id,
          label: id === "EGAMES" ? "สล็อต" : id === "LIVECASINO" ? "คาสิโน" : id === "SLOT" ? "สล็อต" : id === "LIVE" ? "คาสิโน" : id === "SPORT" ? "กีฬา" : id === "FISHING" ? "ยิงปลา" : id === "FISH" ? "ยิงปลา" : id === "TABLE" ? "ไพ่" : id === "CARD" ? "ไพ่" : id === "KENO" ? "หวย" : id === "LOTTO" ? "หวย" : id,
          count,
        }))
        .sort((a, b) => b.count - a.count);
      setGameCategories(cats);
    }).catch(() => setLoading(false));
  };

  const handleCategoryFilter = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedProduct("");
    if (!catId) {
      setGames(allGames);
    } else {
      setGames(allGames.filter((g) => g.category === catId || g.type === catId));
    }
  };

  const handleProductFilter = (p: string) => {
    setSelectedProduct(p);
    setSelectedCategory("");
    fetchGames(p, search);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchGames(selectedProduct, search); };

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
      opacity: 0.15, /* ปรับความชัดตรงนี้ (0.15 คือ 15%) */
      animation: `floatDice ${22 + (i % 5) * 3}s ease-in-out infinite`,
      animationDelay: `${i * 1.2}s`,
      filter: "grayscale(1) brightness(1.2)", /* ปรับให้สว่างขึ้น */
    }}>🎲</div>
  ))}
</div>
      <Navbar />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 16px" }}>

        {/* Banner */}
        <div style={{ marginBottom: "14px", borderRadius: "12px", overflow: "hidden" }}>
          <Link href="/promotions">
            <img
              src="/banner.jpg"
              alt="Banner"
              style={{ width: "100%", height: "auto", display: "block", borderRadius: "12px" }}
            />
          </Link>
        </div>

        {/* 🟢 นำเกมไฮไลท์ (กล่องแดง) มาวางตรงนี้ 🟢 */}
        <div style={{ marginBottom: "24px", background: "radial-gradient(57.87% 93.51% at 50% 6.49%, rgb(124, 58, 237) -60%, rgb(10, 7, 21) 40%)", backdropFilter: "blur(10px)", borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden" }}>
          
          {/* เส้นแสงสีแดงเรืองแสงด้านบน */}
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "90%", height: "2px", borderRadius: "50%", background: "radial-gradient(50% 50% at 50% 50%, rgb(168, 85, 247) 0%, rgba(7, 29, 70, 0) 100%)", boxShadow: "0 0 10px rgb(246,42,0)" }}></div>
          </div>

          {/* หัวข้อแถบสีแดง */}
          <div style={{ position: "relative", width: "100%", height: "40px", marginBottom: "20px", borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.48, background: "linear-gradient(90deg, rgba(22, 4, 4, 0.6) -6.21%, rgb(168, 85, 247) 6.41%, rgba(22, 4, 4, 0.6) 80.01%)" }}></div>
            <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "2px", opacity: 0.44, background: "linear-gradient(90deg, rgba(22, 4, 4, 0.6) -6.21%, rgb(246, 42, 0) 4.41%, rgba(22, 4, 4, 0.6) 83.01%)" }}></div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: "10px", paddingLeft: "16px" }}>
              <span style={{ fontSize: "1.2rem", filter: "drop-shadow(0 0 5px rgba(255,255,255,0.5))" }}>⭐</span>
              <span style={{ color: "white", fontSize: "1.1rem", fontWeight: 700 }}>เกมไฮไลท์</span>
            </div>
          </div>

          {/* เนื้อหาด้านใน (แบ่งซ้าย 30% ขวา 70%) */}
          <div style={{ display: "flex", gap: "20px", alignItems: "stretch" }}>
            
            {/* ด้านซ้าย: แบนเนอร์โปรโมต */}
            <div style={{ width: "30%", flexShrink: 0 }}>
              <img 
                src="https://cdn.zabbet.com/T6WF/highlight/1775292485579-7ee0b7c4-1e20-4f31-84fb-66d0ac36c9a3.webp" 
                alt="Highlight Banner" 
                style={{ width: "100%", height: "100%", minHeight: "180px", borderRadius: "12px", objectFit: "cover", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }} 
              />
            </div>

            {/* ด้านขวา: รายการเกมแบบเลื่อนได้ */}
            <div style={{ width: "70%", display: "flex", gap: "24px", overflowX: "auto", scrollbarWidth: "none", padding: "10px 10px 20px 24px" }}>
              {allGames.slice(0, 6).map((game, i) => (
                <div key={`highlight-${game.id}`} className="rank-card" onClick={() => handleLaunchGame(game)}>
                  
                  <div className="rank-number-svg" style={{ left: "-15px", bottom: "10px" }}>
                    <svg width="60" height="70" viewBox="0 0 60 72">
                      <text x="50%" y="55%" dominantBaseline="central" textAnchor="middle" fill="#0a0a14" stroke="#1298FF" strokeWidth="3" fontSize="60" fontWeight="900" fontFamily="Arial, sans-serif" paintOrder="stroke">
                        {i + 1}
                      </text>
                    </svg>
                  </div>

                  <div className="rank-img-wrapper" style={{ boxShadow: "0 8px 16px rgba(0,0,0,0.6)" }}>
                    {game.image_url && <img src={game.image_url} className="rank-glow" alt="" />}
                    {game.image_url ? (
                      <img src={game.image_url} className="rank-main-img" alt={game.game_name} loading="lazy" />
                    ) : (
                      <div className="rank-no-img">No Image</div>
                    )}
                    
                    <div style={{ position: "absolute", top: "6px", right: "6px", zIndex: 20, background: "linear-gradient(135deg, rgb(244, 86, 67), rgb(252, 58, 133))", padding: "3px 8px", borderRadius: "10px", fontSize: "0.55rem", fontWeight: 800, color: "white", boxShadow: "0 2px 5px rgba(243, 45, 120, 0.7)" }}>
                      HOT
                    </div>

                    <div className="rank-provider-badge">
                      <span style={{ fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>{game.product_id}</span>
                    </div>
                  </div>

                  <div className="rank-title">{game.game_name_th || game.game_name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 10 อันดับเกมมาแรง (สไตล์แบบ Swiper Premium) */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{
            background: "linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, rgba(26, 26, 46, 0) 100%)",
            padding: "12px 20px",
            borderLeft: "4px solid #7c3aed",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
         }}>
  <span style={{ fontSize: "1.2rem" }}>🔥</span>
  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>10 อันดับเกมมาแรงค่าย PG</h3>
</div>

          <div className="rank-scroll-container">
            {allGames.slice(0, 10).map((game, i) => (
              <div key={`top-${game.id}`} className="rank-card" onClick={() => handleLaunchGame(game)}>
                
                {/* ตัวเลข SVG ลอยด้านหน้าการ์ด */}
                <div className="rank-number-svg">
                  <svg width="70" height="85" viewBox="0 0 70 85">
                    <text x="50%" y="55%" dominantBaseline="central" textAnchor="middle" fill="#0a0a14" stroke="#1298FF" strokeWidth="3" fontSize="80" fontWeight="900" fontFamily="Arial, sans-serif" paintOrder="stroke">
                      {i + 1}
                    </text>
                  </svg>
                </div>

                {/* กล่องรูปภาพเกม */}
                <div className="rank-img-wrapper">
                  {game.image_url && <img src={game.image_url} className="rank-glow" alt="" />}
                  {game.image_url ? (
                    <img src={game.image_url} className="rank-main-img" alt={game.game_name} loading="lazy" />
                  ) : (
                    <div className="rank-no-img">No Image</div>
                  )}
                  <div className="rank-provider-badge">
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>{game.product_id}</span>
                  </div>
                </div>

                {/* ชื่อเกมด้านล่าง */}
                <div className="rank-title">{game.game_name_th || game.game_name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 10 ค่ายเกมสล็อต ปล่อยแรกแตก - ปรับสไตล์ใหม่ให้เหมือนโซน PG */}
<div style={{ marginBottom: "24px" }}>
  {/* ส่วนหัวข้อ Highlight ใหม่ */}
  <div style={{
    background: "linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(26, 26, 46, 0) 100%)",
    padding: "12px 20px",
    borderLeft: "4px solid #f59e0b",
    borderRadius: "8px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "16px",
    marginRight: "16px"
  }}>
    <span style={{ fontSize: "1.2rem" }}>🚀</span>
    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#f59e0b", margin: 0 }}>10 ค่ายเกมสล็อต ปล่อยแรกแตก!!!</h3>
  </div>
  
  {/* ใช้ Class rank-scroll-container เพื่อให้เลื่อนได้แบบเดียวกัน */}
  <div className="rank-scroll-container">
    {products.slice(0, 10).map((p, i) => {
      const pGames = allGames.filter((g) => g.product_id === p);
      const firstImg = pGames.find((g) => g.image_url);
      return (
        <div key={`provider-${p}`} className="rank-card" onClick={() => { setSelectedProduct(p); setSelectedCategory(""); fetchGames(p); }}>
          
          {/* ตัวเลข Rank (ใช้สีส้มให้เข้ากับค่ายเกม) */}
          <div className="rank-number-svg">
            <svg width="70" height="85" viewBox="0 0 70 85">
              <text x="50%" y="55%" dominantBaseline="central" textAnchor="middle" fill="#0a0a14" stroke="#f59e0b" strokeWidth="3" fontSize="80" fontWeight="900" fontFamily="Arial, sans-serif" paintOrder="stroke">
                {i + 1}
              </text>
            </svg>
          </div>

          {/* กล่องรูปภาพ (ใช้สไตล์ rank-img-wrapper เดิม) */}
          <div className="rank-img-wrapper">
             {firstImg?.image_url ? (
               <img src={firstImg.image_url} className="rank-main-img" alt={p} loading="lazy" />
             ) : (
               <div className="rank-no-img">{p.charAt(0)}</div>
             )}
             <div className="rank-provider-badge">
               <span style={{ fontSize: "9px", fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>{pGames.length} เกม</span>
             </div>
          </div>

          {/* ชื่อค่าย */}
          <div className="rank-title">{p}</div>
        </div>
      );
    })}
  </div>
</div>

        {/* Tab Menu */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "highlight", label: "ไฮไลท์", href: "" },
            { id: "promotion", label: "โปรโมชันแนะนำ", href: "/promotions" },
            { id: "event", label: "กิจกรรม", href: "/promotions" },
            { id: "news", label: "ข่าวสาร", href: "/history" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.href) router.push(tab.href); }} style={{
              height: "34px", padding: "0 20px", borderRadius: "6px", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap",
              fontSize: "0.8rem", fontWeight: 700, transition: "all 0.2s",
              background: activeTab === tab.id ? "linear-gradient(165deg, #e62200, #ff0000)" : "transparent",
              color: activeTab === tab.id ? "white" : "#f62a00",
              boxShadow: activeTab === tab.id ? "0 0 7.5px rgba(255,4,4,0.5)" : "none",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Layout: Sidebar + Games */}
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>

          {/* Sidebar */}
          <GameSidebar selected={selectedCategory} onSelect={handleCategoryFilter} categories={gameCategories} />

          {/* Games Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            
            {/* Section Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "white", margin: 0 }}>
                {selectedCategory || selectedProduct || "เกมทั้งหมด"}
                <span style={{ color: "#4a5568", fontWeight: 500, fontSize: "0.75rem", marginLeft: "6px" }}>({games.length})</span>
              </h2>
            </div>

            {/* Games Grid */}
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ background: "#14142a", borderRadius: "12px", aspectRatio: "3/4" }} />
                ))}
              </div>
            ) : games.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ color: "#4a5568", fontSize: "0.9rem", fontWeight: 600 }}>ไม่พบเกม</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
                {games.map((game) => (
                  <div key={game.id} onClick={() => handleLaunchGame(game)} style={{ cursor: "pointer", position: "relative", overflow: "visible" }}>
                    
                    {/* รูปเกม มุมโค้ง */}
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
                      {/* ชื่อค่ายมุมล่าง */}
                      {/* ชื่อค่าย + gradient ด้านล่าง */}
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "20px 8px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#f59e0b" }} />
                        <span style={{ fontSize: "0.55rem", color: "#f59e0b", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{game.product_id}</span>
                        <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#f59e0b" }} />
                      </div>
                    </div>

                    {/* ชื่อเกม ลอยด้านล่าง (ไม่มีกรอบ) */}
                    <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#e2e8f0", margin: "6px 0 0", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {game.game_name_th || game.game_name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Hot Games Section */}
            {!selectedProduct && !selectedCategory && games.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", margin: 0 }}>
                    เกมแนะนำ 
                  </h2>
                  <span style={{ background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.5px", boxShadow: "0 2px 10px rgba(245,158,11,0.2)" }}>
                    HOT 🔥
                  </span>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "14px" }}>
                  {games.slice(0, 8).map((game) => (
                    <div 
                      key={`hot-${game.id}`} 
                      onClick={() => handleLaunchGame(game)} 
                      style={{ background: "#121214", borderRadius: "14px", border: "1px solid rgba(245,158,11,0.2)", overflow: "visible", position: "relative", cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(245,158,11,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      
                      {/* ไอคอนเกมแตก ย้ายมาไว้ระดับนี้เพื่อให้ทะลุกรอบขวาบนได้เต็มที่ */}
                      {game.id % 3 === 0 && (
                        <img 
                          src="https://kingwin88.live/storage/images/wallet/hot.gif" 
                          alt="เกมแตก" 
                          style={{ position: "absolute", top: "-18px", right: "-16px", width: "56px", height: "56px", zIndex: 30, pointerEvents: "none" }} 
                        />
                      )}

                      <div style={{ width: "100%", paddingBottom: "125%", background: "#1a1a2e", position: "relative", overflow: "hidden", borderTopLeftRadius: "14px", borderTopRightRadius: "14px" }}>
                        
                        {game.image_url ? (
                          <img 
                            src={game.image_url} 
                            alt={game.game_name} 
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} 
                            loading="lazy" 
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"} 
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} 
                          />
                        ) : (
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", fontSize: "0.75rem" }}>No Image</div>
                        )}
                        <div style={{ position: "absolute", top: "8px", left: "8px", background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", fontSize: "0.6rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.5)", zIndex: 10 }}>ยอดฮิต</div>
                      </div>
                      
                      <div style={{ padding: "12px 10px" }}>
                        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e4e4e7", margin: "0 0 6px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {game.game_name_th || game.game_name}
                        </p>
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "3px 8px", borderRadius: "6px" }}>
                          {game.product_id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {/* 🔴 หัวใจสำคัญคือตรงนี้ครับ CSS ที่จะจัดหน้าให้ตรงตามภาพเป๊ะๆ 🔴 */}
      <style dangerouslySetInnerHTML={{__html: `
        /* สไตล์ 10 อันดับเกมมาแรง */
        .rank-scroll-container {
          display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none;
          padding: 10px 16px 20px 32px; 
        }
        .rank-scroll-container::-webkit-scrollbar { display: none; }

        .rank-card { position: relative; width: 126px; flex-shrink: 0; cursor: pointer; margin-left: 30px; overflow: visible; }

        .rank-img-wrapper {
          position: relative; width: 100%; padding-bottom: 142.857%; 
          border-radius: 8px; background: #121214; overflow: hidden;
          z-index: 1; transition: transform 0.3s ease;
          clip-path: none;
        }
        .rank-card:hover .rank-img-wrapper { transform: translateY(-4px); }

        .rank-glow {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; filter: blur(12px) brightness(0.6); transform: scale(1.25);
        }

        .rank-main-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: contain; transition: transform 0.3s ease;
        }
        .rank-card:hover .rank-main-img { transform: scale(1.05); }

        .rank-no-img {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          color: #71717a; font-size: 0.75rem; font-weight: 500;
        }

        .rank-provider-badge {
          position: absolute; bottom: 0; left: 0; right: 0; height: 20%;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 6px; pointer-events: none;
        }

        .rank-number-svg {
          position: absolute; bottom: 22px; left: -32px; z-index: 50; pointer-events: none;
          filter: drop-shadow(4px 4px 6px rgba(0,0,0,0.95));
        }

        .rank-title {
          text-align: center; font-size: 12px; color: #fafafa; margin-top: 8px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* สไตล์ 10 ค่ายเกมสล็อต ปล่อยแรกแตก */
        .provider-card { min-width: 90px; flex-shrink: 0; cursor: pointer; text-align: center; }
        .provider-img-box {
          width: 90px; height: 90px; border-radius: 12px; overflow: hidden; position: relative;
          border: 2px solid rgba(245,158,11,0.2); transition: all 0.3s ease; background: #121214;
        }
        .provider-card:hover .provider-img-box { border-color: #f59e0b; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(245,158,11,0.2); }
        .provider-img-box img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .provider-no-img { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #f59e0b; font-size: 1.2rem; font-weight: 800; }
        .provider-count { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.9)); padding: 4px; }
        .provider-count span { font-size: 0.55rem; font-weight: 700; color: white; }
        .provider-name { font-size: 0.65rem; font-weight: 700; color: #e4e4e7; margin: 6px 0 0; }
        
        /* สไตล์ Game Card ทั่วไป */
        .game-card { position: relative; background: #14142a; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.3s ease; }
        .game-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
        .game-overlay { position: absolute; top: 0; left: 0; right: 0; aspect-ratio: 1/1; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
        .game-card:hover .game-overlay { opacity: 1; }
      
        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.1; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.15 !important; }
          85% { opacity: 0.1; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }
      `}} />
      </div>
    </div>
  );
}