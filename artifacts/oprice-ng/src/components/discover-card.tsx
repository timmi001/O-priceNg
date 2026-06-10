import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Share2, Bookmark, BadgeCheck, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Listing } from "@workspace/api-client-react/src/generated/api.schemas";
import { useWatchListing } from "@workspace/api-client-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Phones: "from-violet-900/80 to-purple-950/80",
  Electronics: "from-blue-900/80 to-indigo-950/80",
  Computers: "from-sky-900/80 to-blue-950/80",
  Fashion: "from-pink-900/80 to-rose-950/80",
  Vehicles: "from-orange-900/80 to-amber-950/80",
  "Home & Kitchen": "from-teal-900/80 to-cyan-950/80",
  Property: "from-emerald-900/80 to-green-950/80",
  Appliances: "from-slate-800/80 to-zinc-950/80",
  "Food & Agriculture": "from-lime-900/80 to-green-950/80",
  "Food & Beverages": "from-amber-900/80 to-yellow-950/80",
};

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

interface DiscoverCardProps {
  listing: Listing;
  index?: number;
}

export function DiscoverCard({ listing, index = 0 }: DiscoverCardProps) {
  const [isSaved, setIsSaved] = useState(listing.isWatched || false);
  const [savedCount, setSavedCount] = useState(listing.watchCount || 0);
  const watchListing = useWatchListing();
  const [, setLocation] = useLocation();

  const bgColor = PLACEHOLDER_COLORS[listing.category] ?? "#111";
  const gradient = CATEGORY_GRADIENTS[listing.category] ?? "from-zinc-900/80 to-black/80";

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
      }
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
    toast.success("Link copied!");
  };

  const isAuction = listing.isAuction && listing.auctionEndsAt && new Date(listing.auctionEndsAt) > new Date();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => setLocation(`/listing/${listing.id}`)}
      className="cursor-pointer mx-3 mb-4"
      data-testid={`discover-card-${listing.id}`}
    >
      <div className="rounded-3xl overflow-hidden shadow-xl shadow-black/40 bg-[#111]">

        {/* Large product image area */}
        <div
          className="relative w-full aspect-[4/3] overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          {/* Placeholder gradient visual */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

          {/* Category label in image */}
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[11px] font-semibold tracking-wide text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {listing.category}
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
            {listing.isSponsored && (
              <span className="text-[10px] font-bold text-white/60 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                AD
              </span>
            )}
            {isAuction && (
              <div className="flex items-center gap-1 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                <span className="text-[10px] font-bold text-white tracking-wider">LIVE</span>
              </div>
            )}
          </div>

          {/* Real image if available */}
          {listing.images && listing.images.length > 0 && (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Bottom gradient for text legibility */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Price badge overlaid on image */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
            <span className="text-xl font-black text-white drop-shadow-lg">
              ₦{listing.price.toLocaleString()}
            </span>
            {listing.originalPrice && (
              <span className="text-sm text-white/50 line-through">
                ₦{listing.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-[10px] font-bold text-white/80 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
              {listing.condition}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="px-4 pt-3 pb-1 bg-[#161616]">
          {/* Seller row */}
          <div className="flex items-center justify-between mb-2">
            <Link
              href={`/seller/${listing.sellerUsername}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2"
              data-testid={`link-seller-${listing.id}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary/10 overflow-hidden shrink-0">
                {listing.sellerAvatar && (
                  <img src={listing.sellerAvatar} alt={listing.sellerName} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-white truncate max-w-[120px]">{listing.sellerName}</span>
                  {listing.isVerifiedSeller && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-white/40">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }).replace("about ", "")}
                </div>
              </div>
            </Link>

          </div>

          {/* Title */}
          <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-1 mb-1">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-[12px] text-white/40 mb-3">
            <MapPin className="w-3 h-3" />
            {listing.location}
            {listing.shippingInfo && (
              <span className="ml-1 text-primary/70">· {listing.shippingInfo}</span>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between border-t border-white/5 pt-2 pb-2">
            <button
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-white/40 hover:text-primary transition-colors"
              data-testid={`button-comment-${listing.id}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[12px]">{listing.offerCount > 0 ? listing.offerCount : ""}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-white/40 hover:text-primary transition-colors"
              data-testid={`button-share-${listing.id}`}
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 transition-colors ${isSaved ? "text-primary" : "text-white/40 hover:text-primary"}`}
              data-testid={`button-save-${listing.id}`}
            >
              <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
              <span className="text-[12px]">{savedCount > 0 ? savedCount : ""}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
