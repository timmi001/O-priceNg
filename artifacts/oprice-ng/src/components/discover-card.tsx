import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Share2, Bookmark, BadgeCheck, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Listing } from "@/lib/types";
import { formatLocation, whatsappLink } from "@/lib/types";
import { useWatchListing } from "@/lib/supabase-hooks";
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
    setSavedCount((prev: number) => next ? prev + 1 : prev - 1);
    watchListing.mutate({ id: listing.id }, {
      onSuccess: (data: { isWatched: boolean; watchCount: number }) => {
        setIsSaved(data.isWatched);
        setSavedCount(data.watchCount);
      },
      onError: () => {
        setIsSaved(!next);
        setSavedCount((prev: number) => next ? prev - 1 : prev + 1);
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
        <div
          className="relative w-full aspect-[4/3] overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

          <div className="absolute top-3 left-3 z-10">
            <span className="text-[11px] font-semibold tracking-wide text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {listing.category}
            </span>
          </div>

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

          {listing.images && listing.images.length > 0 && (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent" />

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

        <div className="px-4 pt-3 pb-1 bg-[#161616]">
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

          <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-1 mb-1">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 text-[12px] text-white/40 mb-3">
            <MapPin className="w-3 h-3" />
            {formatLocation(listing)}
            {listing.shippingInfo && (
              <span className="ml-1 text-primary/70">· {listing.shippingInfo}</span>
            )}
          </div>

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

            {listing.whatsappNumber && (
              <a
                href={whatsappLink(listing.whatsappNumber, listing.title)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 text-green-500 hover:text-green-400 transition-colors"
                data-testid={`button-wa-${listing.id}`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            )}

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
