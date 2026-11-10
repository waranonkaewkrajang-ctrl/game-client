"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import api from "@/lib/api";
import GameSidebar from "@/components/GameSidebar";
import Activities from "@/components/Activities";
import HeroCarousel, { type BannerLike } from "@/components/lobby/HeroCarousel";
import LobbyFooter from "@/components/lobby/LobbyFooter";
import RecentWithdrawals from "@/components/lobby/RecentWithdrawals";
import LobbyInfo from "@/components/lobby/LobbyInfo";
import LobbyTabStrip from "@/components/lobby/LobbyTabStrip";
import { DEMO_WITHDRAWALS } from "@/components/lobby/recentWithdrawals.demo";
import { CardGrid, EmptyState, GameCard, ProviderCard, SectionHeader, SkeletonGrid } from "@/components/lobby/LobbyCards";
import ProviderGameCard from "@/components/lobby/ProviderGameCard";
import { favoriteKey, parseFavoriteKey, useFavoriteGames } from "@/components/lobby/favoriteGames";
import { alertFavoriteSaveFailed, launchGame } from "@/components/lobby/launchGame";
import { type CategoryItem, type Game, type ProductImage, gameMatchesRoomCategory, gameTitle, isSlotGame } from "@/components/lobby/types";
import styles from "@/components/lobby/lobby.module.css";

// Shape returned by GET /games/recently-played (subset used by the UI)
type RecentGame = Pick<Game, "id" | "product_id" | "game_name" | "game_name_th" | "image_url">;

/* ---------- inline icons (single stroke style) ---------- */
const Icon = {
  star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  gift: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>,
  // same heart outline as the favorite button on the game cards (ProviderGameCard)
  heart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.6C1.6 7.8 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.4 3.3 4.3 6.4-1.8 5-9.3 9.6-9.3 9.6z" /></svg>,
  news: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M10 6h8M10 10h8M10 14h5" /></svg>,
  live: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="13" rx="2" /><path d="m9 2 3 3 3-3M8 22h8M12 18v4" /><path d="m10 9 5 3-5 3Z" /></svg>,
  grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  // Santa decoration for the "recommended slots" panel: animated transparent WebP (443×443, 8 frames, ~195 KB).
  // `unoptimized` → the browser gets the original file: the image optimizer re-encodes some widths to a single
  // still frame (and had cached a static derivative of the previous artwork under the same URL).
  // Two copies of the same URL (one request, frames stay in sync): the sharp one, and a softened one that only
  // shows in the bottom ~7% (boot soles) via CSS masks — the flames are never covered by a duplicate.
  santa: (
    <>
      <Image
        src="/images/decorations/santa-fire.webp"
        alt=""
        width={443}
        height={443}
        unoptimized
        className={styles.santaIcon}
        draggable={false}
      />
      <Image
        src="/images/decorations/santa-fire.webp"
        alt=""
        width={443}
        height={443}
        unoptimized
        className={`${styles.santaIcon} ${styles.santaBlur}`}
        draggable={false}
      />
    </>
  ),
};

