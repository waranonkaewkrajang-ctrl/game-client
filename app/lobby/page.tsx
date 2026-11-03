"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import GameSidebar from "@/components/GameSidebar";
import Activities from "@/components/Activities";
import HeroCarousel, { type BannerLike } from "@/components/lobby/HeroCarousel";
import LobbyFooter from "@/components/lobby/LobbyFooter";
import { CardGrid, EmptyState, GameCard, ProviderCard, SectionHeader, SkeletonGrid } from "@/components/lobby/LobbyCards";
import { type CategoryItem, type Game, type ProductImage, gameMatchesRoomCategory, gameTitle, isSlotGame } from "@/components/lobby/types";
import styles from "@/components/lobby/lobby.module.css";

// Shape returned by GET /games/recently-played (subset used by the UI)
type RecentGame = Pick<Game, "id" | "product_id" | "game_name" | "game_name_th" | "image_url">;

/* ---------- inline icons (single stroke style) ---------- */
const Icon = {
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  gift: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>,
  news: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M10 6h8M10 10h8M10 14h5" /></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  megaphone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>,
  grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  flame: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
};

export default function LobbyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTab, setActiveTab] = useState("highlight");
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, ProductImage>>({});
  // kept from the original implementation (derived from GET /games)
  const [, setGameCategories] = useState<{ id: string; label: string; count: number }[]>([]);
  const [banners, setBanners] = useState<BannerLike[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [marqueePaused, setMarqueePaused] = useState(false);

  // ดึงเกมที่เล่นล่าสุด เมื่อกด tab "recent"
  useEffect(() => {
    if (activeTab !== "recent") return;
    // loading flag is raised in the tab click handler (avoids setState in effect)
    api.get("/games/recently-played?limit=24")
      .then((res) => setRecentGames(res?.data?.data || []))
      .catch(() => setRecentGames([]))
      .finally(() => setLoadingRecent(false));
  }, [activeTab]);

  useEffect(() => {
    api.get("/games/product-images").then((res) => {
      if (res.data.status === "success") setProductImages(res.data.data || {});
    }).catch(() => {});
  }, []);

  const fetchGames = (productId?: string, searchTerm?: string) => {
    setLoading(true);
    setLoadError(false);
    loadGames(productId, searchTerm);
  };

  // network part of fetchGames — state is only set inside async callbacks
  const loadGames = (productId?: string, searchTerm?: string) => {
    const params: Record<string, string> = {};
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
    }).catch(() => { setLoading(false); setLoadError(true); });
  };

  // หมวดที่ต้องเข้าห้องค่ายก่อน (ไม่เปิดเกมตรง)
  const ROOM_CATEGORIES = ["SLOT", "EGAMES", "SLOTS", "LIVECASINO", "FISHING", "CARD", "SPORT"];
  const isRoomMode = ROOM_CATEGORIES.includes(selectedCategory.toUpperCase());

  useEffect(() => {
    if (!localStorage.getItem("user_token")) { router.push("/login"); return; }

    api.get("/games/products").then((res) => { if (res.data.status === "success") setProducts(res.data.data || []); }).catch(() => {});

    // แบนเนอร์จากหลังบ้าน
    api.get("/banners").then((res) => {
      if (res.data.status === "success") setBanners(res.data.data || []);
    }).catch(() => {
      setBanners([]); // โหลดไม่ติด → ซ่อนแบนเนอร์ (เดิมชี้ไป /banner.jpg ซึ่งไม่มีไฟล์อยู่จริง)
    }).finally(() => setBannersLoading(false));

    // initial state is already loading=true / loadError=false
    loadGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryMap: Record<string, string[]> = {
    "SLOT": ["EGAMES"],
    "LIVECASINO": ["LIVECASINO"],
    "FISHING": ["FISHING"],
    "CARD": ["CARD"],
    "SPORT": ["SPORT"],
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
        if (catId === "FISHING") return typ === "FISHING";
        return matches.some((m) => cat === m);
      }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
    if (activeTab === "recent") setActiveTab("highlight");
    fetchGames(selectedProduct, search);
  };

  const clearSearch = () => {
    setSearch("");
    setAppliedSearch("");
    fetchGames(selectedProduct, "");
  };

  /* ---------- derived view data (presentation only) ---------- */
  const categories: CategoryItem[] = useMemo(() => {
    const base: Omit<CategoryItem, "count">[] = [
      { id: "", title: "HOT GAME", label: t("sidebar.popular"), icon: "/icons/menu/ic-nav-menu-hot-game.webp" },
      { id: "LIVECASINO", title: "CASINO", label: t("sidebar.casino"), icon: "/icons/menu/icons8-cards-48.webp" },
      { id: "SLOT", title: "SLOT", label: t("sidebar.slot"), icon: "/icons/menu/ic-nav-menu-slot.webp" },
      { id: "FISHING", title: "FISHING", label: t("sidebar.fishing"), icon: "/icons/menu/ic-nav-menu-fishing-game.webp" },
      { id: "CARD", title: "CARD", label: t("sidebar.card"), icon: "/icons/menu/ic-nav-menu-casino.webp" },
      { id: "SPORT", title: "SPORT", label: t("sidebar.sport"), icon: "/icons/menu/ic-nav-menu-sport.webp" },
    ];
    // real game counts from GET /games (hidden while loading)
    return base.map((c) => ({ ...c, count: loading ? undefined : allGames.filter((g) => gameMatchesRoomCategory(g, c.id)).length }));
  }, [t, allGames, loading]);

  const visibleProviders = useMemo(() => products
    .map((p) => ({ id: p, count: allGames.filter((g) => g.product_id === p && gameMatchesRoomCategory(g, selectedCategory)).length }))
    .filter((p) => p.count > 0), [products, allGames, selectedCategory]);

  const slotProviders = useMemo(() => products
    .filter((p) => allGames.some((g) => g.product_id === p && isSlotGame(g)))
    .sort((a, b) => {
      if (a.toUpperCase().includes("PG")) return -1;
      if (b.toUpperCase().includes("PG")) return 1;
      return 0;
    })
    .slice(0, 10)
    .map((p) => ({ id: p, count: allGames.filter((g) => g.product_id === p && isSlotGame(g)).length })), [products, allGames]);

  const showGames = activeTab === "recent" || !!appliedSearch || !(isRoomMode || selectedCategory === "");
  const displayedGames: RecentGame[] = activeTab === "recent" ? recentGames : games;
  const isGamesLoading = activeTab === "recent" ? loadingRecent : loading;
  const activeCategory = categories.find((c) => c.id === selectedCategory);

  const tabs = [
    { id: "highlight", label: t("lobby.highlight"), href: "", icon: Icon.star },
    { id: "recent", label: t("lobby.recent"), href: "", icon: Icon.clock },
    { id: "promotion", label: t("lobby.promotion"), href: "/promotions", icon: Icon.gift },
    { id: "news", label: t("lobby.news"), href: "/history", icon: Icon.news },
  ];

  const gamesTitle = activeTab === "recent"
    ? t("lobby.recent")
    : appliedSearch
      ? `${t("lobby.searchResults")}: “${appliedSearch}”`
      : (selectedCategory || selectedProduct || t("lobby.allGames"));

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* ===== Desktop sidebar ===== */}
        <aside className={styles.aside}>
          <GameSidebar
            variant="sidebar"
            items={categories}
            selected={selectedCategory}
            onSelect={handleCategoryFilter}
            ariaLabel={t("lobby.categories")}
          />
        </aside>

        <main className={styles.main}>
          {/* ===== Hero ===== */}
          <div className={styles.heroWrap}>
            <HeroCarousel banners={banners} loading={bannersLoading} href="/promotions" label={t("lobby.promotion")} />
          </div>

          {/* ===== Announcement ===== */}
          <div className={`${styles.marquee} ${marqueePaused ? styles.marqueePaused : ""}`}>
            <button
              type="button"
              className={styles.marqueeIcon}
              onClick={() => setMarqueePaused((v) => !v)}
              aria-pressed={marqueePaused}
              aria-label={marqueePaused ? "Play announcement" : "Pause announcement"}
            >
              {Icon.megaphone}
            </button>
            <div className={styles.marqueeViewport}>
              <span className={styles.marqueeTrack}>
                <span className={styles.marqueeText}>{t("lobby.marquee")}</span>
                <span className={styles.marqueeText} aria-hidden="true">{t("lobby.marquee")}</span>
              </span>
            </div>
          </div>

          {/* ===== Tabs + Search ===== */}
          <div className={styles.toolbar}>
            <form className={styles.search} role="search" onSubmit={handleSearch}>
              <span className={styles.searchIcon}>{Icon.search}</span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder={t("lobby.search")}
                aria-label={t("lobby.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                enterKeyHint="search"
              />
              <span className={styles.searchActions}>
                {(search || appliedSearch) && (
                  <button type="button" className={styles.searchClear} onClick={clearSearch} aria-label={t("lobby.clearSearch")}>{Icon.close}</button>
                )}
                <button type="submit" className={styles.searchSubmit}>{t("lobby.searchSubmit")}</button>
              </span>
            </form>

            <div className={styles.tabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
                  aria-pressed={activeTab === tab.id}
                  onClick={() => {
                    if (tab.id === "recent" && activeTab !== "recent") setLoadingRecent(true);
                    setActiveTab(tab.id);
                    if (tab.href) router.push(tab.href);
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== Mobile category chips ===== */}
          <div className={styles.mobileOnly}>
            <GameSidebar
              variant="chips"
              items={categories}
              selected={selectedCategory}
              onSelect={handleCategoryFilter}
              ariaLabel={t("lobby.categories")}
            />
          </div>

          {/* ===== Activities (backend-driven) ===== */}
          <Activities page="lobby" slot="icon_grid" />

          {/* ===== Main content: providers or games ===== */}
          {showGames ? (
            <section className={styles.section} aria-labelledby="games-heading">
              <SectionHeader
                id="games-heading"
                title={gamesTitle}
                icon={activeTab === "recent" ? Icon.clock : appliedSearch ? Icon.search : Icon.grid}
                count={isGamesLoading ? undefined : `${displayedGames.length.toLocaleString()} ${t("lobby.games")}`}
                action={appliedSearch && activeTab !== "recent"
                  ? <button type="button" className={styles.linkBtn} onClick={clearSearch}>{Icon.close}{t("lobby.clearSearch")}</button>
                  : undefined}
              />
              {isGamesLoading ? (
                <SkeletonGrid variant="game" count={12} />
              ) : loadError && activeTab !== "recent" ? (
                <EmptyState
                  title={t("lobby.loadError")}
                  action={<button type="button" className={styles.linkBtn} onClick={() => fetchGames(selectedProduct, appliedSearch)}>{t("lobby.retry")}</button>}
                />
              ) : displayedGames.length === 0 ? (
                activeTab === "recent"
                  ? <EmptyState title={t("lobby.noRecent")} hint={t("lobby.noRecentHint")} />
                  : <EmptyState title={t("lobby.noGames")} hint={t("lobby.noGamesHint")} />
              ) : (
                <CardGrid variant="game">
                  {displayedGames.map((game) => (
                    <GameCard
                      key={`${game.product_id}-${game.id}`}
                      href={`/lobby/${game.product_id}`}
                      title={gameTitle(game)}
                      provider={game.product_id}
                      imageUrl={game.image_url}
                    />
                  ))}
                </CardGrid>
              )}
            </section>
          ) : (
            <section className={styles.section} aria-labelledby="providers-heading">
              <SectionHeader
                id="providers-heading"
                title={activeCategory && activeCategory.id ? `${t("lobby.selectProvider")} · ${activeCategory.label}` : t("lobby.selectProvider")}
                icon={Icon.grid}
                count={loading ? undefined : `${visibleProviders.length} ${t("lobby.providers")}`}
              />
              {loading ? (
                <SkeletonGrid count={12} />
              ) : loadError ? (
                <EmptyState
                  title={t("lobby.loadError")}
                  action={<button type="button" className={styles.linkBtn} onClick={() => fetchGames(selectedProduct, appliedSearch)}>{t("lobby.retry")}</button>}
                />
              ) : visibleProviders.length === 0 ? (
                <EmptyState title={t("lobby.noProviders")} hint={t("lobby.noGamesHint")} />
              ) : (
                <CardGrid>
                  {visibleProviders.map((p, i) => (
                    <ProviderCard
                      key={`room-${p.id}`}
                      id={p.id}
                      imageUrl={productImages[p.id]?.image_url}
                      gameCount={p.count}
                      gamesLabel={t("lobby.games")}
                      playLabel={t("lobby.playNow")}
                      eager={i < 6}
                    />
                  ))}
                </CardGrid>
              )}
            </section>
          )}

          {/* ===== Recommended slot providers (real data: providers with slot games) ===== */}
          {!showGames && !loading && slotProviders.length > 0 && (
            <section className={`${styles.section} ${styles.panel}`} aria-labelledby="slots-heading">
              <SectionHeader
                id="slots-heading"
                title={t("lobby.recommendedSlots")}
                icon={Icon.flame}
                action={selectedCategory !== "SLOT"
                  ? <button type="button" className={styles.linkBtn} onClick={() => { handleCategoryFilter("SLOT"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{t("lobby.viewAll")}</button>
                  : undefined}
              />
              <div className={styles.strip}>
                {slotProviders.map((p) => (
                  <ProviderCard
                    key={`slot-${p.id}`}
                    id={p.id}
                    imageUrl={productImages[p.id]?.image_url}
                    gameCount={p.count}
                    gamesLabel={t("lobby.games")}
                    playLabel={t("lobby.playNow")}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ===== Activities: large cards ===== */}
          <Activities page="lobby" slot="home_card" />
        </main>
      </div>

      <LobbyFooter />
    </div>
  );
}
