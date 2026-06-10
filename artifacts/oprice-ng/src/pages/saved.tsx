import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Bookmark, Heart, MapPin, BadgeCheck, SlidersHorizontal, TrendingDown, Clock, LayoutGrid } from "lucide-react";
import { useGetBookmarks, useWatchListing } from "@workspace/api-client-react";
import { BottomNav } from "@/components/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Listing } from "@workspace/api-client-react/src/generated/api.schemas";

type Filter = "all" | "recent" | "price_drops";

const FILTERS: { key: Filter; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "All Saved", icon: LayoutGrid },
  { key: "recent", label: "Recent", icon: Clock },
  { key: "price_drops", label: "Price Drops", icon: TrendingDown },
];

const CATEGORY_COLORS: Record<string, string> = {
  Phones: "#1a0533",
  Electronics: "#0a1628",
  Computers: "#071525",
  Fashion: "#1f0a14",
  Vehicles: "#1a0e00",
  "Home & Kitchen": "#041a18",
  Property: "#041a0c",
  Appliances: "#0e0f12",
  "Food & Agriculture": "#0c1a04",
  "Food & Beverages": "#1a1200",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Phones: "from-violet-900/60 to-purple-950/80",
  Electronics: "from-blue-900/60 to-indigo-950/80",
  Computers: "from-sky-900/60 to-blue-950/80",
  Fashion: "from-pink-900/60 to-rose-950/80",
  Vehicles: "from-orange-900/60 to-amber-950/80",
  "Home & Kitchen": "from-teal-900/60 to-cyan-950/80",
  Property: "from-emerald-900/60 to-green-950/80",
  Appliances: "from-slate-800/60 to-zinc-950/80",
  "Food & Agriculture": "from-lime-900/60 to-green-950/80",
  "Food & Beverages": "from-amber-900/60 to-yellow-950/80",
};

function SavedCard({ listing, index }: { listing: Listing; index: number }) {
  const [isSaved, setIsSaved] = useState(true);
  const watchListing = useWatchListing();
  const [, setLocation] = useLocation();

  const bgColor = CATEGORY_COLORS[listing.category] ?? "#111";
  const gradient = CATEGORY_GRADIENTS[listing.category] ?? "from-zinc-900/60 to-black/80";

  const handleUnsave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(false);
    watchListing.mutate({ id: listing.id }, {
      onError: () => {
        setIsSaved(true);
        toast.error("Failed to unsave");
      },
    });
    toast.success("Removed from saved");
  };

  if (!isSaved) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      onClick={() => setLocation(`/listing/${listing.id}`)}
      className="cursor-pointer rounded-2xl overflow-hidden bg-[#161616] shadow-lg shadow-black/30"
      data-testid={`saved-card-${listing.id}`}
    >
      {/* Image area */}
      <div
        className="relative w-full aspect-[3/2] overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

        {/* Category chip */}
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-semibold tracking-wide text-white/60 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {listing.category}
          </span>
        </div>

        {/* Saved heart — always filled since this is the wishlist */}
        <button
          onClick={handleUnsave}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
          data-testid={`button-unsave-${listing.id}`}
        >
          <Heart className="w-3.5 h-3.5 text-primary" fill="currentColor" />
        </button>

        {/* Price drop badge */}
        {listing.originalPrice && listing.originalPrice > listing.price && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-primary/20 border border-primary/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <TrendingDown className="w-2.5 h-2.5 text-primary" />
            <span className="text-[9px] font-bold text-primary">
              -{Math.round((1 - listing.price / listing.originalPrice) * 100)}%
            </span>
          </div>
        )}

        {/* Live badge */}
        {listing.isAuction && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-red-600/80 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[8px] font-bold text-white">LIVE</span>
          </div>
        )}

        {/* Real image */}
        {listing.images && listing.images.length > 0 && (
          <img src={listing.images[0]} alt={listing.title} className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Price on image */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="text-[13px] font-black text-white drop-shadow">
            ₦{listing.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-3 py-2.5">
        <h3 className="text-[12px] font-semibold text-white leading-snug line-clamp-1 mb-1">
          {listing.title}
        </h3>

        {/* Seller */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary/50 to-primary/10 shrink-0" />
          <span className="text-[10px] text-white/50 truncate">{listing.sellerName}</span>
          {listing.isVerifiedSeller && <BadgeCheck className="w-3 h-3 text-primary shrink-0" />}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[10px] text-white/30">
          <MapPin className="w-2.5 h-2.5" />
          <span className="truncate">{listing.location}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function Saved() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const { data: bookmarks, isLoading } = useGetBookmarks();

  const filtered = useMemo(() => {
    if (!bookmarks) return [];
    switch (activeFilter) {
      case "recent":
        return [...bookmarks].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "price_drops":
        return bookmarks.filter(l => l.originalPrice && l.originalPrice > l.price);
      default:
        return bookmarks;
    }
  }, [bookmarks, activeFilter]);

  return (
    <div className="min-h-[100dvh] bg-[#0d0d0d] text-foreground">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-primary" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-[18px] font-black text-white leading-tight">Saved</h1>
            <p className="text-[11px] text-white/30">
              {bookmarks ? `${bookmarks.length} item${bookmarks.length !== 1 ? "s" : ""}` : "Your wishlist"}
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold shrink-0 transition-all duration-200 ${
                activeFilter === key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-white/5 text-white/50 border border-white/8 hover:bg-white/10"
              }`}
              data-testid={`filter-${key}`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-3 pt-4 pb-28">
        {isLoading ? (
          /* Skeleton grid */
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-[#161616] animate-pulse">
                <div className="aspect-[3/2] bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-8 text-center"
            data-testid="empty-saved"
          >
            {/* Soft illustration */}
            <div className="relative w-28 h-28 mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/8" />
              <div className="absolute inset-3 rounded-full bg-primary/10" />
              <div className="absolute inset-6 rounded-full bg-primary/15 flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-primary/60" />
              </div>
              {/* Floating hearts */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-3 h-3 text-primary/50" />
              </div>
              <div className="absolute -bottom-1 -left-2 w-5 h-5 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-2.5 h-2.5 text-primary/30" />
              </div>
            </div>

            <h3 className="text-[17px] font-bold text-white mb-2">
              {activeFilter === "price_drops" ? "No price drops yet" :
               activeFilter === "recent" ? "Nothing saved recently" :
               "Your wishlist is empty"}
            </h3>
            <p className="text-[13px] text-white/30 leading-relaxed max-w-[220px]">
              {activeFilter === "price_drops"
                ? "We'll show you when prices drop on your saved items."
                : "Tap the bookmark icon on any listing to save it here for later."}
            </p>

            {/* CTA */}
            <button
              onClick={() => window.history.back()}
              className="mt-6 bg-primary text-primary-foreground text-[13px] font-bold px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              data-testid="button-browse"
            >
              Browse listings
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((listing, i) => (
                <SavedCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
