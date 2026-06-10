import { useGetListings, useGetTrendingListings, useGetFeaturedListings } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, Camera, MapPin, Tag } from "lucide-react";
import { BottomNav } from "@/components/navigation";
import { ListingCard } from "@/components/listing-card";

export default function Home() {
  const { data: listingsPage, isLoading } = useGetListings({ limit: 20 });
  const { data: trendingListings } = useGetTrendingListings();
  const { data: featuredListings } = useGetFeaturedListings();

  return (
    <div className="min-h-[100dvh] pb-20 bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary tracking-tight">O'price Ng</h1>
        <div className="flex gap-6 font-bold text-[15px]">
          <button className="text-foreground relative">
            For You
            <div className="absolute -bottom-[17px] left-0 right-0 h-1 rounded-full bg-primary" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">Trending</button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full border-x border-border/50">
        <div className="bg-background border-b border-border p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary shrink-0 overflow-hidden">
               {/* Current user avatar placeholder */}
            </div>
            <div className="flex-1">
              <Link href="/sell">
                <input 
                  type="text" 
                  placeholder="What are you selling today?" 
                  className="w-full bg-transparent text-lg outline-none text-foreground placeholder:text-muted-foreground cursor-pointer" 
                  readOnly
                />
              </Link>
              <div className="mt-4 flex justify-between items-center border-t border-border/50 pt-3">
                <div className="flex gap-4 text-primary">
                  <button className="p-1 hover:bg-primary/10 rounded-full transition-colors"><Camera className="w-5 h-5" /></button>
                  <button className="p-1 hover:bg-primary/10 rounded-full transition-colors"><MapPin className="w-5 h-5" /></button>
                  <button className="p-1 hover:bg-primary/10 rounded-full transition-colors"><Tag className="w-5 h-5" /></button>
                </div>
                <Link href="/sell" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold text-[15px] hover:bg-primary/90 transition-colors">
                  Post
                </Link>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Show a featured/sponsored listing first if available */}
            {featuredListings && featuredListings.length > 0 && (
              <ListingCard key={`featured-${featuredListings[0].id}`} listing={{...featuredListings[0], isSponsored: true}} />
            )}

            {/* Regular feed */}
            {listingsPage?.listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}