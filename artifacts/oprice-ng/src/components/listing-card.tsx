import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MoreHorizontal, MessageCircle, Share, Bookmark, BadgeCheck, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Listing } from "@/lib/types";
import { formatLocation } from "@/lib/types";
import { useWatchListing } from "@/lib/supabase-hooks";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [isWatched, setIsWatched] = useState(listing.isWatched || false);
  const [watchCount, setWatchCount] = useState(listing.watchCount || 0);
  const watchListing = useWatchListing();
  const [, setLocation] = useLocation();

  const handleWatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWatched(!isWatched);
    setWatchCount((prev: number) => isWatched ? prev - 1 : prev + 1);
    watchListing.mutate({ id: listing.id }, {
      onSuccess: (data: { isWatched: boolean; watchCount: number }) => {
        setIsWatched(data.isWatched);
        setWatchCount(data.watchCount);
      },
      onError: () => {
        setIsWatched(isWatched);
        setWatchCount(watchCount);
        toast.error("Failed to watch listing");
      }
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/listing/${listing.id}`);
    toast.success("Link copied to clipboard");
  };

  const isAuctionActive = listing.isAuction && listing.auctionEndsAt && new Date(listing.auctionEndsAt) > new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => setLocation(`/listing/${listing.id}`)}
      className="block bg-card border-b border-border p-4 cursor-pointer transition-colors hover:bg-card/80"
    >
        {listing.isSponsored && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold mb-2 ml-12">
            <span className="text-[10px]">AD</span> Sponsored
          </div>
        )}
        {listing.isAuction && (
          <div className="flex items-center gap-2 text-xs text-destructive font-bold mb-2 ml-12">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            LIVE AUCTION
          </div>
        )}

        <div className="flex gap-3">
          <Link href={`/seller/${listing.sellerUsername}`} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 shrink-0 overflow-hidden">
              {listing.sellerAvatar && <img src={listing.sellerAvatar} alt={listing.sellerName} className="w-full h-full object-cover" />}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <Link href={`/seller/${listing.sellerUsername}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 group">
                <span className="font-bold text-foreground group-hover:underline truncate">{listing.sellerName}</span>
                {listing.isVerifiedSeller && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                <span className="text-muted-foreground truncate">@{listing.sellerUsername}</span>
                <span className="text-muted-foreground px-1">·</span>
                <span className="text-muted-foreground shrink-0">{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true }).replace('about ', '')}</span>
              </Link>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="text-muted-foreground hover:text-primary transition-colors p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-1">
              <h3 className="text-[15px] font-medium leading-snug">{listing.title}</h3>
              <p className="text-[15px] text-muted-foreground mt-1 line-clamp-2">{listing.description}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-primary">₦{listing.price.toLocaleString()}</span>
              {listing.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">₦{listing.originalPrice.toLocaleString()}</span>
              )}
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                {listing.condition}
              </span>
            </div>

            {listing.images && listing.images.length > 0 && (
              <div className={`mt-3 rounded-2xl overflow-hidden border border-border bg-black ${listing.images.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''}`}>
                {listing.images.slice(0, 4).map((img: string, i: number) => (
                  <div key={i} className={`relative ${listing.images!.length === 1 ? 'aspect-[4/3]' : 'aspect-square'} ${listing.images!.length === 3 && i === 0 ? 'row-span-2 aspect-[auto]' : ''}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {formatLocation(listing)}
              </div>
            </div>

            <div className="flex gap-3 mt-3 text-xs text-muted-foreground font-medium">
              <span>{listing.offerCount} Offers</span>
              <span>·</span>
              <span>{listing.viewCount} Views</span>
              <span>·</span>
              <span>{watchCount} Watching</span>
            </div>

            <div className="flex justify-between items-center mt-3 pt-1 max-w-md">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-sm">{listing.offerCount > 0 ? listing.offerCount : ''}</span>
              </button>

              <button
                onClick={handleShare}
                className="group flex items-center gap-2 text-muted-foreground hover:text-success transition-colors"
              >
                <div className="p-2 rounded-full group-hover:bg-success/10 transition-colors">
                  <Share className="w-5 h-5" />
                </div>
              </button>

              <button
                onClick={handleWatch}
                className={`group flex items-center gap-2 transition-colors ${isWatched ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              >
                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                  <Bookmark className="w-5 h-5" fill={isWatched ? "currentColor" : "none"} />
                </div>
                <span className="text-sm">{watchCount > 0 ? watchCount : ''}</span>
              </button>
            </div>
          </div>
        </div>
    </motion.div>
  );
}
