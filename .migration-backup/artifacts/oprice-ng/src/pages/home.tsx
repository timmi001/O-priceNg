import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import {
  Search, Mic, Camera, Menu,
  ShoppingBag, Car, Shirt, Building2, BriefcaseBusiness, Tag, Loader2,
} from "lucide-react";
import { useGetListings, useGetFeaturedListings } from "@workspace/api-client-react";
import { PinterestCard } from "@/components/pinterest-card";
import { BottomNav } from "@/components/navigation";
import { Sidebar } from "@/components/sidebar";

import { motion, AnimatePresence } from "framer-motion";
import type { Listing } from "@workspace/api-client-react";

const CATEGORIES = [
  { label: "Electronics", icon: ShoppingBag, color: "#1d3461" },
  { label: "Vehicles",    icon: Car,             color: "#2d1b00" },
  { label: "Fashion",     icon: Shirt,            color: "#2d0a1a" },
  { label: "Property",    icon: Building2,        color: "#0a2d1a" },
  { label: "Jobs",        icon: BriefcaseBusiness, color: "#1a0a2d" },
  { label: "Deals",       icon: Tag,              color: "#2d1a00" },
];

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 50;

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── data ─────────────────────────────────────────────── */
  const [page, setPage]         = useState(1);
  const [allItems, setAllItems] = useState<Listing[]>([]);
  const [hasMore, setHasMore]   = useState(true);
  const loadingMore             = useRef(false);
  const sentinelRef             = useRef<HTMLDivElement>(null);

  const { data: featuredListings }           = useGetFeaturedListings();
  const { data: listingsPage, isLoading }    = useGetListings({ limit: PAGE_SIZE, page });

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

  /* Merge featured (pinned at top) */
  const featuredIds = new Set((featuredListings ?? []).map((l: Listing) => l.id));
  const feed: (Listing & { isSponsored?: boolean })[] = [
    ...(featuredListings ?? []).map((l: Listing) => ({ ...l, isSponsored: true as const })),
    ...allItems.filter(l => !featuredIds.has(l.id)),
  ];

  /* IntersectionObserver infinite scroll */
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

  /* ── scroll-hide header ────────────────────────────────── */
  const [headerVisible, setHeaderVisible]         = useState(true);
  const [floatingSearchVisible, setFloatingSearch] = useState(false);
  const lastScrollY                               = useRef(0);
  const ticking                                   = useRef(false);

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

  /* ── render ────────────────────────────────────────────── */
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
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 dark:hover:bg-white/8 transition-colors text-gray-500 dark:text-white/60"
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:block w-9 h-9" />
            <h1 className="text-[22px] font-black tracking-tight">
              <span className="text-gray-900 dark:text-white">O'Price</span>{" "}
              <span className="text-primary">Ng</span>
            </h1>
            <div className="flex items-center gap-2">
              <Link href="/profile" data-testid="link-profile-avatar">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-primary/10 border-2 border-primary/30 overflow-hidden" />
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center bg-black/5 dark:bg-white/6 border border-black/8 dark:border-white/10 rounded-2xl px-4 py-3 gap-3">
            <Search className="w-4 h-4 text-gray-400 dark:text-white/40 shrink-0" />
            <Link href="/explore" className="flex-1 text-sm text-gray-400 dark:text-white/30 cursor-pointer" data-testid="input-search-home">
              Search products, sellers, categories…
            </Link>
            <div className="flex items-center gap-2 text-gray-400 dark:text-white/40">
              <button className="hover:text-primary transition-colors" data-testid="button-voice-search">
                <Mic className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
              <button className="hover:text-primary transition-colors" data-testid="button-camera-search">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar pb-0.5">
            {CATEGORIES.map(({ label, icon: Icon, color }) => (
              <Link
                key={label}
                href={`/explore?category=${encodeURIComponent(label)}`}
                data-testid={`chip-category-${label.toLowerCase()}`}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 shrink-0 backdrop-blur-sm transition-transform active:scale-95"
                  style={{ backgroundColor: color + "cc" }}
                >
                  <Icon className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-[12px] font-semibold text-white/80 whitespace-nowrap">{label}</span>
                </div>
              </Link>
            ))}
          </div>
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
      <main className="pt-[168px] pb-28 px-2">
        {isLoading && feed.length === 0 ? (
          <div
            className="columns-2 md:columns-3 lg:columns-4"
            style={{ columnGap: "8px" }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-2.5 rounded-[18px] overflow-hidden bg-white dark:bg-[#161616] animate-pulse"
              >
                <div
                  className="w-full bg-black/5 dark:bg-white/5"
                  style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/5" }}
                />
                <div className="p-2.5 space-y-2">
                  <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-2/3" />
                  <div className="h-2 bg-black/5 dark:bg-white/5 rounded w-1/2" />
                  <div className="h-2 bg-black/5 dark:bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Pinterest masonry — CSS columns */}
            <div className="columns-2 md:columns-3 lg:columns-4" style={{ columnGap: "8px" }}>
              {feed.map((listing, i) => (
                <PinterestCard
                  key={`${listing.isSponsored ? "sp-" : ""}${listing.id}`}
                  listing={listing}
                  index={i}
                />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {/* Loading more spinner */}
            {(isLoading && feed.length > 0) && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
              </div>
            )}

            {/* End of feed */}
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
