import { useState, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft, Share2, BadgeCheck, MapPin, Eye, Bookmark,
  Heart, ChevronDown, ChevronUp, MessageSquare, Store,
} from "lucide-react";
import {
  useGetListing, useGetListings, useWatchListing,
} from "@workspace/api-client-react";
import type { Listing } from "@workspace/api-client-react";
import { PinterestCard } from "@/components/pinterest-card";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Phones: "from-violet-900 to-purple-950",
  Electronics: "from-blue-900 to-indigo-950",
  Computers: "from-sky-900 to-blue-950",
  Fashion: "from-pink-900 to-rose-950",
  Vehicles: "from-orange-900 to-amber-950",
  "Home & Kitchen": "from-teal-900 to-cyan-950",
  Property: "from-emerald-900 to-green-950",
  Appliances: "from-slate-800 to-zinc-950",
  "Food & Agriculture": "from-lime-900 to-green-950",
  "Food & Beverages": "from-amber-900 to-yellow-950",
};

const PLACEHOLDER_COLORS: Record<string, string> = {
  Phones: "#1a0533", Electronics: "#0a1628", Computers: "#071525",
  Fashion: "#1f0a14", Vehicles: "#1a0e00", "Home & Kitchen": "#041a18",
  Property: "#041a0c", Appliances: "#0e0f12",
  "Food & Agriculture": "#0c1a04", "Food & Beverages": "#1a1200",
};

/* ── Swipeable image gallery ────────────────────────────── */
function ImageGallery({ images, category }: { images: string[]; category: string }) {
  const [active, setActive]     = useState(0);
  const [offset, setOffset]     = useState(0);
  const [dragging, setDragging] = useState(false);
  const touchStartX             = useRef<number | null>(null);
  const containerRef            = useRef<HTMLDivElement>(null);

  const bgColor  = PLACEHOLDER_COLORS[category] ?? "#111";
  const gradient = CATEGORY_GRADIENTS[category]  ?? "from-zinc-900 to-black";

  const goTo = (i: number) => setActive(Math.max(0, Math.min(images.length - 1, i)));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    setOffset(e.touches[0].clientX - touchStartX.current);
  };
  const onTouchEnd = () => {
    if (Math.abs(offset) > 50) goTo(offset < 0 ? active + 1 : active - 1);
    setOffset(0);
    setDragging(false);
    touchStartX.current = null;
  };

  const src = images.length > 0 ? images[active] : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ backgroundColor: bgColor, aspectRatio: "1/1" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: offset }}
          exit={{ opacity: 0 }}
          transition={{ duration: dragging ? 0 : 0.2 }}
          className="absolute inset-0"
        >
          {src ? (
            <img src={src} alt="product" className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full" />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute top-4 right-16 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-white/80 z-20">
          {active + 1}/{images.length}
        </div>
      )}
    </div>
  );
}

/* ── Expandable description ─────────────────────────────── */
function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 180;
  const shown  = isLong && !expanded ? text.slice(0, 180) + "…" : text;

  return (
    <div>
      <p className="text-[14px] text-gray-600 dark:text-white/60 leading-relaxed">{shown}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(p => !p)}
          className="mt-1.5 flex items-center gap-1 text-[12px] font-bold text-primary"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read more</>}
        </button>
      )}
    </div>
  );
}

