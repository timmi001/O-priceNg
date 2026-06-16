import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import {
  Search, Mic, Camera, Menu, ShoppingBag, Loader2,
} from "lucide-react";
import { useGetListings, useGetFeaturedListings } from "@/lib/supabase-hooks";
import { PinterestCard } from "@/components/pinterest-card";
import { BottomNav } from "@/components/navigation";
import { Sidebar } from "@/components/sidebar";
import { CategoryBar } from "@/components/category-bar";
import { SubcategoryChips } from "@/components/subcategory-chips";
import { CATEGORY_CONFIG } from "@/lib/categories";
import { motion, AnimatePresence } from "framer-motion";
import type { Listing } from "@/lib/types";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 50;

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── category / subcategory filters ─────────────────────── */
  const [activeCategory, setActiveCategory]       = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  const handleCategoryChange = (slug: string | null) => {
    setActiveCategory(slug);
    setActiveSubcategory(null);
    setPage(1);
    setAllItems([]);
    setHasMore(true);
  };

  const handleSubcategoryChange = (sub: string | null) => {
    setActiveSubcategory(sub);
    setPage(1);
    setAllItems([]);
    setHasMore(true);
  };

  /* resolve category label for Supabase .eq("category", ...) */
  const categoryLabel = activeCategory
    ? CATEGORY_CONFIG.find(c => c.slug === activeCategory)?.label ?? null
    : null;

  /* ── pagination ─────────────────────────────────────────── */
  const [page, setPage]         = useState(1);
  const [allItems, setAllItems] = useState<Listing[]>([]);
  const [hasMore, setHasMore]   = useState(true);
  const loadingMore             = useRef(false);
  const sentinelRef             = useRef<HTMLDivElement>(null);

  const { data: featuredListings }                  = useGetFeaturedListings();
  const { data: listingsPage, isLoading, isError }  = useGetListings({
    limit: PAGE_SIZE,
    page,
    category: categoryLabel ?? undefined,
    subcategory: activeSubcategory ?? undefined,
  });

  /* Accumulate pages */
  useEffect(() => {
    if (!listingsPage) return;
    const incoming = listingsPage.listings ?? [];
    setAllItems(prev => {
      const existingIds = new Set(prev.map(l => l.id));
      const fresh = incoming.filter((l: Listing) => !existingIds.has(l.id));
      return [...prev, ...fresh];
    });
    if (incoming.length < PAGE_SIZE) setHasMore(false);
    loadingMore.current = false;
  }, [listingsPage]);

  /* Merge featured only on "All" (no category filter) */
  const featuredIds = new Set((featuredListings ?? []).map((l: Listing) => l.id));
  const feed: (Listing & { isSponsored?: boolean })[] = activeCategory
    ? allItems
    : [
        ...(featuredListings ?? []).map((l: Listing) => ({ ...l, isSponsored: true as const })),
        ...allItems.filter(l => !featuredIds.has(l.id)),
      ];

  /* Infinite scroll */
  const loadMore = useCallback(() => {
    if (loadingMore.current || !hasMore || isLoading) return;
    loadingMore.current = true;
    setPage(p => p + 1);
  }, [hasMore, isLoading]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  /* ── scroll-hide header ─────────────────────────────────── */
  const [headerVisible, setHeaderVisible]          = useState(true);
  const [floatingSearchVisible, setFloatingSearch] = useState(false);
  const lastScrollY                                = useRef(0);
  const ticking                                    = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const cur   = window.scrollY;
        const delta = cur - lastScrollY.current;
        if (Math.abs(delta) > SCROLL_THRESHOLD) {
          setHeaderVisible(delta < 0);
          setFloatingSearch(delta > 0);
          lastScrollY.current = cur;
        }
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* header height: base ~156px + ~36px subcategory row if visible */
  const headerPt = activeCategory ? "pt-[196px]" : "pt-[160px]";

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d] text-foreground">

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── MAIN HEADER ── */}
      <div
        className="fixed top-0 left-0 right-0 md:left-[220px] z-40 transition-transform duration-300 ease-in-out will-change-transform"
        style={{ transform: headerVisible ? "translateY(0)" : "translateY(-100%)" }}
      >
        <div className="bg-[#f8f9fa]/95 dark:bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-black/6 dark:border-white/5 px-4 pt-4 pb-3">

          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 dark:hover:bg-white/8 transition-colors text-gray-500 dark:text-white/60"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block w-9 h-9" />
            <div />
            <Link href="/profile">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-primary/10 border-2 border-primary/30 overflow-hidden" />
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center bg-black/5 dark:bg-white/6 border border-black/8 dark:border-white/10 rounded-2xl px-4 py-2.5 gap-3 mb-3">
            <Search className="w-4 h-4 text-gray-400 dark:text-white/40 shrink-0" />
            <Link href="/explore" className="flex-1 text-sm text-gray-400 dark:text-white/30 cursor-pointer">
              Search products, sellers, categories…
            </Link>
            <div className="flex items-center gap-2 text-gray-400 dark:text-white/40">
              <button className="hover:text-primary transition-colors"><Mic className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
              <button className="hover:text-primary transition-colors"><Camera className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Category bar */}
          <CategoryBar active={activeCategory} onChange={handleCategoryChange} />

          {/* Subcategory chips — slides in when a category is selected */}
          <SubcategoryChips
            categorySlug={activeCategory}
            active={activeSubcategory}
            onChange={handleSubcategoryChange}
          />
        </div>
      </div>

      {/* ── FLOATING COMPACT SEARCH ── */}
      <AnimatePresence>
        {floatingSearchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-3 left-4 right-4 md:left-[228px] z-50"
          >
            <Link href="/explore">
              <div className="flex items-center gap-3 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-black/10 dark:border-white/12 rounded-2xl px-4 py-3 shadow-lg shadow-black/10 dark:shadow-2xl dark:shadow-black/60">
                <Search className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 text-sm text-gray-400 dark:text-white/40">Search O'Price Ng…</span>
                <Camera className="w-4 h-4 text-gray-300 dark:text-white/30" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FEED ── */}
      <main className={`${headerPt} pb-28 px-2`}>

        {/* Active filter label */}
        {(activeCategory || activeSubcategory) && (
          <div className="flex items-center gap-2 px-1 pb-3">
            <span className="text-[13px] font-semibold text-gray-700 dark:text-white/70">
              {activeSubcategory
                ? `${CATEGORY_CONFIG.find(c => c.slug === activeCategory)?.label} › ${activeSubcategory}`
                : CATEGORY_CONFIG.find(c => c.slug === activeCategory)?.label}
            </span>
            <button
              onClick={() => handleCategoryChange(null)}
              className="text-[11px] text-gray-400 dark:text-white/30 hover:text-primary transition-colors underline underline-offset-2"
            >
              Clear
            </button>
          </div>
        )}

        {isLoading && allItems.length === 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4" style={{ columnGap: "8px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-2.5 rounded-[18px] overflow-hidden bg-neutral-100 dark:bg-neutral-800 animate-pulse"
              >
                <div
                  className="w-full bg-neutral-200 dark:bg-neutral-700"
                  style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/5" }}
                />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-600 rounded w-1/2" />
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-600 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>

        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/80 mb-2">
              Could not load listings
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/40 max-w-xs">
              The database tables haven't been set up yet. Run the schema in your Supabase SQL Editor to get started.
            </p>
          </div>

        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingBag className="w-7 h-7 text-primary/60" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/80 mb-2">
              {activeCategory ? "No listings in this category" : "No listings yet"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/40 max-w-xs mb-5">
              {activeCategory
                ? "Be the first to post something here."
                : "Be the first to post something for sale on O'Price Ng."}
            </p>
            <Link href="/sell">
              <div className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold">
                + Post a listing
              </div>
            </Link>
          </div>

        ) : (
          <>
            <div className="columns-2 md:columns-3 lg:columns-4" style={{ columnGap: "8px" }}>
              {feed.map((listing, i) => (
                <PinterestCard
                  key={`${listing.isSponsored ? "sp-" : ""}${listing.id}`}
                  listing={listing}
                  index={i}
                />
              ))}
            </div>

            <div ref={sentinelRef} className="h-4" />

            {(isLoading && feed.length > 0) && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
              </div>
            )}

            {!hasMore && feed.length > 0 && (
              <p className="text-center text-[12px] text-gray-400 dark:text-white/20 py-6">
                You're all caught up ✓
              </p>
            )}
          </>
        )}
      </main>

      <BottomNav hidden={!headerVisible} />
    </div>
  );
}
