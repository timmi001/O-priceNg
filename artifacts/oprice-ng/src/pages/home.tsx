import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Search, Mic, Camera, Menu, ShoppingBag, Car, Shirt, Building2, BriefcaseBusiness, Tag, Loader2, Plus } from "lucide-react";
import { useGetListings, useGetFeaturedListings } from "@workspace/api-client-react";
import { DiscoverCard } from "@/components/discover-card";
import { BottomNav } from "@/components/navigation";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { label: "Electronics", icon: ShoppingBag, color: "#1d3461" },
  { label: "Vehicles", icon: Car, color: "#2d1b00" },
  { label: "Fashion", icon: Shirt, color: "#2d0a1a" },
  { label: "Property", icon: Building2, color: "#0a2d1a" },
  { label: "Jobs", icon: BriefcaseBusiness, color: "#1a0a2d" },
  { label: "Deals", icon: Tag, color: "#2d1a00" },
];

const SCROLL_THRESHOLD = 50;

export default function Home() {
  const { data: listingsPage, isLoading } = useGetListings({ limit: 20 });
  const { data: featuredListings } = useGetFeaturedListings();

  const [headerVisible, setHeaderVisible] = useState(true);
  const [floatingSearchVisible, setFloatingSearchVisible] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = window;

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY.current;

        if (Math.abs(delta) > SCROLL_THRESHOLD) {
          if (delta > 0) {
            // scrolling down — hide header, show float
            setHeaderVisible(false);
            setFloatingSearchVisible(true);
          } else {
            // scrolling up — show header, hide float
            setHeaderVisible(true);
            setFloatingSearchVisible(false);
          }
          lastScrollY.current = currentY;
        }

        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuredIds = new Set((featuredListings ?? []).map(l => l.id));
  const allListings = [
    ...(featuredListings ?? []).map(l => ({ ...l, isSponsored: true })),
    ...(listingsPage?.listings ?? []).filter(l => !featuredIds.has(l.id)),
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0d0d0d] text-foreground">

      {/* ── MAIN HEADER ── sticky, auto-hides on scroll down */}
      <div
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out will-change-transform"
        style={{ transform: headerVisible ? "translateY(0)" : "translateY(-100%)" }}
      >
        <div className="bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-4 pb-3">
          {/* Top row: menu + logo + avatar */}
          <div className="flex items-center justify-between mb-4">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-white/60"
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-[22px] font-black text-primary tracking-tight">O'price Ng</h1>

            <Link href="/profile" data-testid="link-profile-avatar">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/60 to-primary/10 border-2 border-primary/30 overflow-hidden" />
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center bg-white/6 border border-white/10 rounded-2xl px-4 py-3 gap-3">
            <Search className="w-4 h-4 text-white/40 shrink-0" />
            <Link href="/explore" className="flex-1 text-sm text-white/30 cursor-pointer" data-testid="input-search-home">
              Search products, sellers, categories…
            </Link>
            <div className="flex items-center gap-2 text-white/40">
              <button className="hover:text-primary transition-colors" data-testid="button-voice-search">
                <Mic className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button className="hover:text-primary transition-colors" data-testid="button-camera-search">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category quick-action chips */}
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

      {/* ── FLOATING COMPACT SEARCH — appears when header hidden ── */}
      <AnimatePresence>
        {floatingSearchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-3 left-4 right-4 z-50"
          >
            <Link href="/explore">
              <div className="flex items-center gap-3 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/12 rounded-2xl px-4 py-3 shadow-2xl shadow-black/60">
                <Search className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 text-sm text-white/40">Search O'price Ng…</span>
                <Camera className="w-4 h-4 text-white/30" />
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FEED ── padded to clear sticky header (~160px) */}
      <main className="pt-[168px] pb-28">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-white/30">Loading your feed…</p>
          </div>
        ) : (
          <div>
            {allListings.map((listing, i) => (
              <DiscoverCard key={`${listing.isSponsored ? "sp" : ""}${listing.id}`} listing={listing} index={i} />
            ))}

            {/* Load more hint */}
            {allListings.length > 0 && (
              <div className="flex justify-center py-8">
                <button className="text-sm text-white/30 flex items-center gap-2 hover:text-primary transition-colors">
                  <Loader2 className="w-4 h-4" />
                  Load more listings
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── BOTTOM NAV (auto-hides with same logic) ── */}
      <BottomNav hidden={!headerVisible} />
    </div>
  );
}