/* ── Stat pill ──────────────────────────────────────────── */
function StatPill({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="w-8 h-8 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-white/40" />
      </div>
      <span className="text-[13px] font-black text-gray-900 dark:text-white">{value}</span>
      <span className="text-[10px] text-gray-400 dark:text-white/25">{label}</span>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: listing, isLoading } = useGetListing(Number(id));
  const { data: suggestedPage }      = useGetListings({ limit: 10 });
  const watchListing                  = useWatchListing();

  const [isSaved, setIsSaved] = useState(listing?.isWatched ?? false);

  const handleSave = useCallback(() => {
    if (!listing) return;
    setIsSaved((p: boolean) => !p);
    watchListing.mutate({ id: listing.id }, {
      onSuccess: (d: { isWatched: boolean }) => setIsSaved(d.isWatched),
      onError: () => { setIsSaved((p: boolean) => !p); toast.error("Failed to save"); },
    });
  }, [listing, watchListing]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleMessage = () => {
    navigate("/messages");
    toast.success("Opening messages…");
  };

  const suggested = (suggestedPage?.listings ?? []).filter((l: Listing) => l.id !== listing?.id).slice(0, 8);

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d]">
        <div className="aspect-square bg-black/4 dark:bg-white/4 animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="h-6 bg-black/5 dark:bg-white/5 rounded-xl w-1/2 animate-pulse" />
          <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl w-3/4 animate-pulse" />
          <div className="h-4 bg-black/5 dark:bg-white/5 rounded-xl w-full animate-pulse" />
          <div className="h-4 bg-black/5 dark:bg-white/5 rounded-xl w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center text-gray-400 dark:text-white/30 space-y-2">
          <Store className="w-10 h-10 mx-auto opacity-30" />
          <p className="font-semibold">Listing not found</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm">Go home</button>
        </div>
      </div>
    );
  }

  const hasDiscount = listing.originalPrice && listing.originalPrice > listing.price;
  const discountPct = hasDiscount ? Math.round((1 - listing.price / listing.originalPrice!) * 100) : 0;
  const isLive      = listing.isAuction && listing.auctionEndsAt && new Date(listing.auctionEndsAt) > new Date();
  const timeAgo     = formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }).replace("about ", "");

  return (
    <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d] text-foreground pb-28">

      {/* ── FLOATING CONTROLS on image ── */}
      <div className="fixed top-0 left-0 right-0 md:left-[220px] z-50 px-4 pt-5 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 bg-black/55 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg pointer-events-auto"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={handleSave}
            className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-colors ${
              isSaved ? "bg-primary/90" : "bg-black/55"
            }`}
            data-testid="button-save"
          >
            <Bookmark className="w-4 h-4 text-white" fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-black/55 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* ── IMAGE GALLERY ── */}
      <ImageGallery images={listing.images ?? []} category={listing.category} />

      {/* ── MAIN CONTENT ── */}
      <div className="px-5 -mt-2 space-y-5">

        {/* Price + badges */}
        <div className="pt-3">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[32px] font-black text-gray-900 dark:text-white leading-none">
              ₦{listing.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[16px] text-gray-400 dark:text-white/30 line-through leading-none">
                  ₦{listing.originalPrice!.toLocaleString()}
                </span>
                <span className="text-[12px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  -{discountPct}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50 bg-black/5 dark:bg-white/6 px-3 py-1 rounded-full border border-black/8 dark:border-white/8">
              {listing.condition}
            </span>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-white/50 bg-black/5 dark:bg-white/6 px-3 py-1 rounded-full border border-black/8 dark:border-white/8">
              {listing.category}
            </span>
            {isLive && (
              <span className="flex items-center gap-1.5 text-[11px] font-black text-white bg-red-600/90 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE AUCTION
              </span>
            )}
            {listing.isSponsored && (
              <span className="text-[11px] font-semibold text-gray-400 dark:text-white/30 bg-black/4 dark:bg-white/4 px-3 py-1 rounded-full border border-black/6 dark:border-white/6">
                Sponsored
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-black text-gray-900 dark:text-white leading-snug -mt-1">
          {listing.title}
        </h1>

        {/* Stats row */}
        <div className="flex items-center bg-white dark:bg-[#161616] rounded-3xl px-4 py-3 gap-2 shadow-sm dark:shadow-none">
          <StatPill icon={Eye}           value={listing.viewCount}  label="Views"  />
          <div className="w-px h-8 bg-black/6 dark:bg-white/5" />
          <StatPill icon={Bookmark}      value={listing.watchCount} label="Saves"  />
          <div className="w-px h-8 bg-black/6 dark:bg-white/5" />
          <StatPill icon={MessageSquare} value={listing.offerCount} label="Offers" />
          <div className="w-px h-8 bg-black/6 dark:bg-white/5" />
          <StatPill icon={Heart}         value={0}                  label="Likes"  />
        </div>

        {/* Seller card */}
        <button
          onClick={() => navigate(`/seller/${listing.sellerUsername}`)}
          className="w-full bg-white dark:bg-[#161616] rounded-3xl p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform shadow-sm dark:shadow-none"
          data-testid={`link-seller-${listing.id}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/50 to-primary/10 shrink-0 overflow-hidden">
            {listing.sellerAvatar && (
              <img src={listing.sellerAvatar} alt={listing.sellerName} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[15px] font-black text-gray-900 dark:text-white truncate">{listing.sellerName}</span>
              {listing.isVerifiedSeller && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
            </div>
            <p className="text-[12px] text-gray-400 dark:text-white/30">@{listing.sellerUsername} · listed {timeAgo}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
            <Store className="w-3.5 h-3.5 text-gray-400 dark:text-white/30" />
          </div>
        </button>

        {/* Location */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#161616] rounded-2xl px-4 py-3 shadow-sm dark:shadow-none">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-gray-900 dark:text-white">{listing.location}</p>
            {listing.shippingInfo && (
              <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">{listing.shippingInfo}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="bg-white dark:bg-[#161616] rounded-3xl p-4 shadow-sm dark:shadow-none">
            <p className="text-[11px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-2.5">About this item</p>
            <ExpandableText text={listing.description} />
          </div>
        )}

        {/* Suggested products */}
        {suggested.length > 0 && (
          <div>
            <p className="text-[13px] font-black text-gray-400 dark:text-white/40 uppercase tracking-wider mb-3">
              You might also like
            </p>
            <div className="columns-2 md:columns-3 lg:columns-4" style={{ columnGap: "8px" }}>
              {suggested.map((item: Listing, i: number) => (
                <PinterestCard key={item.id} listing={item} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[220px] z-50">
        <div className="bg-white/98 dark:bg-[#0d0d0d]/98 backdrop-blur-xl border-t border-black/6 dark:border-white/5 px-4 pt-3 pb-7">
          <div className="flex gap-3">
            <button
              onClick={() => toast.info("Offer feature coming soon!")}
              className="flex-1 py-4 rounded-2xl bg-black/5 dark:bg-white/6 border border-black/10 dark:border-white/10 text-[14px] font-bold text-gray-500 dark:text-white/60 hover:bg-black/10 dark:hover:bg-white/10 transition-colors active:scale-[0.98]"
              data-testid="button-make-offer"
            >
              Make Offer
            </button>
            <button
              onClick={handleMessage}
              className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground text-[15px] font-black shadow-xl shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              data-testid="button-message-seller"
            >
              <MessageSquare className="w-5 h-5" />
              Message Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