export default function LobbyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
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

  const fetchGames = (productId?: string) => {
    setLoading(true);
    setLoadError(false);
    loadGames(productId);
  };

  // network part of fetchGames — state is only set inside async callbacks
  const loadGames = (productId?: string) => {
    const params: Record<string, string> = {};
    if (productId) params.productId = productId;
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

    // Honor pretty category URLs — /lobby#sport, /lobby#casino, /lobby#slot, /lobby#fishing, /lobby#card
    // (also still accepts the older ?cat=SPORT form for backward compatibility)
    const CATEGORY_ALIASES: Record<string, string> = {
      sport: "SPORT", sports: "SPORT", กีฬา: "SPORT",
      casino: "LIVECASINO", livecasino: "LIVECASINO", คาสิโน: "LIVECASINO",
      slot: "SLOT", slots: "SLOT", สล็อต: "SLOT",
      fishing: "FISHING", fish: "FISHING", ยิงปลา: "FISHING",
      card: "CARD", cards: "CARD", ไพ่: "CARD",
    };
    const raw = decodeURIComponent(
      window.location.hash.replace(/^#/, "") ||
      new URLSearchParams(window.location.search).get("cat") ||
      ""
    ).toLowerCase();
    const cat = CATEGORY_ALIASES[raw] || (raw ? raw.toUpperCase() : "");
    if (cat) setSelectedCategory(cat);
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

    // Sync URL hash so the link reflects the current category and can be shared/bookmarked
    const HASH_BY_CATEGORY: Record<string, string> = {
      SPORT: "sport",
      LIVECASINO: "casino",
      SLOT: "slot",
      FISHING: "fishing",
      CARD: "card",
    };
    const hash = HASH_BY_CATEGORY[catId] || "";
    const nextUrl = `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  };

  /* ---------- derived view data (presentation only) ---------- */
  const categories: CategoryItem[] = useMemo(() => {
    const base: Omit<CategoryItem, "count">[] = [
      { id: "", title: "HOT GAME", label: t("sidebar.popular"), icon: "/icons/menu/ic-nav-menu-hot-game.webp", art: { src: "/images/game-categories/hot-game.webp", width: 480, height: 189 }, thumb: "/images/game-categories/hot-game-mobile-v2.webp" },
      { id: "LIVECASINO", title: "CASINO", label: t("sidebar.casino"), icon: "/icons/menu/icons8-cards-48.webp", art: { src: "/images/game-categories/casino.webp", width: 480, height: 200 }, thumb: "/images/game-categories/casino-mobile-v2.webp" },
      { id: "SLOT", title: "SLOT", label: t("sidebar.slot"), icon: "/icons/menu/ic-nav-menu-slot.webp", art: { src: "/images/game-categories/slot.webp", width: 480, height: 179 }, thumb: "/images/game-categories/slot-mobile-v2.webp" },
      { id: "FISHING", title: "FISHING", label: t("sidebar.fishing"), icon: "/icons/menu/ic-nav-menu-fishing-game.webp", art: { src: "/images/game-categories/fishing.webp", width: 480, height: 173 }, thumb: "/images/game-categories/fishing-mobile-v2.webp" },
      { id: "CARD", title: "CARD", label: t("sidebar.card"), icon: "/icons/menu/ic-nav-menu-casino.webp", art: { src: "/images/game-categories/card.webp", width: 480, height: 176 }, thumb: "/images/game-categories/card-mobile-v2.webp" },
      { id: "SPORT", title: "SPORT", label: t("sidebar.sport"), icon: "/icons/menu/ic-nav-menu-sport.webp", art: { src: "/images/game-categories/sport.webp", width: 480, height: 185 }, thumb: "/images/game-categories/sport-mobile-v2.webp" },
    ];
    // real game counts from GET /games (hidden while loading)
    return base.map((c) => ({ ...c, count: loading ? undefined : allGames.filter((g) => gameMatchesRoomCategory(g, c.id)).length }));
  }, [t, allGames, loading]);

  const visibleProviders = useMemo(() => products
    .map((p) => ({ id: p, count: allGames.filter((g) => g.product_id === p && gameMatchesRoomCategory(g, selectedCategory)).length }))
    .filter((p) => p.count > 0), [products, allGames, selectedCategory]);

  // providers that actually have active games (for the "Why SNAKE168" copy)
  const providerCount = useMemo(() => new Set(allGames.map((g) => g.product_id)).size, [allGames]);

  const slotProviders = useMemo(() => products
    .filter((p) => allGames.some((g) => g.product_id === p && isSlotGame(g)))
    .sort((a, b) => {
      if (a.toUpperCase().includes("PG")) return -1;
      if (b.toUpperCase().includes("PG")) return 1;
      return 0;
    })
    .slice(0, 10)
    .map((p) => ({ id: p, count: allGames.filter((g) => g.product_id === p && isSlotGame(g)).length })), [products, allGames]);

  /* ---------- favorites tab (shared browser-local store, see components/lobby/favoriteGames.ts) ----------
     Favorites hold only "<PRODUCT_ID>:<game_code>" keys. Game metadata comes from the catalogue this page
     already loads (GET /games, all providers); only favorites missing from it trigger one GET /games?productId=…
     per provider (once per visit). Keys that resolve nowhere (game removed / disabled) are simply not shown. */
  const { favorites, isFavorite, toggle: toggleFavorite } = useFavoriteGames();
  const [favoriteExtra, setFavoriteExtra] = useState<Record<string, Game[]>>({});
  const requestedFavoriteProviders = useRef(new Set<string>());
  const [favoriteCoverRatio, setFavoriteCoverRatio] = useState<number | null>(null);

  const gameByFavoriteKey = useMemo(() => {
    const map = new Map<string, Game>();
    for (const g of allGames) map.set(favoriteKey(g.product_id, g.game_code), g);
    for (const list of Object.values(favoriteExtra)) {
      for (const g of list) {
        const k = favoriteKey(g.product_id, g.game_code);
        if (!map.has(k)) map.set(k, g);
      }
    }
    return map;
  }, [allGames, favoriteExtra]);

  const missingFavoriteProviders = useMemo(() => {
    if (loading || loadError) return [];
    const ids = new Set<string>();
    for (const k of favorites) {
      const parsed = parseFavoriteKey(k);
      if (parsed && !gameByFavoriteKey.has(k) && !(parsed.productId in favoriteExtra)) ids.add(parsed.productId);
    }
    return [...ids];
  }, [favorites, gameByFavoriteKey, favoriteExtra, loading, loadError]);

  useEffect(() => {
    if (activeTab !== "favorite") return;
    for (const upperId of missingFavoriteProviders) {
      if (requestedFavoriteProviders.current.has(upperId)) continue;
      requestedFavoriteProviders.current.add(upperId);
      // keys store the id upper-cased; ask the API with its own spelling when known
      const productId = products.find((p) => p.toUpperCase() === upperId) ?? upperId;
      api.get("/games", { params: { productId } }).then((res) => {
        const data = res.data.data?.data || res.data.data || [];
        const active = Array.isArray(data) ? data.filter((g: Game) => g.is_active) : [];
        setFavoriteExtra((prev) => ({ ...prev, [upperId]: active }));
      }).catch(() => setFavoriteExtra((prev) => ({ ...prev, [upperId]: [] })));
    }
  }, [activeTab, missingFavoriteProviders, products]);

  // newest favorite first; one card per key (the store never holds duplicates)
  const favoriteGames = useMemo(
    () => [...favorites].reverse().map((k) => gameByFavoriteKey.get(k)).filter((g): g is Game => Boolean(g)),
    [favorites, gameByFavoriteKey],
  );
  const loadingFavorites = loading || missingFavoriteProviders.length > 0;
  const handleToggleFavorite = (game: Game) => {
    if (!toggleFavorite(favoriteKey(game.product_id, game.game_code))) alertFavoriteSaveFailed();
  };

  const showGames = activeTab === "recent" || activeTab === "favorite" || !(isRoomMode || selectedCategory === "");
  const displayedGames: RecentGame[] = activeTab === "recent" ? recentGames : games;
  const isGamesLoading = activeTab === "recent" ? loadingRecent : activeTab === "favorite" ? loadingFavorites : loading;
  const activeCategory = categories.find((c) => c.id === selectedCategory);

  const tabs = [
    { id: "highlight", label: t("lobby.highlight"), href: "", icon: Icon.star },
    { id: "recent", label: t("lobby.recent"), href: "", icon: Icon.clock },
    { id: "favorite", label: t("lobby.favorites"), href: "", icon: Icon.heart },
    { id: "promotion", label: t("lobby.promotion"), href: "/promotions", icon: Icon.gift },
    { id: "news", label: t("lobby.news"), href: "/history", icon: Icon.news },
    { id: "live", label: t("lobby.live"), href: "/live", icon: Icon.live },
  ];

  const gamesTitle = activeTab === "recent"
    ? t("lobby.recent")
    : activeTab === "favorite"
      ? t("lobby.favorites")
      : (selectedCategory || selectedProduct || t("lobby.allGames"));
  const gamesCount = activeTab === "favorite" ? favoriteGames.length : displayedGames.length;

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
              {/* decorative Christmas speaker (animated transparent WebP, 508×337 — plain <img> so the animation is
                  served as-is); the button's aria-label describes the action */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/icons/christmas-speaker-snow-transparent.webp"
                alt=""
                width={508}
                height={337}
                className={styles.marqueeIconImg}
                decoding="async"
                draggable={false}
              />
            </button>
            <div className={styles.marqueeViewport}>
              <span className={styles.marqueeTrack}>
                <span className={styles.marqueeText}>{t("lobby.marquee")}</span>
                <span className={styles.marqueeText} aria-hidden="true">{t("lobby.marquee")}</span>
              </span>
            </div>
          </div>

          {/* ===== Tabs ===== */}
          <div className={styles.toolbar}>
            <LobbyTabStrip activeKey={activeTab}>
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
            </LobbyTabStrip>
          </div>

          {/* ===== Activities (backend-driven) ===== */}
          <Activities page="lobby" slot="icon_grid" />

          {/* ===== Mobile: category rail beside the content (desktop: display:contents, rail hidden) ===== */}
          <div className={styles.catSplit}>
          <div className={styles.catRail}>
            <GameSidebar
              variant="rail"
              items={categories}
              selected={selectedCategory}
              onSelect={handleCategoryFilter}
              ariaLabel={t("lobby.categories")}
            />
          </div>

          {/* ===== Main content: providers or games ===== */}
          {showGames ? (
            <section className={styles.section} aria-labelledby="games-heading">
              <SectionHeader
                id="games-heading"
                title={gamesTitle}
                icon={activeTab === "recent" ? Icon.clock : activeTab === "favorite" ? Icon.heart : Icon.grid}
                count={isGamesLoading ? undefined : `${gamesCount.toLocaleString()} ${t("lobby.games")}`}
              />
              {isGamesLoading ? (
                <SkeletonGrid variant="game" count={12} />
              ) : loadError && activeTab !== "recent" ? (
                <EmptyState
                  title={t("lobby.loadError")}
                  action={<button type="button" className={styles.linkBtn} onClick={() => fetchGames(selectedProduct)}>{t("lobby.retry")}</button>}
                />
              ) : activeTab === "favorite" ? (
                favoriteGames.length === 0 ? (
                  <EmptyState
                    title={t("lobby.noFavorites")}
                    hint={t("lobby.noFavoritesHint")}
                    action={<button type="button" className={styles.linkBtn} onClick={() => { setActiveTab("highlight"); handleCategoryFilter(""); }}>{t("lobby.browseGames")}</button>}
                  />
                ) : (
                  // same card as the provider rooms: original cover, provider logo, heart (separate button), launch on click
                  <div style={favoriteCoverRatio ? { ["--cover-ar" as string]: favoriteCoverRatio } : undefined}>
                    <CardGrid variant="game">
                      {favoriteGames.map((game, i) => (
                        <ProviderGameCard
                          key={favoriteKey(game.product_id, game.game_code)}
                          title={gameTitle(game)}
                          imageUrl={game.image_url}
                          productId={game.product_id}
                          category={game.category}
                          onLaunch={() => launchGame(game)}
                          favorite={isFavorite(favoriteKey(game.product_id, game.game_code))}
                          onToggleFavorite={() => handleToggleFavorite(game)}
                          eager={i < 8}
                          onCoverLoad={favoriteCoverRatio ? undefined : (w, h) => setFavoriteCoverRatio((r) => r ?? w / h)}
                        />
                      ))}
                    </CardGrid>
                  </div>
                )
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
                plain
                count={loading ? undefined : `${visibleProviders.length} ${t("lobby.providers")}`}
              />
              {loading ? (
                <SkeletonGrid count={12} />
              ) : loadError ? (
                <EmptyState
                  title={t("lobby.loadError")}
                  action={<button type="button" className={styles.linkBtn} onClick={() => fetchGames(selectedProduct)}>{t("lobby.retry")}</button>}
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
                      festive
                    />
                  ))}
                </CardGrid>
              )}
            </section>
          )}
          </div>

          {/* ===== Recommended slot providers (real data: providers with slot games) ===== */}
          {!showGames && !loading && slotProviders.length > 0 && (
            <section className={`${styles.section} ${styles.panel} ${styles.santaPanel}`} aria-labelledby="slots-heading">
              <SectionHeader
                id="slots-heading"
                title={t("lobby.recommendedSlots")}
                icon={Icon.santa}
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

          {/* ===== Recent withdrawals — DEMO data (no feed API yet), labelled as simulated in the header ===== */}
          <RecentWithdrawals items={DEMO_WITHDRAWALS} live={false} />

          {/* ===== Why SNAKE168 + FAQ + support (Modern Color Style 2) ===== */}
          <LobbyInfo providerCount={loading || loadError ? undefined : providerCount} />

          {/* ===== Activities: large cards ===== */}
          <Activities page="lobby" slot="home_card" />
        </main>
      </div>

      <LobbyFooter />
    </div>
  );
}
