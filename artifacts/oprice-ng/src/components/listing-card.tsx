import { useState } from "react";
import { Link, useLocation } from "wouter";
import { MoreHorizontal, MessageCircle, Share, Bookmark, BadgeCheck, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Listing } from "@/lib/types";
import { formatLocation, whatsappLink } from "@/lib/types";
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

              {listing.whatsappNumber && (
                <a
                  href={whatsappLink(listing.whatsappNumber, listing.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(whatsappLink(listing.whatsappNumber!, listing.title), '_blank'); }}
                  className="group flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors"
                  data-testid={`lc-btn-wa-${listing.id}`}
                >
                  <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                </a>
              )}

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
