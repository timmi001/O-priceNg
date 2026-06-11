import { useState } from "react";
import { useLocation } from "wouter";
import { MessageCircle, Share2, Bookmark, BadgeCheck, MapPin } from "lucide-react";
import type { Listing } from "@workspace/api-client-react/src/generated/api.schemas";
import { useWatchListing } from "@workspace/api-client-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const PLACEHOLDER_COLORS: Record<string, string> = {
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
  Phones: "from-violet-900/80 to-purple-950/90",
  Electronics: "from-blue-900/80 to-indigo-950/90",
  Computers: "from-sky-900/80 to-blue-950/90",
  Fashion: "from-pink-900/80 to-rose-950/90",
  Vehicles: "from-orange-900/80 to-amber-950/90",
  "Home & Kitchen": "from-teal-900/80 to-cyan-950/90",
  Property: "from-emerald-900/80 to-green-950/90",
  Appliances: "from-slate-800/80 to-zinc-950/90",
  "Food & Agriculture": "from-lime-900/80 to-green-950/90",
  "Food & Beverages": "from-amber-900/80 to-yellow-950/90",
};

const IMAGE_ASPECTS = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[1/1]",
  "aspect-[2/3]",
  "aspect-[4/5]",
  "aspect-[3/4]",
];

interface PinterestCardProps {
  listing: Listing;
  index: number;
}

export function PinterestCard({ listing, index }: PinterestCardProps) {
  const [isSaved, setIsSaved] = useState(listing.isWatched || false);
  const [savedCount, setSavedCount] = useState(listing.watchCount || 0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const watchListing = useWatchListing();
  const [, setLocation] = useLocation();

  const bgColor = PLACEHOLDER_COLORS[listing.category] ?? "#111";
  const gradient = CATEGORY_GRADIENTS[listing.category] ?? "from-zinc-900/80 to-black/90";
  const aspectClass = IMAGE_ASPECTS[index % IMAGE_ASPECTS.length];
  const hasImage = listing.images && listing.images.length > 0;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isSaved;
    setIsSaved(next);
    setSavedCount(prev => next ? prev + 1 : prev - 1);
    watchListing.mutate({ id: listing.id }, {
      onSuccess: (data) => {
        setIsSaved(data.isWatched);
        setSavedCount(data.watchCount);
      },
      onError: () => {
        setIsSaved(!next);
        setSavedCount(prev => next ? prev - 1 : prev + 1);
        toast.error("Failed to save");
      },
    });
    toast.success(next ? "Saved to wishlist" : "Removed from saved");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
    toast.success("Link copied!");
  };

  const isLive = listing.isAuction && listing.auctionEndsAt && new Date(listing.auctionEndsAt) > new Date();
  const hasDiscount = listing.originalPrice && listing.originalPrice > listing.price;
  const discountPct = hasDiscount ? Math.round((1 - listing.price / listing.originalPrice!) * 100) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25, ease: "easeOut" }}
      onClick={() => setLocation(`/listing/${listing.id}`)}
      className="cursor-pointer mb-2.5 break-inside-avoid"
      data-testid={`pin-card-${listing.id}`}
    >
      <div className="rounded-[18px] overflow-hidden bg-white dark:bg-[#161616] shadow-md shadow-black/10 dark:shadow-lg dark:shadow-black/40">

        {/* ── IMAGE ── */}
        <div
          className={`relative w-full ${aspectClass} overflow-hidden`}
          style={{ backgroundColor: bgColor }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

          {hasImage && (
            <img
              src={listing.images![0]}
              alt={listing.title}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          )}

          {/* Top-left badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            {listing.isSponsored && (
              <span className="text-[9px] font-bold text-white/60 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full tracking-wide">
                AD
              </span>
            )}
            {hasDiscount && (
              <span className="text-[9px] font-black text-primary bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Top-right: LIVE badge */}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
            {isLive && (
              <div className="flex items-center gap-1 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-bold text-white tracking-wider">LIVE</span>
              </div>
            )}
          </div>

          {/* Bottom gradient + price */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 to-transparent z-10" />
          <div className="absolute bottom-2.5 left-2.5 z-20 flex items-baseline gap-1.5">
            <span className="text-[15px] font-black text-white drop-shadow leading-none">
              ₦{listing.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-white/40 line-through leading-none">
                ₦{listing.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>

          {/* Multiple images indicator */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 z-20 flex gap-0.5">
              {listing.images.slice(0, 3).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── BODY ── */}
        <div className="px-2.5 pt-2 pb-1">
          {/* Title */}
          <h3 className="text-[12px] font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1.5">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/35 mb-2">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Seller row */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/50 to-primary/10 shrink-0 overflow-hidden">
              {listing.sellerAvatar && (
                <img src={listing.sellerAvatar} alt={listing.sellerName} className="w-full h-full object-cover" />
              )}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-white/50 truncate flex-1 leading-none">
              {listing.sellerName}
            </span>
            {listing.isVerifiedSeller && (
              <BadgeCheck className="w-3 h-3 text-primary shrink-0" />
            )}
          </div>

          {/* Engagement row */}
          <div className="flex items-center justify-between border-t border-black/6 dark:border-white/5 pt-1.5 pb-1">
            <button
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-gray-400 dark:text-white/35 hover:text-primary transition-colors"
              data-testid={`pin-btn-comment-${listing.id}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {listing.offerCount > 0 && (
                <span className="text-[10px]">{listing.offerCount}</span>
              )}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-gray-400 dark:text-white/35 hover:text-primary transition-colors"
              data-testid={`pin-btn-share-${listing.id}`}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1 transition-colors ${isSaved ? "text-primary" : "text-gray-400 dark:text-white/35 hover:text-primary"}`}
              data-testid={`pin-btn-save-${listing.id}`}
            >
              <Bookmark
                className="w-3.5 h-3.5"
                fill={isSaved ? "currentColor" : "none"}
              />
              {savedCount > 0 && (
                <span className="text-[10px]">{savedCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
