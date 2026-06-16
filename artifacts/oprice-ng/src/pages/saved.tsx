import { Bookmark, Loader2 } from "lucide-react";
import { useGetBookmarks } from "@/lib/supabase-hooks";
import { PinterestCard } from "@/components/pinterest-card";
import { BottomNav } from "@/components/navigation";
import { motion } from "framer-motion";

export default function SavedPage() {
  const { data: listings, isLoading, isError } = useGetBookmarks();

  const items = Array.isArray(listings) ? listings : [];

  return (
    <div className="min-h-[100dvh] bg-[#f8f9fa] dark:bg-[#0d0d0d] text-foreground">

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-[#f8f9fa]/95 dark:bg-[#0d0d0d]/95 backdrop-blur-xl border-b border-black/6 dark:border-white/5 px-5 pt-5 pb-4">
        <h1 className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight">Saved</h1>
        <p className="text-[13px] text-gray-500 dark:text-white/30 mt-0.5">Items you've bookmarked</p>
      </div>

      {/* ── CONTENT ── */}
      <main className="pt-3 pb-28 px-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
            <span className="text-[13px] text-gray-500 dark:text-white/30">Loading saved items…</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-2">
            <p className="text-[15px] font-bold text-gray-400 dark:text-white/40">Couldn't load saved items</p>
            <p className="text-[12px] text-gray-400 dark:text-white/20">Check your connection and try again</p>
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-8 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-black/4 dark:bg-white/4 flex items-center justify-center mb-5">
              <Bookmark className="w-9 h-9 text-gray-300 dark:text-white/15" />
            </div>
            <p className="text-[17px] font-black text-gray-400 dark:text-white/40 mb-2">Nothing saved yet</p>
            <p className="text-[13px] text-gray-400 dark:text-white/20 leading-relaxed max-w-[220px]">
              Tap the bookmark icon on any listing to save it here
            </p>
          </motion.div>
        ) : (
          <>
            <p className="text-[12px] text-gray-400 dark:text-white/25 font-semibold px-2 mb-3">
              {items.length} saved {items.length === 1 ? "item" : "items"}
            </p>
            <div className="columns-2 md:columns-3 lg:columns-4" style={{ columnGap: "8px" }}>
              {items.map((listing, i) => (
                <PinterestCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
