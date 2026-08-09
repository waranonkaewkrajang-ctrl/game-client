"use client";
import { useEffect, useState, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [productImages, setProductImages] = useState<Record<string, any>>({});
  const [gameCategories, setGameCategories] = useState<{id: string; label: string; count: number}[]>([]);

  // 🟢 เพิ่ม 2 บรรทัดนี้เข้าไป เพื่อให้ระบบรู้จัก currentBanner 🟢
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // === Auto-slide rank carousel ===
  const [activeRank, setActiveRank] = useState(0);
  const rankScrollRef = useRef<HTMLDivElement>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const total = Math.min(products.length, 10);
    if (total === 0) return;
    const interval = setInterval(() => {
      setActiveRank((prev) => {
        const next = (prev + 1) % total;
        if (rankScrollRef.current) {
          const card = rankScrollRef.current.children[next] as HTMLElement;
          if (card) {
            rankScrollRef.current.scrollTo({
              left: card.offsetLeft - rankScrollRef.current.offsetWidth / 2 + card.offsetWidth / 2,
              behavior: "smooth",
            });
          }
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [products]);

  // หมวดที่ต้องเข้าห้องค่ายก่อน (ไม่เปิดเกมตรง)
  const ROOM_CATEGORIES = ["SLOT", "EGAMES", "SLOTS"];
  const isRoomMode = ROOM_CATEGORIES.includes(selectedCategory.toUpperCase());

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

  // Auto slide เกมยอดนิยม
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let scrollPos = 0;
    const speed = 1;
    const interval = setInterval(() => {
      scrollPos += speed;
      if (scrollPos >= el.scrollWidth - el.clientWidth) scrollPos = 0;
      el.scrollLeft = scrollPos;
    }, 30);
    const handleTouch = () => { clearInterval(interval); };
    el.addEventListener("touchstart", handleTouch);
    el.addEventListener("mousedown", handleTouch);
    return () => { clearInterval(interval); el.removeEventListener("touchstart", handleTouch); el.removeEventListener("mousedown", handleTouch); };
  }, [allGames]);

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

  const categoryMap: Record<string, string[]> = {
    "SLOT": ["SLOT", "SLOTS", "EGAMES"],
    "LIVECASINO": ["LIVECASINO", "LIVE", "CASINO"],
    "FISHING": ["FISHING", "FISH"],
    "CARD": ["CARD", "TABLE"],
    "SPORT": ["SPORT", "SPORTS", "ESPORT"],
  };

  const handleCategoryFilter = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedProduct("");
    if (!catId) {
      setGames(allGames);
    } else {
      const matches = categoryMap[catId] || [catId];
      setGames(allGames.filter((g) => {
        const cat = (g.category || "").toUpperCase();
        const typ = (g.type || "").toUpperCase();
        return matches.some((m) => cat === m || typ === m);
      }));
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
  <div style={{ minHeight: "100vh", background: "transparent", paddingBottom: "0px", position: "relative", overflow: "hidden" }}>
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

      {/* 📱 เมนูหมวดหมู่สำหรับมือถือ (ดีไซน์พรีเมียมระดับมืออาชีพ) 📱 */}
        <div className="mobile-only" style={{ 
          position: "sticky",         /* 📌 ล็อกเมนูให้เลื่อนตามเวลาไถจอ */
          top: "0px",                 /* 📌 ให้ล็อกติดขอบบนสุด (ถ้ามี Header ให้บวก px เพิ่มไป) */
          zIndex: 100,                /* 📌 ให้อยู่เหนือเนื้อหาอื่นๆ */
          background: "#0a0a14",      /* 📌 ใส่สีพื้นหลังทึบ เพื่อไม่ให้โปร่งแสงลอยทับตัวหนังสือ (ทำหน้าที่เหมือนแยก Section) */
          padding: "12px 24px",       /* 📌 จัดระยะห่างภายใน */
          margin: "0 -24px 20px -24px", /* 📌 ขยายกรอบซ้ายขวาให้ชิดขอบจอพอดี */
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)" /* 📌 เส้นกั้นบางๆ ด้านล่างให้ดูมีมิติแยกส่วนชัดเจน */
        }}>
          <div style={{ 
            display: "flex",          /* 📌 เปลี่ยนเป็น Flex เพื่อให้ชิดซ้ายเสมอ */
            overflowX: "auto",        /* 📌 เปิดให้ปัดเลื่อนซ้าย-ขวาได้ */
            gap: "10px", 
            scrollbarWidth: "none",   /* 📌 ซ่อน Scrollbar ของ Firefox */
            paddingBottom: "4px"
          }} 
          className="hide-scrollbar"  /* 📌 ซ่อน Scrollbar ของ Chrome/Safari (ต้องไปใส่ CSS เพิ่มด้านล่าง) */
          >
            {[
              { id: "", label: "ยอดนิยม", icon: "https://odin996.com/theme_1/img/ic-nav-menu-hot-game.png" },
              { id: "LIVECASINO", label: "คาสิโน", icon: "https://odin996.com/theme_1/img/icons8-cards-48.png" },
              { id: "SLOT", label: "สล็อต", icon: "https://odin996.com/theme_1/img/ic-nav-menu-slot.png" },
              { id: "FISHING", label: "ยิงปลา", icon: "https://odin996.com/theme_1/img/ic-nav-menu-fishing-game.png" },
              { id: "CARD", label: "เกมไพ่", icon: "https://odin996.com/theme_1/img/ic-nav-menu-casino.png" },
              { id: "SPORT", label: "กีฬา", icon: "https://odin996.com/theme_1/img/ic-nav-menu-sport.png" },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <div 
                  key={`mob-cat-${cat.id}`}
                  onClick={() => handleCategoryFilter(cat.id)}
                  style={{
                    minWidth: "75px", /* 📌 บังคับขนาดขั้นต่ำให้ปุ่ม ไม่ให้บีบกันเอง */
                    flex: "0 0 auto", /* 📌 ป้องกันไม่ให้ปุ่มหดตัว */
                    background: isActive ? "linear-gradient(135deg, rgb(170, 0, 160), rgb(75, 0, 130))" : "rgba(20, 20, 42, 0.55)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    border: isActive ? "1px solid rgb(255, 179, 0)" : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    padding: "12px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    boxShadow: isActive 
                      ? "0 8px 20px rgba(170, 0, 160, 0.5), inset 0 2px 3px rgba(255, 255, 255, 0.25)" 
                      : "0 4px 10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                    transform: isActive ? "translateY(-3px) scale(1.03)" : "translateY(0) scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  <img 
                    src={cat.icon} 
                    alt={cat.label} 
                    style={{ 
                      width: "38px", 
                      height: "38px", 
                      objectFit: "contain", 
                      filter: isActive ? "drop-shadow(0 4px 8px rgba(255, 179, 0, 0.5))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                      transition: "transform 0.3s ease"
                    }} 
                  />
                  <span style={{ 
                    fontSize: "0.72rem", 
                    fontWeight: 700, 
                    color: isActive ? "#ffffff" : "#cbd5e1",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.3px",
                    fontFamily: "'Kanit', sans-serif",
                    textShadow: isActive ? "0 2px 4px rgba(0,0,0,0.8)" : "0 1px 2px rgba(0,0,0,0.5)" 
                  }}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🟢 นำเกมไฮไลท์ (กล่องแดง) มาวางตรงนี้ 🟢 */}
        <div style={{ marginBottom: "24px", background: "rgba(15, 10, 30, 0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden" }}>
          
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

          {/* Layout: สไลด์ซ้าย + Leaderboard ขวา */}
          <div className="highlight-layout" style={{ display: "flex", gap: "16px", alignItems: "stretch" }}>

            {/* ซ้าย: สไลด์ไฮไลท์ */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden", borderRadius: "12px", minWidth: 0 }}>
              <div style={{
                display: "flex",
                transition: "transform 0.5s ease-in-out",
                transform: `translateX(-${highlightIndex * 100}%)`,
              }}>
                {[
                  "https://cdn.zabbet.com/T6WF/highlight/1775292444078-1c48ef6e-5795-4eee-a7bf-24e6e0cd7603.webp",
                  "https://cdn.zabbet.com/T6WF/highlight/1775292485579-7ee0b7c4-1e20-4f31-84fb-66d0ac36c9a3.webp",
                  "https://cdn.zabbet.com/T6WF/highlight/1775292527041-6587d4ab-8b09-49d7-a0a3-3a6568123d16.webp",
                  "https://cdn.zabbet.com/T6WF/highlight/1775292564291-3510d3e2-4938-4771-8ecd-ee7893017078.webp",
                ].map((url, i) => (
                  /* 🟢 กล่องครอบ (คุมขนาด 100% ของสไลด์ และจัดรูปให้อยู่ตรงกลาง) */
                  <div key={`hl-${i}`} style={{ 
                    flex: "0 0 100%", 
                    width: "100%", 
                    height: "350px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    flexShrink: 0 
                  }}>
                    {/* 🟢 ตัวรูปภาพ (จะถูกตัดมุมมนได้พอดีกับตัวภาพเป๊ะๆ) */}
                    <img src={Math.abs(highlightIndex - i) <= 1 ? url : undefined} data-src={url} alt={`Highlight ${i + 1}`} loading="lazy"
                      style={{ 
                        maxWidth: "100%", 
                        maxHeight: "100%", 
                        borderRadius: "16px", /* 🟢 ปรับความมนของขอบภาพได้ที่นี่ (ยิ่งเลขเยอะยิ่งโค้ง) */
                        objectFit: "contain",
                        boxShadow: "0 6px 15px rgba(0,0,0,0.4)" /* ✨ แถม: ใส่เงาบางๆ ให้ภาพดูมีมิติลอยขึ้นมา ไม่กลืนกับพื้นหลัง */
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", bottom: "10px", left: 0, right: 0, display: "flex", justifyContent: "center", gap: "6px" }}>
                {[0,1,2,3].map((i) => (
                  <div key={i} onClick={() => setHighlightIndex(i)} style={{
                    width: highlightIndex === i ? "20px" : "8px", height: "8px", borderRadius: "4px",
                    background: highlightIndex === i ? "#a855f7" : "rgba(255,255,255,0.5)",
                    cursor: "pointer", transition: "all 0.3s ease",
                  }} />
                ))}
              </div>
            </div>

            {/* ขวา: Leaderboard ผู้ชนะล่าสุด (ซ่อนบนมือถือ) */}
            <div className="desktop-only" style={{
              width: "100%", maxWidth: "320px", flexShrink: 0, minWidth: 0, background: "rgba(20,15,40,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              borderRadius: "12px", border: "1px solid rgba(168,85,247,0.2)",
              overflow: "hidden", display: "flex", flexDirection: "column",
            }}>
              {/* หัวตาราง */}
              <div style={{
                padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(90deg, rgba(168,85,247,0.3), rgba(124,58,237,0.1))",
                borderBottom: "1px solid rgba(168,85,247,0.2)",
              }}>
                <span style={{ fontSize: "1rem" }}>🏆</span>
                <span style={{ color: "#c084fc", fontSize: "0.85rem", fontWeight: 800 }}>ผู้ชนะล่าสุด</span>
              </div>

              {/* รายการ */}
              <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
                {[
                  { rank: 1, name: "Treasures of Aztec", user: "095XXXX351", amount: "9,700", img: "https://cdn.zabbet.com/games/pgslot/vertical/treasures_of_aztec.jpg", provider: "PG" },
                  { rank: 2, name: "Reel Royale Showdown", user: "061XXXX596", amount: "9,396", img: "https://cdn.zabbet.com/games/1779074287562-ae970860-2fff-4912-8603-42633cacfbc0.png", provider: "PG" },
                  { rank: 3, name: "Mahjong Ways", user: "093XXXX257", amount: "4,080", img: "https://cdn.zabbet.com/games/pgslot/vertical/mahjong_ways.jpg", provider: "PG" },
                  { rank: 4, name: "Wild Bounty Showdown", user: "094XXXX471", amount: "3,686", img: "https://cdn.zabbet.com/games/1670387059235-83ad96bd-1709-4920-bf64-c2efb450d4d3.png", provider: "PG" },
                  { rank: 5, name: "Treasures of Aztec", user: "063XXXX809", amount: "3,114", img: "https://cdn.zabbet.com/games/pgslot/vertical/treasures_of_aztec.jpg", provider: "PG" },
                ].map((item) => (
                  <div key={`lb-${item.rank}`} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 10px", borderRadius: "8px", marginBottom: "4px",
                    background: item.rank % 2 === 1 ? "rgba(168,85,247,0.08)" : "transparent",
                  }}>
                    {/* อันดับ */}
                    <span style={{
                      width: "22px", height: "22px", borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                      fontSize: "0.7rem", fontWeight: 900, color: "white",
                      background: item.rank <= 3
                        ? "linear-gradient(135deg, #f59e0b, #dc2626)"
                        : "rgba(255,255,255,0.1)",
                    }}>{item.rank}</span>

                    {/* รูปเกม */}
                    <img src={item.img} alt={item.name} style={{
                      width: "32px", height: "44px", borderRadius: "4px", objectFit: "cover", flexShrink: 0,
                    }} />

                    {/* ข้อมูล */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                      <div style={{ fontSize: "0.6rem", color: "#94a3b8" }}>{item.user}</div>
                    </div>

                    {/* จำนวนเงิน */}
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#f87171", flexShrink: 0 }}>+{item.amount}</span>
                  </div>
                ))}
              </div>
          </div>
          </div>
        </div>

        {/* 10 ค่ายเกมสล็อต ปล่อยแรกแตก - ปรับสไตล์ใหม่ให้เหมือนโซน PG */}
<div style={{ marginBottom: "24px" }}>
  {/* ส่วนหัวข้อ Highlight ใหม่ */}
  <div style={{
    /* 🟢 ปรับพื้นหลังให้ทึบตรงกลาง และสว่างหัวท้ายนิดๆ ดันให้กรอบเด่นขึ้น */
    background: "linear-gradient(90deg, rgba(20, 20, 42, 0.95) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(20, 20, 42, 0.95) 100%)",
    padding: "12px 20px",
    borderLeft: "4px solid #f59e0b",
    borderTop: "1px solid rgba(245, 158, 11, 0.15)", /* 🟢 เพิ่มขอบเรืองแสงด้านบน */
    borderBottom: "1px solid rgba(245, 158, 11, 0.15)", /* 🟢 เพิ่มขอบเรืองแสงด้านล่าง */
    borderRadius: "8px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "16px",
    marginRight: "16px",
    /* 🟢 ใส่เงาสีดำหนาๆ ให้กรอบลอยขึ้นมาจากพื้นหลัง และใส่เงาสะท้อนด้านใน */
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.6), inset 0 0 10px rgba(245, 158, 11, 0.05)",
    backdropFilter: "blur(6px)"
  }}>
    {/* 🔴 รูป GIF ไฟ */}
    <img 
      src="https://kingwin88.live/storage/images/wallet/hot.gif" 
      alt="Hot" 
      style={{ 
        width: "35px", 
        height: "35px", 
        objectFit: "contain", 
        margin: "-8px 0",
        filter: "drop-shadow(0 2px 4px rgba(245, 158, 11, 0.5))" /* 🟢 เพิ่มแสงเรืองรองใต้รูปไฟ */
      }} 
    />
    <h3 style={{ 
      fontSize: "1.05rem", 
      fontWeight: 800, 
      color: "#f59e0b", 
      margin: 0,
      /* 🟢 ใส่เงาสีดำทับด้วยเรืองแสงสีส้มบางๆ ให้ตัวหนังสือตัดกับพื้นหลังชัดเจน */
      textShadow: "0 2px 4px rgba(0, 0, 0, 0.9), 0 0 10px rgba(245, 158, 11, 0.4)" 
    }}>
      10 ค่ายเกมสล็อต ปล่อยแรกแตก!!!
    </h3>
  </div>
  
  {/* ใช้ Class rank-scroll-container เพื่อให้เลื่อนได้แบบเดียวกัน */}
 <div className="rank-scroll-container" ref={rankScrollRef}>
    {products
  .filter((p) => {
    const isSlot = (g: Game) => ["SLOT","SLOTS","EGAMES"].includes(g.category?.toUpperCase() || "") || ["SLOT","SLOTS","EGAMES"].includes(g.type?.toUpperCase() || "");
    return allGames.some((g) => g.product_id === p && isSlot(g));
  })
  .sort((a, b) => {
    if (a.toUpperCase().includes("PG")) return -1;
    if (b.toUpperCase().includes("PG")) return 1;
    return 0;
  })
  .slice(0, 10)
  .map((p, i) => {
  const pGames = allGames.filter((g) => g.product_id === p && (["SLOT","SLOTS","EGAMES"].includes(g.category?.toUpperCase() || "") || ["SLOT","SLOTS","EGAMES"].includes(g.type?.toUpperCase() || "")));
      const firstImg = pGames.find((g) => g.image_url);
      return (
       <div key={`provider-${p}`} className={`rank-card ${activeRank === i ? "rank-active" : ""}`} onClick={() => router.push(`/lobby/${p}`)}>
          
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
             {productImages[p]?.image_url ? (
               <img src={productImages[p]?.image_url} className="rank-main-img" alt={p} loading="lazy" />
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
        {/* Highlight Marquee Bar */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          height: "38px", /* 🟢 เพิ่มความสูงนิดนึงให้ดูไม่อึดอัด */
          borderRadius: "8px", 
          overflow: "hidden", 
          marginBottom: "14px", 
          border: "1px solid rgba(168, 85, 247, 0.4)", /* 🟢 เปลี่ยนขอบสีดำเป็นสีม่วงอ่อนๆ ให้เข้ากับธีม */
          background: "linear-gradient(90deg, rgba(20, 20, 42, 0.9) 0%, rgba(124, 58, 237, 0.2) 50%, rgba(20, 20, 42, 0.9) 100%)", /* 🟢 ใส่พื้นหลังไล่สีทึบๆ ช่วยดันตัวหนังสือให้เด่น */
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)", /* 🟢 ใส่เงาให้กรอบดูลอยมีมิติ */
          backdropFilter: "blur(4px)" 
        }}>
          <div style={{ padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
           <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
              <path d="M18 8C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16" stroke="#a855f7" strokeWidth="2" strokeLinecap="round"/>
              <path d="M13 6L7 10H3V14H7L13 18V6Z" fill="#a855f7" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21.5 7.5C22.9 9.4 22.9 14.6 21.5 16.5" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}>
            <div className="marquee-scroll" style={{ 
              display: "inline-block", 
              animation: "marquee 20s linear infinite", 
              fontSize: "0.85rem", /* 🟢 ปรับฟอนต์ให้ใหญ่ขึ้นนิดนึง */
              fontWeight: 600, /* 🟢 เพิ่มความหนาให้ตัวหนังสือ */
              color: "#ffffff", /* 🟢 ขาวสว่างสุด */
              letterSpacing: "0.5px",
              /* ✨ ไฮไลต์: ใส่เงาสีดำเข้มๆ รองหลังตัวอักษร ตามด้วยเงาเรืองแสงสีม่วง */
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.9), 0 0 8px rgba(168, 85, 247, 0.8)" 
            }}>
              ยินดีต้อนรับสมาชิกทุกท่าน ให้ความลื่นไหลในการเล่นไม่มีสะดุด พร้อมดูแลทุกเวลา รองรับผู้เล่นนับแสนจากทั่วโลก ด้วยเซิร์ฟเวอร์ประสิทธิภาพสูงระดับสากล
            </div>
          </div>
        </div>
        
       {/* Tab Menu */}
        <div className="tab-menu-row" style={{ display: "flex", gap: "8px", marginBottom: "14px", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "highlight", label: "ไฮไลท์", href: "" },
            { id: "promotion", label: "โปรโมชันแนะนำ", href: "/promotions" },
            { id: "event", label: "กิจกรรม", href: "/promotions" },
            { id: "news", label: "ข่าวสาร", href: "/history" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.href) router.push(tab.href); }} style={{
             flex: 1, height: "38px", padding: "0 22px", borderRadius: "10px", cursor: "pointer",
             display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap",
              fontSize: "0.82rem", fontWeight: 800, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              /* ✨ ดีไซน์ใหม่: เมื่อเลือก (Active) จะเป็นปุ่ม 3D นูนหนาสีม่วงพรีเมียม / ถ้าไม่ได้เลือกจะโปร่งแสงสวยงาม */
              background: activeTab === tab.id 
                ? "linear-gradient(180deg, #9333ea 0%, #7c3aed 50%, #6d28d9 100%)" 
                : "rgba(20, 20, 42, 0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              color: activeTab === tab.id ? "#ffffff" : "#c084fc",
             border: activeTab === tab.id ? "1.5px solid rgba(168, 85, 247, 0.5)" : "1px solid rgba(168, 85, 247, 0.25)",
              boxShadow: activeTab === tab.id 
                ? "0 6px 16px rgba(124, 58, 237, 0.6), inset 0 2px 2px rgba(255, 255, 255, 0.4), inset 0 -3px 3px rgba(76, 29, 149, 0.9)" 
                : "0 4px 10px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
              textShadow: activeTab === tab.id ? "0 1px 2px rgba(0,0,0,0.8)" : "none",
              transform: activeTab === tab.id ? "translateY(-2px)" : "translateY(0)",
            }}>
             {tab.id === "highlight" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
              {tab.id === "promotion" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v13M4 14.5A3.5 3.5 0 0 1 7.5 11H12m0 0h4.5A3.5 3.5 0 0 1 20 14.5M4 14.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.5M4 14.5h16M12 11V8m0 0a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0zm0 0a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0-5 0z" /></svg>}
              {tab.id === "event" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></svg>}
              {tab.id === "news" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /></svg>}
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
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-hot-game.png" alt="ยอดนิยม" className="img-fluid -ic-menu" width="55" height="55" loading="lazy" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>HOT GAME</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>ยอดนิยม</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-1 ${selectedCategory === "LIVECASINO" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("LIVECASINO"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "LIVECASINO" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/icons8-cards-48.png" alt="คาสิโนสด" className="img-fluid -ic-menu" width="55" height="55" loading="lazy" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>CASINO</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>คาสิโนสด</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-2 ${selectedCategory === "SLOT" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("SLOT"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "SLOT" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-slot.png" alt="สล็อตเกมส์" className="img-fluid -ic-menu" width="55" height="55" loading="lazy" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>SLOT</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>สล็อตเกมส์</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-3 ${selectedCategory === "FISHING" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("FISHING"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "FISHING" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-fishing-game.png" alt="ยิงปลา" className="img-fluid -ic-menu" width="55" height="55" loading="lazy" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>FISHING</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>ยิงปลา</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-4 ${selectedCategory === "CARD" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("CARD"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "CARD" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-casino.png" alt="เกมไพ่" className="img-fluid -ic-menu" width="55" height="55" loading="lazy" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>CARD</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>เกมไพ่</div>
                  </div>
                </a>
              </li>

              <li className="nav-item">
                <a className={`nav-link -hot-game nav-id-5 ${selectedCategory === "SPORT" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); handleCategoryFilter("SPORT"); }} style={{ display: "flex", alignItems: "center", background: selectedCategory === "SPORT" ? "linear-gradient(90deg, #aa00a0, #4b0082)" : "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", textDecoration: "none" }}>
                  <img src="https://odin996.com/theme_1/img/ic-nav-menu-sport.png" alt="กีฬา" className="img-fluid -ic-menu" width="55" height="55" loading="lazy" />
                  <div className="-text-provider-wrapper" style={{ marginLeft: "12px" }}>
                    <h2 className="-text-nav-menu -title" style={{ fontSize: "1rem", fontWeight: 800, color: "white", margin: 0 }}>SPORT</h2>
                    <div className="-text-nav-menu -title-trans" style={{ fontSize: "0.8rem", color: "#d1d5db" }}>กีฬา</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          {/* Games Area */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* ===== โหมด 2: เลือกหมวดสล็อต → แสดงรายการค่ายเกม ===== */}
            {(isRoomMode || selectedCategory === "") ? (
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
                       style={{ 
                          cursor: "pointer", 
                          position: "relative",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          background: "#14142a",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          boxShadow: "0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"; 
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.5)"; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = ""; 
                          e.currentTarget.style.boxShadow = ""; 
                        }}
                      >
                        {/* รูปค่ายเกม */}
                        <div className="skeleton-box" /> 
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
                            const skel = e.currentTarget.previousElementSibling as HTMLElement;  
                            if (skel) skel.classList.add('loaded'); 
                            const c = e.currentTarget.closest('.theme1-thumb-frame');
                            if (c) {
                              c.classList.remove('is-loading');
                              c.classList.remove('is-fallback');
                            }
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-provider.png"; 
                            const skel = e.currentTarget.previousElementSibling as HTMLElement;  
                            if (skel) skel.classList.add('loaded');                               
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
                            inset: "0",
                            background: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            opacity: 0,
                            transition: "opacity 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = "0"}
                        >
                          <div
                           style={{
                            background: "linear-gradient(180deg, #d946ef 0%, #a855f7 50%, #7e22ce 100%)",
                            border: "1.5px solid #f59e0b",
                            color: "white",
                            padding: "10px 24px",
                            borderRadius: "24px",
                            fontSize: "0.85rem",
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            letterSpacing: "0.5px",
                            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.7), inset 0 2px 3px rgba(255, 255, 255, 0.5), inset 0 -3px 4px rgba(74, 4, 78, 0.9)",
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
                            transform: "scale(0.95)",
                            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
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
                        onClick={() => router.push(`/lobby/${game.product_id}`)}
                       style={{ 
                          cursor: "pointer", 
                          position: "relative",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"; 
                          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.5)"; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = ""; 
                          e.currentTarget.style.boxShadow = ""; 
                        }}
                      >
                        {/* รูปเกม */}
                        <div style={{ width: "100%", position: "relative", overflow: "hidden", borderRadius: "10px" }}>
                          {game.image_url ? (
                            <>                                                                    
                              <div className="skeleton-box" style={{ aspectRatio: "1/1" }} />     
                              <img 
                                src={game.image_url} 
                                alt={game.game_name} 
                                className="-cover-img img-fluid"
                                style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
                                loading="lazy"
                                onLoad={(e) => {                                                  
                                  const skel = e.currentTarget.previousElementSibling as HTMLElement; 
                                  if (skel) skel.classList.add('loaded');                                                    
                              }}
                                onError={(e) => {
                                  const skel = e.currentTarget.previousElementSibling as HTMLElement;
                                  if (skel) skel.classList.add('loaded');
                                }}
                              />
                            </>                                                                 
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", fontSize: "0.75rem" }}>No Image</div>
                          )}

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

                        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#a1a1aa", margin: "6px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center", padding: "0 2px" }}>
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
                      onClick={() => router.push(`/lobby/${game.product_id}`)}
                      style={{ background: "#121214", borderRadius: "10px", border: "1px solid rgba(245,158,11,0.2)", overflow: "visible", position: "relative", cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.6)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(245,158,11,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      
                      {/* ไอคอนเกมแตก */}
                      {game.id % 3 === 0 && (
                        <img 
                          src="https://kingwin88.live/storage/images/wallet/hot.gif" 
                          alt="เกมแตก" 
                          style={{ position: "absolute", top: "-18px", right: "-16px", width: "56px", height: "56px", zIndex: 30, pointerEvents: "none" }} 
                        />
                      )}

                      <div style={{ width: "100%", paddingBottom: "125%", background: "#1a1a2e", position: "relative", overflow: "hidden", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>
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

        {/* === Footer ค่ายเกม + ช่องทางชำระเงิน + ใบอนุญาต === */}
        <div style={{ marginTop: "30px", padding: "40px 24px 80px", textAlign: "center", background: "#0a0a14", borderTop: "1px solid rgba(124,58,237,0.2)", marginLeft: "-24px", marginRight: "-24px", position: "relative", zIndex: 2, paddingBottom: "100px" }}>

          {/* ข้อความแนะนำ */}
          <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 16px", lineHeight: "1.6" }}>
            เว็บรวมเกมส์อันดับ 1 ของไทย เหนือกว่า ในทุกด้าน<br/>
            สะดวกกว่าในทุกมุมมอง มิติใหม่ เว็บเกม เล่นได้ทุกเกมส์
          </p>

          {/* โลโก้ค่ายเกม */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px", marginBottom: "20px" }}>
            {[
              "slot/pgslot_menu.png","slot/joker_menu.png","slot/jili_menu.png","slot/playstar_menu.png",
              "slot/rsg_menu.png","slot/ambslot_menu.png","slot/ygr_menu.png","slot/pragmaticplay_menu.png",
              "slot/sexyslot_menu.png","slot/octoplay_menu.png","slot/5ggames_menu.png","slot/betsoft_menu.png",
              "slot/endorphina_menu.png","slot/hacksaw_menu.png","slot/rich88_menu.png","slot/popok_menu.png",
              "slot/fachai_menu.png","slot/microgaming_menu.png","slot/spade_menu.png","slot/blueprint_menu.png",
              "slot/mancala_menu.png","slot/yggdrasil_menu.png","slot/pegasus_menu.png","slot/naga_menu.png",
              "slot/evoplay_menu.png","slot/smartsoft_menu.png","slot/idealgaming_menu.png",
              "casino/sexy_menu.png","casino/allbet_menu.png","casino/sa_menu.png","casino/ongaming_menu.png",
              "casino/dreamgaming_menu.png","casino/pretty_menu.png","casino/evolution_menu.png",
              "casino/pragmaticplaycasino_menu.png","casino/wmcasino_menu.png","casino/sv388_menu.png",
              "table/kagaming_menu.png","table/playngos_menu.png","table/nextspin_menu.png",
              "table/peterandsons_menu.png","table/dragoonsoft_menu.png","table/btgaming_menu.png",
              "table/kingmakers_menu.png","table/habanero_menu.png","table/redtiger_menu.png",
              "table/wazdan_menu.png","table/relaxgaming_menu.png","table/netent_menu.png",
              "table/advantplay_menu.png","table/cq9_menu.png",
              "sport/saba_menu.png","sport/sbo_menu.png","sport/lalika_menu.png",
            ].map((img, i) => (
              <div key={`prov-${i}`} style={{ padding: "4px" }}>
                <img src={`https://imagex-game.image-etc.co/_tempura/provider/${img}`} alt="" style={{ height: "40px", objectFit: "contain", opacity: 0.8 }} loading="lazy" />
              </div>
            ))}
          </div>

          {/* ช่องทางชำระเงิน */}
          <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 700, margin: "0 0 10px" }}>ช่องทางชำระเงิน</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2px", marginBottom: "20px" }}>
            {["KBANK","SCB","KTB","BAY","TRUEWALLET","GSB","BBL","BAAC","KKB","OSK","TTB","TISGO","UOB","CITI","LNH","CIMB","TCR","MIZUHO","SCBT","ICBC","ISBT","PEER2PAY"].map((bank, i) => (
              <div key={`bank-${i}`} style={{ margin: "2px" }}>
                <img src={`https://d2yxt25pyz4ib7.cloudfront.net/_ty1/${bank}.png`} alt={bank} className="footer-bank-img" loading="lazy" />
              </div>
            ))}
            <div style={{ margin: "2px" }}><img src="https://self-imagex.image-etc.co/supercom/bank_1702541269.png" alt="bank" className="footer-bank-img" loading="lazy" /></div>
            <div style={{ margin: "2px" }}><img src="https://self-imagex.image-etc.co/supercom/bank_1702541350.png" alt="bank" className="footer-bank-img" loading="lazy" /></div>
          </div>

          {/* แท็ก */}
          <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 700, margin: "0 0 10px" }}>แท็ก</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
            <span style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", fontSize: "0.7rem", padding: "4px 12px", borderRadius: "20px" }}>สล็อตเว็บตรง PG เว็บใหญ่ มาแรง 2025 อันดับ 1 ในไทย</span>
          </div>

          {/* ใบอนุญาต */}
          <p style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            ใบอนุญาต Gambling
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e" width="18" height="18"><path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd"/></svg>
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <img src="https://slotnarok.games/assets/curacao-DB0Q0sYk.webp" alt="Curacao" className="footer-license-img" loading="lazy" />
            <img src="https://slotnarok.games/assets/gambling-Bq688pkC.webp" alt="Gambling" className="footer-license-img" loading="lazy" />
            <img src="https://slotnarok.games/assets/mga-BmZoW2Qo.svg" alt="MGA" className="footer-license-img" loading="lazy" />
          </div>
        </div>

      {/* 🔴 หัวใจสำคัญคือตรงนี้ครับ CSS ที่จะจัดหน้าให้ตรงตามภาพเป๊ะๆ 🔴 */}
      <style dangerouslySetInnerHTML={{__html: `
        /* 🟢 สไตล์แบนเนอร์ (เปลี่ยนชื่อคลาสใหม่หนีแคชมือถือ) 🟢 */
         .hero-banner-track { --bw: 100%; }
         /* 🟢 แก้ตรงนี้: ให้เป็น 100% เสมอ ป้องกันการคำนวณสไลด์บนจอคอมเพี้ยน */
         @media (min-width: 768px) { .hero-banner-track { --bw: 100%; } }

        .provider-grid-container, .game-grid-container {
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 8px !important;
        }

        @media (min-width: 768px) {
          .provider-grid-container, .game-grid-container {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 12px !important;
          }
        }

        @media (min-width: 1024px) {
          .provider-grid-container, .game-grid-container {
            grid-template-columns: repeat(6, 1fr) !important;
            gap: 14px !important;
          }
        }
        
        .hero-banner-item {
          flex: 0 0 var(--bw);
          width: var(--bw);
          padding: 0 4px;
          box-sizing: border-box; /* 🟢 หัวใจสำคัญ: ป้องกัน padding ดันกรอบจนภาพเหลื่อมกัน */
          transition: transform 0.4s ease, opacity 0.4s ease;
        }
        
        /* 🟢 สไตล์แบนเนอร์ให้ Auto ปรับตามอุปกรณ์ (มือถือ, ไอแพด, คอม) */
        .hero-banner-img {
          width: 100%;
          height: auto;
          max-height: 240px; /* 📱 ล็อกความสูงบน "มือถือ" ไม่ให้รูปแนวตั้งล้นจอ */
          object-fit: contain; /* 🟢 บังคับย่อภาพให้โชว์เต็มใบ 100% ไม่มีการตัดขอบ */
          display: block;
          border-radius: 12px;
          margin: 0 auto; /* จัดให้อยู่กึ่งกลางเสมอ */
        }

        /* 💻 สำหรับแท็บเล็ต / iPad แนวตั้ง */
        @media (min-width: 768px) {
          .hero-banner-img {
            max-height: 320px; /* ขยายเพดานความสูงให้พอดีจอกลาง */
          }
        }

        /* 🖥️ สำหรับหน้าจอคอมพิวเตอร์ / แล็ปท็อป */
        @media (min-width: 1024px) {
          .hero-banner-img {
            max-height: 400px; /* ขยายเพดานความสูงให้พอดีจอใหญ่ */
          }
        }

        /* สไตล์ 10 อันดับเกมมาแรง */
        .rank-scroll-container {
          display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none;
          padding: 10px 16px 20px 32px; 
        }
        /* 🟢 เพิ่มคำสั่งจัดกึ่งกลางเฉพาะหน้าจอคอมพิวเตอร์ (จอใหญ่) */
        @media (min-width: 1024px) {
          .rank-scroll-container {
            justify-content: center; 
          }
        }
        .rank-scroll-container::-webkit-scrollbar { display: none; }

        .rank-card { position: relative; width: 126px; flex-shrink: 0; cursor: pointer; margin-left: 30px; overflow: visible; }
        .rank-card { transition: transform 0.5s ease, width 0.5s ease; }
       .rank-active { transform: scale(1.25); z-index: 10; }

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
        .game-card { position: relative; background: linear-gradient(145deg, #1a1a3e, #14142a); border-radius: 10px;ursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(124,58,237,0.15); }
        .game-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 12px 28px rgba(124,58,237,0.25), 0 4px 12px rgba(0,0,0,0.5); border-color: rgba(124,58,237,0.4); }
        .game-overlay { position: absolute; top: 0; left: 0; right: 0; aspect-ratio: 1/1; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
        .game-card:hover .game-overlay { opacity: 1; }

        .footer-bank-img { height: 42px; width: 42px; border-radius: 8px; object-fit: cover; }
        .footer-license-img { height: 55px; margin: 4px; }
        @media (max-width: 600px) {
          .footer-bank-img { height: 32px; width: 32px; border-radius: 6px; }
          .footer-license-img { height: 28px; margin: 2px; }
        }

        @media (max-width: 1023px) {
  .highlight-layout {
    flex-direction: column !important;
    max-height: none !important;
    width: 100% !important;
    overflow: hidden;
  }
}
        
        /* Skeleton Shimmer Loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-box {
  position: absolute; inset: 0; z-index: 5;
  background: linear-gradient(90deg, #1a1a2e 25%, #2a2a4a 50%, #1a1a2e 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 10px;
  transition: opacity 0.3s ease;
}
.skeleton-box.loaded { opacity: 0; pointer-events: none; }

        @keyframes floatDice {
          0% { transform: translate(0, 0) rotate(0deg) scale(0.3); opacity: 0; }
          15% { opacity: 0.1; }
          50% { transform: translate(-10px, -15px) rotate(180deg) scale(1.8); opacity: 0.15 !important; }
          85% { opacity: 0.1; }
          100% { transform: translate(0, 0) rotate(360deg) scale(0.3); opacity: 0; }
        }

        .desktop-only { display: none; }
        .mobile-only { display: block; }
        @media (min-width: 1024px) {
          .desktop-only { display: block; }
          .mobile-only { display: none; }
        }
          @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        /* 🟢 🟢 เพิ่ม CSS ซ่อน Scrollbar ของเมนูมือถือตรงนี้ 🟢 🟢 */
        .hide-scrollbar::-webkit-scrollbar { 
          display: none; 
        }
        
      `}} />
      </div>
    </div>
  );
}