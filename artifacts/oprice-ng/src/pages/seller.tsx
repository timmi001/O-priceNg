import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft, BadgeCheck, MapPin, MessageSquare, Star,
  ShoppingBag, Clock, Bookmark, ChevronRight, Shield,
  Truck, RotateCcw, Phone, Package, Flame, Sparkles,
  ThumbsUp, Calendar,
} from "lucide-react";
import {
  useGetUserProfile, useGetUserListings, useGetFeaturedListings,
} from "@workspace/api-client-react";
import { PinterestCard } from "@/components/pinterest-card";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import type { Listing } from "@workspace/api-client-react/src/generated/api.schemas";

/* ── tab definition ─────────────────────────────────────── */
type Tab = "all" | "featured" | "new" | "reviews" | "about";
const TABS: { key: Tab; label: string }[] = [
  { key: "all",      label: "All Listings"  },
  { key: "featured", label: "⚡ Featured"    },
  { key: "new",      label: "New Arrivals"  },
  { key: "reviews",  label: "Reviews"       },
  { key: "about",    label: "About"         },
];

/* ── mock reviews ────────────────────────────────────────── */
const MOCK_REVIEWS = [
  { id: 1, name: "Amara O.",    avatar: null, rating: 5, text: "Super fast delivery and exactly as described. Will definitely buy again!", date: "2026-05-18" },
  { id: 2, name: "Chukwu E.",   avatar: null, rating: 5, text: "Legit seller. Phone was brand new and sealed. Highly recommend 🙌", date: "2026-05-12" },
  { id: 3, name: "Fatima B.",   avatar: null, rating: 4, text: "Good product, honest about the condition. Quick response too.", date: "2026-04-30" },
  { id: 4, name: "Emeka D.",    avatar: null, rating: 5, text: "Best experience I've had on this app. Packaged very professionally.", date: "2026-04-20" },
  { id: 5, name: "Ngozi A.",    avatar: null, rating: 4, text: "Item matched description perfectly. Would trust this seller again.", date: "2026-04-05" },
];

/* ── category gradients ─────────────────────────────────── */
const CAT_GRAD: Record<string, string> = {
  Phones: "from-violet-900 to-purple-950",
  Electronics: "from-blue-900 to-indigo-950",
  Computers: "from-sky-900 to-blue-950",
  Fashion: "from-pink-900 to-rose-950",
  Vehicles: "from-orange-900 to-amber-950",
  "Home & Kitchen": "from-teal-900 to-cyan-950",
  Property: "from-emerald-900 to-green-950",
  Appliances: "from-slate-800 to-zinc-950",
};
const CAT_BG: Record<string, string> = {
  Phones: "#1a0533", Electronics: "#0a1628", Computers: "#071525",
  Fashion: "#1f0a14", Vehicles: "#1a0e00", "Home & Kitchen": "#041a18",
  Property: "#041a0c", Appliances: "#0e0f12",
};

