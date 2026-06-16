import { useState } from "react";
import { useGetTrendingSearches, useGetCategories, useGetListings } from "@/lib/supabase-hooks";
import type { Listing } from "@/lib/types";
import { BottomNav } from "@/components/navigation";
import { ListingCard } from "@/components/listing-card";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: trendingSearches } = useGetTrendingSearches();
  const { data: categories } = useGetCategories();
  
  const { data: listingsPage, isLoading } = useGetListings({
    search: searchQuery || undefined,
    category: activeCategory || undefined,
    limit: 20
  });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search for anything in Nigeria..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-full py-2 pl-10 pr-4 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {!searchQuery && !activeCategory ? (
        <div className="p-4 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">Trending Searches</h2>
            <div className="flex flex-wrap gap-2">
              {trendingSearches?.map((item: { term: string; count: number }) => (
                <button 
                  key={item.term}
                  onClick={() => setSearchQuery(item.term)}
                  className="px-4 py-1.5 rounded-full bg-card border border-border text-sm font-medium hover:bg-card/80 transition-colors flex items-center gap-1"
                >
                  <Search className="w-3 h-3 text-primary" />
                  {item.term}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Categories</h2>
              <Link href="/categories" className="text-primary text-sm font-medium flex items-center gap-1">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-3 no-scrollbar">
              {categories?.map((category: { id: number; name: string; slug: string }) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className="min-w-fit px-4 py-2 rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {activeCategory ? `Category: ${categories?.find((c: { slug: string; name: string }) => c.slug === activeCategory)?.name || activeCategory}` : `Search: ${searchQuery}`}
            </h2>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory(null); }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : listingsPage?.listings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No results found. Try a different search.
            </div>
          ) : (
            <div className="flex flex-col">
              {listingsPage?.listings.map((listing: Listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}