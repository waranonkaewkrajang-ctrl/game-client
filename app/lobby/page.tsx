"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
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
  const [productImages, setProductImages] = useState<Record<string, any>>({});
  const [gameCategories, setGameCategories] = useState<{id: string; label: string; count: number}[]>([]);

  // 🟢 เพิ่ม 2 บรรทัดนี้เข้าไป เพื่อให้ระบบรู้จัก currentBanner 🟢
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // หมวดที่ต้องเข้าห้องค่ายก่อน (ไม่เปิดเกมตรง)
  const ROOM_CATEGORIES = ["SLOT", "EGAMES", "SLOTS"];
  const isRoomMode = false;

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }
    
    api.get("/games/products").then((res) => { if (res.data.status === "success") setProducts(res.data.data || []); }).catch(() => {});
    
    // 🟢 ดึงข้อมูลแบนเนอร์จากหลังบ้าน 🟢
    api.get("/banners").then((res) => {
      if (res.data.status === "success") {
        setBanners(res.data.data || []);
      }
    }).catch(() => {
      setBanners([{ image_url: "/banner.jpg" }]); // ถ้าโหลดไม่ติด ใช้รูป default
    });

    fetchGames();
  }, []);

  useEffect(() => {
    api.get("/games/product-images").then((res) => {
      if (res.data.status === "success") setProductImages(res.data.data || {});
    }).catch(() => {});
  }, []);

  const loopBanners = banners.length > 1
    ? [banners[banners.length - 1], ...banners, banners[0], banners[1]]
    : banners;
  const slideOffset = banners.length > 1 ? 1 : 0; // เริ่มที่ตำแหน่ง 1 (ข้ามตัว clone แรก)

  useEffect(() => {
    if (banners.length <= 1) return;
    // เริ่มที่ตำแหน่ง 1 (ตัวจริงตัวแรก)
    setCurrentBanner(slideOffset);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentBanner((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  // พอเลื่อนถึง clone ตัวสุดท้าย → กระโดดกลับไปตัวจริงแบบไม่มี animation
  useEffect(() => {
    if (currentBanner >= loopBanners.length - 2) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentBanner(slideOffset);
      }, 500);
    }
  }, [currentBanner]);

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
      <div style={{ maxWidth: "100%", width: "100%", margin: "0", padding: "16px 24px" }}>

        {/* Banner (อัปเดตใหม่ ล็อกสัดส่วนแนวนอนแก้ภาพยืด 100%) */}
        <div className="banner-main-wrapper" style={{ marginBottom: "14px", position: "relative", overflow: "visible" }}>
          <div style={{ overflow: "hidden", borderRadius: "12px" }}>
            <div className="hero-banner-track" style={{
              display: "flex",
              alignItems: "center", /* 🔴 จุดสำคัญ: ป้องกันสไลเดอร์ยืดความสูงภาพเอง */
              transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
              transform: `translateX(calc((-${currentBanner} + var(--banner-offset, 0)) * var(--bw)))`,
            }}>
              {loopBanners.map((banner, index) => {
                const realIndex = (index - slideOffset + banners.length) % banners.length;
                const isCenter = index === currentBanner;
                return (
                  <Link href="/promotions" key={index} className="hero-banner-item" style={{
                    transform: isCenter ? "scale(1)" : "scale(0.95)",
                    opacity: isCenter ? 1 : 0.5,
                  }}>
                    <img
                      src={banner.image_url || banner.image || banner || "/banner.jpg"}
                      alt={`Banner ${realIndex + 1}`}
                      className="hero-banner-img"
                      onError={(e) => e.currentTarget.src = "/banner.jpg"}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ปุ่มจุดไข่ปลา (Dots) */}
          {banners.length > 1 && (
            <div style={{ position: "absolute", bottom: "12px", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "6px", zIndex: 10 }}>
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.preventDefault(); setIsTransitioning(true); setCurrentBanner(index + slideOffset); }}
                  style={{
                    width: ((currentBanner - slideOffset + banners.length) % banners.length) === index ? "20px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: ((currentBanner - slideOffset + banners.length) % banners.length) === index ? "#f59e0b" : "rgba(255,255,255,0.5)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 📱 เมนูหมวดหมู่สำหรับมือถือ (แสดงเฉพาะหน้าจอเล็ก / ซ่อนบนคอม) 📱 */}
        <div className="mobile-only" style={{ marginBottom: "20px" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "10px" 
          }}>
            {[
              { id: "", label: "ยอดนิยม", icon: "https://odin996.com/theme_1/img/ic-nav-menu-hot-game.png" },
              { id: "LIVECASINO", label: "คาสิโน", icon: "https://odin996.com/theme_1/img/icons8-cards-48.png" },
              { id: "SLOT", label: "สล็อต", icon: "https://odin996.com/theme_1/img/ic-nav-menu-slot.png" },
              { id: "FISHING", label: "ยิงปลา", icon: "https://odin996.com/theme_1/img/ic-nav-menu-fishing-game.png" },
              { id: "CARD", label: "เกมไพ่", icon: "https://odin996.com/theme_1/img/ic-nav-menu-casino.png" },
              { id: "SPORT", label: "กีฬา", icon: "https://odin996.com/theme_1/img/ic-nav-menu-sport.png" },
              { id: "LOTTO", label: "หวย", icon: "https://odin996.com/theme_1/img/ic-nav-menu-lotto.png" },
              { id: "SKILL", label: "สกิล", icon: "https://odin996.com/theme_1/img/ic-nav-menu-skill-game.png" },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <div 
                  key={`mob-cat-${cat.id}`}
                  onClick={() => handleCategoryFilter(cat.id)}
                  style={{
                    background: isActive ? "linear-gradient(135deg, #aa00a0, #4b0082)" : "#14142a",
                    border: isActive ? "2px solid #ffb300" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "10px 4px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                    boxShadow: isActive ? "0 4px 15px rgba(170,0,160,0.4)" : "0 4px 10px rgba(0,0,0,0.3)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <img 
                    src={cat.icon} 
                    alt={cat.label} 
                    style={{ width: "36px", height: "36px", objectFit: "contain" }} 
                  />
                  <span style={{ 
                    fontSize: "0.7rem", 
                    fontWeight: 700, 
                    color: isActive ? "#ffffff" : "#d1d5db",
                    textAlign: "center",
                    whiteSpace: "nowrap" 
                  }}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
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
            <div style={{ width: "70%", display: "flex", alignItems: "center", gap: "24px", overflowX: "auto", scrollbarWidth: "none", padding: "10px 10px 20px 24px" }}>
              {allGames.slice(0, 6).map((game, i) => (
                <div key={`highlight-${game.id}`} className="rank-card" onClick={() => handleLaunchGame(game)}>
                  
                  {/* 🔴 แก้จุดนี้: ปรับ bottom ให้ดันขึ้นไปทับรูปภาพ และขยายขนาดตัวเลขให้เท่าโซน PG */}
                  <div className="rank-number-svg" style={{ left: "-28px", bottom: "26px" }}>
                    <svg width="70" height="85" viewBox="0 0 70 85">
                      <text x="50%" y="55%" dominantBaseline="central" textAnchor="middle" fill="#0a0a14" stroke="#1298FF" strokeWidth="3" fontSize="80" fontWeight="900" fontFamily="Arial, sans-serif" paintOrder="stroke">
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
    {/* 🔴 แทนที่จรวดด้วยรูป GIF ไฟ (ปรับขนาด width/height ให้พอดีกับตัวอักษร) */}
    <img 
      src="https://kingwin88.live/storage/images/wallet/hot.gif" 
      alt="Hot" 
      style={{ width: "35px", height: "35px", objectFit: "contain", margin: "-8px 0" }} 
    />
    <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#f59e0b", margin: 0 }}>10 ค่ายเกมสล็อต ปล่อยแรกแตก!!!</h3>
  </div>
  
  {/* ใช้ Class rank-scroll-container เพื่อให้เลื่อนได้แบบเดียวกัน */}
  <div className="rank-scroll-container">
    {products.slice(0, 10).map((p, i) => {
      const pGames = allGames.filter((g) => g.product_id === p);
      const firstImg = pGames.find((g) => g.image_url);
      return (
        <div key={`provider-${p}`} className="rank-card" onClick={() => router.push(`/lobby/${p}`)}>
          
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
             {productImages[p]?.image_url || firstImg?.image_url ? (
               <img src={productImages[p]?.image_url || firstImg?.image_url} className="rank-main-img" alt={p} loading="lazy" />
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

          {/* Sidebar (แท็บข้างสไตล์ใหม่ - โชว์เฉพาะบนคอมพิวเตอร์) */}
          <div className="desktop-only" style={{ 
            width: "250px", 
            flexShrink: 0,
            background: "#14142a", /* พื้นหลังกล่องครอบ */
            borderRadius: "16px",
            padding: "16px",
            position: "sticky", 
            top: "80px", /* ระยะห่างจากด้านบนตอนเลื่อนจอ */
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.05)"
          }}>
            <ul className="nav nav-pills js-menu-container -nav-menu-container" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: 0, margin: 0, listStyle: "none" }}>
              
              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-0 ${selectedCategory === "" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter(""); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-hot-game.png" alt="ยอดนิยม" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>HOT GAME</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>ยอดนิยม</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-1 ${selectedCategory === "LIVECASINO" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("LIVECASINO"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "LIVECASINO" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/icons8-cards-48.png" alt="คาสิโนสด" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>CASINO</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>คาสิโนสด</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-2 ${selectedCategory === "SLOT" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("SLOT"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "SLOT" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-slot.png" alt="สล็อตเกมส์" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>SLOT</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>สล็อตเกมส์</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-3 ${selectedCategory === "FISHING" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("FISHING"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "FISHING" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-fishing-game.png" alt="ยิงปลา" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>FISHING</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>ยิงปลา</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-4 ${selectedCategory === "CARD" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("CARD"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "CARD" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-casino.png" alt="เกมไพ่" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>CARD</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>เกมไพ่</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-5 ${selectedCategory === "SPORT" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("SPORT"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "SPORT" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-sport.png" alt="กีฬา" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>SPORT</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>กีฬา</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-6 ${selectedCategory === "LOTTO" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("LOTTO"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "LOTTO" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-lotto.png" alt="หวย ล็อตเตอรี่" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>LOTTO</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>หวย ล็อตเตอรี่</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-7 ${selectedCategory === "SKILL" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("SKILL"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "SKILL" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-skill-game.png" alt="สกิลเกมส์" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>SKILL</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>สกิลเกมส์</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-8 ${selectedCategory === "TRADE" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("TRADE"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "TRADE" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-trade-game.png" alt="เทรด" className="img-fluid -ic-menu" width="55" height="55" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>TRADE</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>เทรด</div>
                  </div>
                </a>
              </li>

            </ul>
          </div>

          {/* Games Area */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ===== โหมด 2: เลือกหมวดสล็อต → แสดงรายการค่ายเกม ===== */}
            {isRoomMode ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "white", margin: 0 }}>
                    เลือกค่ายเกม
                  </h2>
                  <span style={{ color: "#4a5568", fontWeight: 500, fontSize: "0.75rem" }}>({products.length} ค่าย)</span>
                </div>

    
                {/* Provider Room Cards */}
               <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }} className="provider-grid-container">
                  {products.map((p) => {
                    const pGames = allGames.filter((g) => g.product_id === p);
                    const slotGames = pGames.filter((g) => ROOM_CATEGORIES.includes((g.category || g.type || "").toUpperCase()));
                    // แสดงเฉพาะค่ายที่มีเกมสล็อต
                    if (slotGames.length === 0 && pGames.length === 0) return null;
                    const firstImg = pGames.find((g) => g.image_url);
                    return (
                      <div 
                        key={`room-${p}`} 
                        onClick={() => router.push(`/lobby/${p}`)}
                        className="theme1-thumb-frame is-loading"
                        style={{ 
                          cursor: "pointer", 
                          overflow: "hidden", 
                          borderRadius: "14px", 
                          background: "#121214",
                          position: "relative",
                          border: "2px solid rgba(170, 0, 160, 0.15)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = "translateY(-4px)"; 
                          e.currentTarget.style.borderColor = "#aa00a0"; 
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(170, 0, 160, 0.35)"; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = ""; 
                          e.currentTarget.style.borderColor = "rgba(170, 0, 160, 0.15)"; 
                          e.currentTarget.style.boxShadow = ""; 
                        }}
                      >
                        {/* รูปค่ายเกม */}
                        <img 
                          data-src={productImages[p]?.image_url || firstImg?.image_url} 
                          src={productImages[p]?.image_url || firstImg?.image_url} 
                          className="-cover-img img-fluid" 
                          alt={p} 
                          loading="lazy" 
                          decoding="async" 
                          width="255" 
                          height="255"
                          style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                          onLoad={(e) => {
                            const c = e.currentTarget.closest('.theme1-thumb-frame');
                            if (c) {
                              c.classList.remove('is-loading');
                              c.classList.remove('is-fallback');
                            }
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-provider.png"; 
                            const c = e.currentTarget.closest('.theme1-thumb-frame');
                            if (c) {
                              c.classList.remove('is-loading');
                              c.classList.add('is-fallback');
                            }
                          }}
                        />

                        {/* 🟢 ปุ่มเข้าเล่นแบบซ่อนไว้ และจะโผล่มาตรงกลางเมื่อเอาเมาส์ชี้ 🟢 */}
                        <div 
                          style={{
                            position: "absolute",
                            inset: "0", /* คลุมทับเต็มรูป */
                            background: "rgba(0, 0, 0, 0.45)", /* ฉากหลังมืดลงนิดหน่อยเพื่อให้ปุ่มเด่นขึ้น */
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            opacity: 0, /* ซ่อนปุ่มไว้ตอนปกติ */
                            transition: "opacity 0.3s ease" /* ความนุ่มนวลเวลาfade in/out */
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                        >
                          <div style={{
                            background: "linear-gradient(to right, #aa00a0, #4b0082)",
                            border: "1px solid #f59e0b",
                            color: "white",
                            padding: "8px 22px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 4px 15px rgba(170, 0, 160, 0.8)",
                            transform: "scale(0.95)",
                            transition: "transform 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            เข้าเล่น
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>

            /* ===== โหมด 3: หน้าปกติ (Lobby / หมวดอื่น) → เปิดเกมได้โดยตรง ===== */
            ) : (
              <>
                {/* Section Title */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "white", margin: 0 }}>
                    {selectedCategory || selectedProduct || "เกมทั้งหมด"}
                    <span style={{ color: "#4a5568", fontWeight: 500, fontSize: "0.75rem", marginLeft: "6px" }}>({games.length})</span>
                  </h2>
                </div>

                {/* Games Grid */}
                {loading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }} className="game-grid-container">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} style={{ background: "#14142a", borderRadius: "12px", aspectRatio: "3/4" }} />
                    ))}
                  </div>
                ) : games.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <p style={{ color: "#4a5568", fontSize: "0.9rem", fontWeight: 600 }}>ไม่พบเกม</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "10px" }} className="game-grid-container">
                    {games.map((game) => (
                      <div 
                        key={game.id} 
                        onClick={() => handleLaunchGame(game)} 
                        className="theme1-thumb-frame is-loading"
                        style={{ 
                          cursor: "pointer", 
                          position: "relative", 
                          overflow: "hidden", 
                          borderRadius: "14px", 
                          background: "#121214",
                          border: "2px solid rgba(170, 0, 160, 0.15)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = "translateY(-4px)"; 
                          e.currentTarget.style.borderColor = "#aa00a0"; 
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(170, 0, 160, 0.35)"; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = ""; 
                          e.currentTarget.style.borderColor = "rgba(170, 0, 160, 0.15)"; 
                          e.currentTarget.style.boxShadow = ""; 
                        }}
                      >
                        {/* รูปเกม */}
                        <div style={{ width: "100%", aspectRatio: "1/1", position: "relative", overflow: "hidden" }}>
                          {game.image_url ? (
  <img 
    src={game.image_url} 
    alt={game.game_name} 
    className="-cover-img img-fluid"
    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
    loading="lazy"
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/default-provider.png"; // หรือเปลี่ยนเป็นรูป placeholder ของเกม
    }} 
  />
) : (
  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", fontSize: "0.75rem" }}>No Image</div>
)}

                          {/* ป้ายบอกค่ายเกมมุมล่าง */}
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "15px 8px 6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", pointerEvents: "none" }}>
                            <span style={{ fontSize: "0.6rem", color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>{game.product_id}</span>
                          </div>

                          {/* ปุ่มเข้าเล่นตรงกลาง แสดงเฉพาะตอนเอาเมาส์ชี้ */}
                          <div 
                            style={{
                              position: "absolute",
                              inset: "0",
                              background: "rgba(0, 0, 0, 0.45)",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              opacity: 0,
                              transition: "opacity 0.3s ease"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                          >
                            <div style={{
                              background: "linear-gradient(to right, #aa00a0, #4b0082)",
                              border: "1px solid #f59e0b",
                              color: "white",
                              padding: "6px 18px",
                              borderRadius: "20px",
                              fontSize: "0.8rem",
                              fontWeight: 800,
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 4px 15px rgba(170, 0, 160, 0.8)",
                              transform: "scale(0.95)",
                              transition: "transform 0.3s ease"
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              เข้าเล่น
                            </div>
                          </div>
                        </div>

                        {/* ชื่อเกมด้านล่าง */}
                        <div style={{ padding: "8px 6px", textAlign: "center", background: "#121214" }}>
                          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {game.game_name_th || game.game_name}
                          </p>
                        </div>
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
          </>
          )}
          </div>
        </div>

        {/* 🟢 แท็บเมนูด้านล่าง (Bottom Menu) แบบใหม่ (โชว์เฉพาะมือถือ) 🟢 */}
        <div className="-outer-wrapper mobile-only">
          {/* พื้นหลังสีม่วงที่มีรอยแหว่งเว้าตรงกลาง */}
          <div className="-bg-bar"></div>

          <div className="-left-wrapper">
            <a href="https://line.me/R/ti/p/@ODIN996" className="-item-wrapper -line" target="_blank" rel="noopener noreferrer nofollow">
              <img src="https://odin996.com/theme_1/img/footer-menu-ic-left-1.png" className="-ic-img" alt="Line" />
              <span className="-text">Line</span>
            </a>
            <Link href="/promotions" className="-item-wrapper -promotion">
              <img src="https://odin996.com/theme_1/img/footer-menu-ic-left-2.png" className="-ic-img" alt="โปรโมชั่น" />
              <span className="-text">โปรโมชัน</span>
            </Link>
          </div>

          <Link href="/" className="-center-wrapper" aria-label="หน้าแรก">
            <div className="-selected">
              {/* โลโก้ตรงกลางปุ่ม */}
              <img src="https://odin996.com/theme_1/img/logo.png" alt="Odin996" className="-center-icon" onError={(e) => e.currentTarget.style.display='none'} />
              <span className="-text">หน้าแรก</span>
            </div>
          </Link>

          <div className="-right-wrapper">
            <Link href="/deposits" className="-item-wrapper -deposit">
              <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-1.png" className="-ic-img" alt="ฝากเงิน" />
              <span className="-text">ฝากเงิน</span>
            </Link>
            <Link href="/withdrawals" className="-item-wrapper -withdraw">
              <img src="https://odin996.com/theme_1/img/footer-menu-ic-right-2.png" className="-ic-img" alt="ถอนเงิน" />
              <span className="-text">ถอนเงิน</span>
            </Link>
          </div>
        </div>

      {/* 🔴 หัวใจสำคัญคือตรงนี้ครับ CSS ที่จะจัดหน้าให้ตรงตามภาพเป๊ะๆ 🔴 */}
      <style dangerouslySetInnerHTML={{__html: `
        /* 🟢 สไตล์แบนเนอร์ (เปลี่ยนชื่อคลาสใหม่หนีแคชมือถือ) 🟢 */
        .hero-banner-track { --bw: 100%; }
        @media (min-width: 768px) { .hero-banner-track { --bw: 33.333%; } }

        /* 🟢 บังคับจำนวนคอลัมน์ (มือถือ 3, คอม 4) ตามที่คุณต้องการ 🟢 */
        .provider-grid-container, .game-grid-container {
          grid-template-columns: repeat(3, 1fr) !important;
        }

        @media (min-width: 768px) {
          .provider-grid-container, .game-grid-container {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 14px !important;
          }
        }
        
        .hero-banner-item {
          min-width: var(--bw);
          flex-shrink: 0;
          padding: 0 4px;
          transition: transform 0.4s ease, opacity 0.4s ease;
        }
        
        .hero-banner-img {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
        }

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

        /* 🟢 สไตล์ของเมนูด้านล่าง (ปรับเป็นสีม่วง + รอยเว้าตรงกลางแบบเป๊ะๆ) 🟢 */
        .-outer-wrapper { 
          position: fixed; bottom: 0; left: 0; width: 100%; height: 75px; 
          z-index: 1000; filter: drop-shadow(0 -4px 10px rgba(0,0,0,0.5)); 
        }
        
        .-bg-bar {
          position: absolute; bottom: 0; left: 0; width: 100%; height: 65px;
          background: linear-gradient(to bottom, #aa00a0, #2b002b);
          border-top-left-radius: 16px; border-top-right-radius: 16px;
          /* โค้ดตัดขอบเว้าตรงกลางให้พอดีกับปุ่ม (U-Shape Cutout) */
          mask-image: radial-gradient(circle 42px at 50% 0%, transparent 42px, black 43px);
          -webkit-mask-image: radial-gradient(circle 42px at 50% 0%, transparent 42px, black 43px);
        }

        .-left-wrapper, .-right-wrapper {
          position: absolute; bottom: 0; width: 42%; height: 65px; display: flex;
          justify-content: space-evenly; align-items: center; z-index: 10;
        }
        .-left-wrapper { left: 0; }
        .-right-wrapper { right: 0; }

        .-item-wrapper { 
          display: flex; flex-direction: column; align-items: center; 
          text-decoration: none; gap: 4px; cursor: pointer; transition: transform 0.2s ease; 
        }
        .-item-wrapper:hover { transform: translateY(-3px); }
        .-ic-img { width: 30px; height: 30px; object-fit: contain; }
        .-item-wrapper .-text { 
          color: #ffffff; font-size: 0.75rem; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); 
        }

        .-center-wrapper { 
          position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); 
          z-index: 20; display: flex; justify-content: center; align-items: center; text-decoration: none; 
        }
        
        .-selected {
          position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center;
          width: 76px; height: 76px; 
          background: radial-gradient(circle at 50% 20%, #ffdf00, #ff8c00 50%, #cc3300); 
          border-radius: 50%;
          box-shadow: 0 5px 10px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.7);
          border: 2px solid #ffb300;
        }
        .-center-icon { width: 42px; height: 42px; object-fit: contain; margin-bottom: -2px; }
        .-selected .-text { color: #ffffff; font-size: 0.75rem; font-weight: 800; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); }

        /* 🟢 โค้ดแบ่งการแสดงผล (Responsive Design) 🟢 */
        /* ค่าเริ่มต้น (หน้าจอมือถือ) */
        .desktop-only { display: none; }
        .mobile-only { display: block; }
        
        /* เมื่อหน้าจอใหญ่กว่า 1024px (หน้าจอคอมพิวเตอร์/แท็บเล็ตแนวนอน) */
           @media (min-width: 1024px) {
          .desktop-only { display: block; }
          .mobile-only { display: none; }
          .-outer-wrapper { display: none !important; } /* สั่งซ่อนแท็บล่างเด็ดขาดบนคอม */
        }
      `}} />
      </div>
    </div>
  );
}