/* ── featured carousel card ─────────────────────────────── */
function FeaturedCard({ listing, badge }: { listing: Listing; badge?: string }) {
  const [, nav] = useLocation();
  const grad = CAT_GRAD[listing.category] ?? "from-zinc-900 to-black";
  const bg   = CAT_BG[listing.category]  ?? "#111";

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => nav(`/listing/${listing.id}`)}
      className="shrink-0 w-[200px] cursor-pointer"
      data-testid={`featured-card-${listing.id}`}
    >
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#161616] shadow-md dark:shadow-xl shadow-black/10 dark:shadow-black/40">
        <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ backgroundColor: bg }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
          {listing.images?.[0] && (
            <img src={listing.images[0]} alt={listing.title} className="absolute inset-0 w-full h-full object-cover" />
          )}
          {badge && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <Flame className="w-3 h-3 text-primary-foreground" />
              <span className="text-[10px] font-black text-primary-foreground">{badge}</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="text-[16px] font-black text-white drop-shadow">₦{listing.price.toLocaleString()}</span>
          </div>
        </div>
        <div className="px-3 py-2.5">
          <p className="text-[12px] font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1">{listing.title}</p>
          <p className="text-[10px] text-gray-400 dark:text-white/30 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />{listing.location}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── discover-style tall card ───────────────────────────── */
function DiscoverFeedCard({ listing }: { listing: Listing }) {
  const [saved, setSaved] = useState(listing.isWatched ?? false);
  const [, nav] = useLocation();
  const grad = CAT_GRAD[listing.category] ?? "from-zinc-900 to-black";
  const bg   = CAT_BG[listing.category]  ?? "#111";

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => nav(`/listing/${listing.id}`)}
      className="bg-white dark:bg-[#161616] rounded-3xl overflow-hidden shadow-sm dark:shadow-lg shadow-black/5 dark:shadow-black/30 cursor-pointer mb-3"
      data-testid={`feed-card-${listing.id}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden" style={{ backgroundColor: bg }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
        {listing.images?.[0] && (
          <img src={listing.images[0]} alt={listing.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        )}
        {listing.isSponsored && (
          <span className="absolute top-3 left-3 text-[10px] font-bold text-white/60 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
            Sponsored
          </span>
        )}
        <button
          onClick={e => { e.stopPropagation(); setSaved(p => !p); toast.success(saved ? "Removed from saved" : "Saved!"); }}
          className="absolute top-3 right-3 w-9 h-9 bg-black/55 backdrop-blur-md rounded-full flex items-center justify-center"
          data-testid={`btn-save-${listing.id}`}
        >
          <Bookmark className="w-4 h-4 text-white" fill={saved ? "currentColor" : "none"} />
        </button>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-4 flex items-baseline gap-2 z-10">
          <span className="text-[20px] font-black text-white drop-shadow">₦{listing.price.toLocaleString()}</span>
          {listing.originalPrice && (
            <span className="text-[12px] text-white/40 line-through">₦{listing.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2">{listing.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-white/30">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{listing.location}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />{listing.condition}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={e => { e.stopPropagation(); nav(`/listing/${listing.id}`); }}
            className="flex items-center gap-1 text-[12px] font-bold text-primary hover:opacity-80"
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── star row ────────────────────────────────────────────── */
function Stars({ n, size = 3.5 }: { n: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`text-amber-400`} style={{ width: size * 4, height: size * 4 }}
          fill={i < n ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

/* ── review card ─────────────────────────────────────────── */
function ReviewCard({ r }: { r: typeof MOCK_REVIEWS[0] }) {
  const initials = r.name.split(" ").map(w => w[0]).join("").slice(0, 2);
  return (
    <div className="bg-white dark:bg-[#161616] rounded-2xl p-4 shadow-sm dark:shadow-none">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center shrink-0">
          <span className="text-[12px] font-black text-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[13px] font-bold text-gray-900 dark:text-white">{r.name}</span>
            <span className="text-[10px] text-gray-400 dark:text-white/25 shrink-0">{format(new Date(r.date), "MMM d, yyyy")}</span>
          </div>
          <Stars n={r.rating} />
          <p className="text-[13px] text-gray-500 dark:text-white/55 leading-relaxed mt-2">{r.text}</p>
          <button className="mt-2 flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/25 hover:text-primary transition-colors">
            <ThumbsUp className="w-3 h-3" /> Helpful
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── mini stat ───────────────────────────────────────────── */
function MiniStat({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-2xl px-3 py-2.5">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <div>
        <p className="text-[14px] font-black text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── page ────────────────────────────────────────────────── */
export default function SellerProfile() {
  const { username } = useParams<{ username: string }>();
  const [, nav]      = useLocation();
  const [tab, setTab] = useState<Tab>("all");
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const tabBarRef  = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: profile,  isLoading: loadingProfile  } = useGetUserProfile(username);
  const { data: listings, isLoading: loadingListings } = useGetUserListings(username);
  const { data: featured }                             = useGetFeaturedListings();

  /* Collapse header on scroll past sentinel */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setHeaderCollapsed(!e.isIntersecting),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* derived */
  const newArrivals = useMemo(
    () => [...(listings ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    [listings],
  );

  const avgRating  = MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length;
  const joinedAgo  = profile ? formatDistanceToNow(new Date(profile.joinDate), { addSuffix: false }) : "";

  /* ── Loading ── */
  if (loadingProfile) {
    return (
      <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d]">
        <div className="h-2 w-full bg-primary/30 animate-pulse" />
        <div className="px-4 pt-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-black/8 dark:bg-white/8 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-black/8 dark:bg-white/8 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d] flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-white/30">
        <Package className="w-10 h-10 opacity-20" />
        <p className="font-semibold">Seller not found</p>
        <button onClick={() => nav("/")} className="text-primary text-sm font-bold">Go home</button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d] text-foreground pb-16">

      {/* ── STICKY COLLAPSED MINI-HEADER ── appears on scroll ── */}
      <AnimatePresence>
        {headerCollapsed && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 md:left-[220px] z-50 bg-[#f8f9fa]/95 dark:bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-black/6 dark:border-white/5 px-4 py-3 flex items-center gap-3"
          >
            <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full bg-black/6 dark:bg-white/6 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-white/60" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary/10 overflow-hidden shrink-0">
              {profile.avatar && <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-gray-900 dark:text-white truncate flex items-center gap-1">
                {profile.name}
                {profile.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-white/30">@{profile.username}</p>
            </div>
            <button
              onClick={() => { nav("/messages"); toast.success("Opening messages…"); }}
              className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
              data-testid="btn-message-mini"
            >
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FULL HEADER ── */}
      <div className="px-4 pt-5 pb-4">
        {/* Back + identity row */}
        <div className="flex items-start gap-4 mb-5">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-full bg-black/6 dark:bg-white/6 flex items-center justify-center mt-1 shrink-0"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-white/60" />
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/50 to-primary/10 overflow-hidden shadow-xl shadow-black/40">
              {profile.avatar
                ? <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-[20px] font-black text-primary/60">
                    {profile.name[0]}
                  </div>
              }
            </div>
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h1 className="text-[20px] font-black text-gray-900 dark:text-white leading-tight">{profile.name}</h1>
              {profile.isVerified && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-500 dark:text-white/35 mb-1">@{profile.username}</p>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-white/25 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
              <span className="w-1 h-1 rounded-full bg-black/15 dark:bg-white/15" />
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {joinedAgo} ago</span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <MiniStat icon={Star}         value={profile.rating.toFixed(1)} label="Rating"    />
          <MiniStat icon={ShoppingBag}  value={String(profile.totalSales)} label="Sales"    />
          <MiniStat icon={Clock}        value="< 1hr"                       label="Response" />
        </div>

        {/* Bio (if present) */}
        {profile.bio && (
          <p className="text-[13px] text-gray-500 dark:text-white/45 leading-relaxed mb-4">{profile.bio}</p>
        )}

        {/* Message + Contact buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => { nav("/messages"); toast.success("Opening messages…"); }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground text-[14px] font-black shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
            data-testid="button-message-seller"
          >
            <MessageSquare className="w-4 h-4" /> Message Seller
          </button>
          <button
            onClick={() => toast.info("Call feature coming soon!")}
            className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/6 border border-black/8 dark:border-white/8 flex items-center justify-center text-gray-500 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            data-testid="button-call"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll sentinel (tells us when full header is out of view) */}
      <div ref={sentinelRef} className="h-px" />

      {/* ── STICKY TABS ── */}
      <div
        ref={tabBarRef}
        className="sticky top-0 z-40 bg-[#f8f9fa]/95 dark:bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-black/6 dark:border-white/5 px-4 py-3"
      >
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-200 ${
                tab === key
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-black/5 dark:bg-white/5 text-gray-400 dark:text-white/40 border border-black/8 dark:border-white/8 hover:bg-black/10 dark:hover:bg-white/10"
              }`}
              data-testid={`tab-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="pt-4"
        >

          {/* ALL LISTINGS */}
          {tab === "all" && (
            <div className="px-4">
              {loadingListings ? (
                <ListingsSkeleton />
              ) : !listings?.length ? (
                <EmptyState icon={Package} title="No listings yet" />
              ) : (
                listings.map(l => <DiscoverFeedCard key={l.id} listing={l} />)
              )}
            </div>
          )}

          {/* FEATURED */}
          {tab === "featured" && (
            <div>
              {/* Horizontal carousel */}
              {(featured ?? []).length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between px-4 mb-3">
                    <p className="text-[13px] font-black text-gray-400 dark:text-white/60 uppercase tracking-wider">
                      🔥 Hot Deals
                    </p>
                    <span className="text-[11px] text-primary font-bold flex items-center gap-1">
                      See all <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-1">
                    {(featured ?? []).slice(0, 6).map((l, i) => (
                      <FeaturedCard key={l.id} listing={l} badge={i === 0 ? "Best Seller" : i === 1 ? "Hot Deal" : undefined} />
                    ))}
                  </div>
                </div>
              )}

              {/* Featured full list */}
              <div className="px-4">
                <p className="text-[13px] font-black text-gray-400 dark:text-white/60 uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                  Seller's Picks
                </p>
                {loadingListings ? <ListingsSkeleton /> : (
                  <div style={{ columns: "2", columnGap: "8px" }}>
                    {(listings ?? []).slice(0, 8).map((l, i) => (
                      <PinterestCard key={l.id} listing={l} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NEW ARRIVALS */}
          {tab === "new" && (
            <div className="px-4">
              <p className="text-[12px] text-gray-400 dark:text-white/25 mb-3">Latest items from {profile.name}</p>
              {loadingListings ? <ListingsSkeleton /> : !newArrivals.length ? (
                <EmptyState icon={Sparkles} title="No new arrivals yet" />
              ) : (
                newArrivals.map(l => <DiscoverFeedCard key={l.id} listing={l} />)
              )}
            </div>
          )}

          {/* REVIEWS */}
          {tab === "reviews" && (
            <div className="px-4">
              {/* Summary */}
              <div className="bg-white dark:bg-[#161616] rounded-3xl p-4 mb-4 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-[44px] font-black text-gray-900 dark:text-white leading-none">{avgRating.toFixed(1)}</p>
                    <Stars n={Math.round(avgRating)} size={4} />
                    <p className="text-[11px] text-gray-400 dark:text-white/25 mt-1">{MOCK_REVIEWS.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(s => {
                      const count = MOCK_REVIEWS.filter(r => r.rating === s).length;
                      const pct   = (count / MOCK_REVIEWS.length) * 100;
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-400 dark:text-white/30 w-3 shrink-0">{s}</span>
                          <div className="flex-1 h-1.5 bg-black/8 dark:bg-white/8 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: (5 - s) * 0.1 }}
                              className="h-full bg-amber-400 rounded-full"
                            />
                          </div>
                          <span className="text-[10px] text-gray-300 dark:text-white/20 w-3 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-3">
                {MOCK_REVIEWS.map(r => <ReviewCard key={r.id} r={r} />)}
              </div>
            </div>
          )}

          {/* ABOUT */}
          {tab === "about" && (
            <div className="px-4 space-y-3">
              {/* Bio */}
              <div className="bg-white dark:bg-[#161616] rounded-3xl p-4 shadow-sm dark:shadow-none">
                <p className="text-[11px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-2.5">About</p>
                <p className="text-[14px] text-gray-600 dark:text-white/60 leading-relaxed">
                  {profile.bio ?? "This seller hasn't added a bio yet."}
                </p>
                <div className="flex items-center gap-2 mt-3 text-[12px] text-gray-400 dark:text-white/30">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {format(new Date(profile.joinDate), "MMMM yyyy")}
                </div>
              </div>

              {/* Policies */}
              {[
                { icon: Truck,      title: "Delivery",  body: "Ships within 1–3 business days. Available for pickup in " + profile.location + "." },
                { icon: RotateCcw,  title: "Returns",   body: "7-day return policy on all items. Item must be in original condition." },
                { icon: Shield,     title: "Guarantee", body: "All listings are genuine and as described. Message before buying for more details." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="bg-white dark:bg-[#161616] rounded-3xl p-4 flex items-start gap-3 shadow-sm dark:shadow-none">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white mb-1">{title}</p>
                    <p className="text-[13px] text-gray-500 dark:text-white/40 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}

              {/* Contact CTA */}
              <button
                onClick={() => { nav("/messages"); toast.success("Opening messages…"); }}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 shadow-xl shadow-primary/25"
              >
                <MessageSquare className="w-5 h-5" /> Message {profile.name.split(" ")[0]}
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────────────── */
function ListingsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white dark:bg-[#161616] animate-pulse overflow-hidden shadow-sm dark:shadow-none">
          <div className="aspect-[16/9] bg-black/5 dark:bg-white/5" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-white/25">
      <div className="w-14 h-14 rounded-3xl bg-black/4 dark:bg-white/4 flex items-center justify-center">
        <Icon className="w-6 h-6 opacity-40" />
      </div>
      <p className="text-[14px] font-bold">{title}</p>
    </div>
  );
}
