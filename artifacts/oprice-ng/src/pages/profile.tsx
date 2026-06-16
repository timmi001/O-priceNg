import { useState } from "react";
import {
  useGetUserProfile, useGetUserListings, useGetBookmarks,
} from "@/lib/supabase-hooks";
import { useAuth } from "@/lib/auth-context";
import type { Listing } from "@/lib/types";
import { formatLocation } from "@/lib/types";
import { BottomNav } from "@/components/navigation";
import { PinterestCard } from "@/components/pinterest-card";
import {
  BadgeCheck, MapPin, Settings, Package,
  Star, TrendingUp, Eye, Bookmark,
  ShoppingBag, BarChart3, Calendar, Award,
  ArrowUpRight, Users, Zap,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

/* ── constants ──────────────────────────────────────────── */
type Tab = "listings" | "saved" | "analytics";
const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "listings",  label: "Listings",  icon: Package   },
  { key: "saved",     label: "Saved",     icon: Bookmark  },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

// USERNAME is derived from the Supabase auth session (set below in the component)

/* ── analytics mock data ────────────────────────────────── */
const WEEKLY = [42, 67, 55, 89, 73, 120, 98];
const DAYS   = ["M", "T", "W", "T", "F", "S", "S"];

/* ── sub-components ──────────────────────────────────────── */
function StatBlock({
  value, label, icon: Icon, accent = false,
}: { value: string | number; label: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 py-2">
      <Icon className={`w-4 h-4 mb-0.5 ${accent ? "text-primary" : "text-white/30"}`} />
      <span className={`text-[20px] font-black leading-none ${accent ? "text-primary" : "text-white"}`}>
        {value}
      </span>
      <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wide">{label}</span>
    </div>
  );
}

function AnalyticsCard({
  icon: Icon, label, value, change, color,
}: { icon: React.ElementType; label: string; value: string; change: string; color: string }) {
  const positive = change.startsWith("+");
  return (
    <div className="bg-[#161616] rounded-3xl p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wide mb-1">{label}</p>
        <p className="text-[22px] font-black text-white leading-none">{value}</p>
      </div>
      <span className={`text-[11px] font-black px-2 py-1 rounded-full shrink-0 mt-1 ${
        positive ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
      }`}>
        {change}
      </span>
    </div>
  );
}

function MiniBar({ value, max, label, idx, activeIdx }: {
  value: number; max: number; label: string; idx: number; activeIdx: number;
}) {
  const pct = Math.round((value / max) * 100);
  const isActive = idx === activeIdx;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <div className="w-full flex flex-col items-center justify-end" style={{ height: 64 }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
          className={`w-full rounded-full transition-colors ${isActive ? "bg-primary" : "bg-white/10"}`}
          style={{ minHeight: 4 }}
        />
      </div>
      <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-white/25"}`}>{label}</span>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const [editOpen,  setEditOpen]  = useState(false);

  const { user } = useAuth();
  const username = user?.user_metadata?.username ?? user?.email?.split("@")[0] ?? "";

  const { data: profile, isLoading: loadingProfile } = useGetUserProfile(username);
  const { data: listings, isLoading: loadingListings } = useGetUserListings(username);
  const { data: saved,    isLoading: loadingSaved }    = useGetBookmarks();

  /* loading skeleton */
  if (loadingProfile) {
    return (
      <div className="min-h-[100dvh] bg-[#0d0d0d]">
        <div className="h-44 bg-white/4 animate-pulse" />
        <div className="flex flex-col items-center gap-3 -mt-12 px-5">
          <div className="w-24 h-24 rounded-full bg-white/8 animate-pulse border-4 border-[#0d0d0d]" />
          <div className="h-5 w-32 bg-white/8 rounded-xl animate-pulse" />
          <div className="h-3 w-24 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] bg-[#0d0d0d] flex items-center justify-center text-white/30">
        Profile not found
      </div>
    );
  }

  const joinYear = format(new Date(profile.joinDate), "yyyy");
  const maxBar   = Math.max(...WEEKLY);

  return (
    <div className="min-h-[100dvh] bg-[#0d0d0d] text-foreground pb-28">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-44 relative overflow-hidden">
          {profile.coverImage ? (
            <img src={profile.coverImage} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-[#0d0d0d]" />
          )}
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0d0d] to-transparent" />

          {/* Decorative dots */}
          <div className="absolute top-6 left-8 w-2 h-2 rounded-full bg-primary/20" />
          <div className="absolute top-12 left-16 w-1 h-1 rounded-full bg-primary/15" />
          <div className="absolute top-8 right-12 w-3 h-3 rounded-full bg-primary/10" />
        </div>

        {/* Floating edit button */}
        <button
          onClick={() => setEditOpen(p => !p)}
          className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full text-white/70 text-[12px] font-bold hover:bg-white/10 transition-colors"
          data-testid="button-edit-profile"
        >
          <Settings className="w-3.5 h-3.5" />
          Edit
        </button>

        {/* Avatar — centered, overlaps cover */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: 92 }}>
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[#0d0d0d] bg-gradient-to-br from-primary/50 to-primary/10 overflow-hidden shadow-2xl shadow-black/60">
              {profile.avatar && (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              )}
            </div>
            {/* Verified ring */}
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full border-2 border-[#0d0d0d] flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── IDENTITY ── */}
      <div className="flex flex-col items-center px-5 mt-16 pb-4 text-center">
        <h1 className="text-[22px] font-black text-white leading-tight flex items-center gap-2">
          {profile.name}
          {profile.isVerified && <BadgeCheck className="w-5 h-5 text-primary" />}
        </h1>
        <p className="text-[13px] text-white/40 mt-0.5">@{profile.username}</p>

        {profile.bio && (
          <p className="text-[13px] text-white/50 leading-relaxed mt-2 max-w-[260px]">
            {profile.bio}
          </p>
        )}

        {/* Location + join year */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-white/25 font-semibold">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {formatLocation(profile)}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/15" />
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Since {joinYear}
          </span>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="mx-4 bg-[#161616] rounded-3xl flex items-center divide-x divide-white/5 mb-4">
        <StatBlock value={profile.totalListings} label="Listings"  icon={Package}      />
        <StatBlock value={profile.totalSales}    label="Sales"     icon={ShoppingBag}  accent />
        <StatBlock value={profile.rating.toFixed(1)} label="Rating" icon={Star}        />
        <StatBlock value="4.2k"                  label="Followers" icon={Users}        />
      </div>

      {/* ── TABS ── */}
      <div className="mx-4 bg-[#161616] rounded-2xl p-1 flex gap-1 mb-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-white/35 hover:text-white/60"
            }`}
            data-testid={`tab-${key}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >

          {/* LISTINGS */}
          {activeTab === "listings" && (
            <div className="px-3">
              {loadingListings ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-[18px] bg-[#161616] animate-pulse">
                      <div className="aspect-[3/4] bg-white/5 rounded-t-[18px]" />
                      <div className="p-2.5 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-3/4" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : listings?.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No listings yet"
                  sub="Your listed items will appear here"
                />
              ) : (
                <div style={{ columns: "2", columnGap: "8px" }}>
                  {listings?.map((listing: Listing, i: number) => (
                    <PinterestCard key={listing.id} listing={listing} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SAVED */}
          {activeTab === "saved" && (
            <div className="px-3">
              {loadingSaved ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-[18px] bg-[#161616] animate-pulse">
                      <div className="aspect-[3/4] bg-white/5 rounded-t-[18px]" />
                      <div className="p-2.5 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-3/4" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !saved?.length ? (
                <EmptyState
                  icon={Bookmark}
                  title="Nothing saved yet"
                  sub="Tap the bookmark on any listing to save it"
                />
              ) : (
                <div style={{ columns: "2", columnGap: "8px" }}>
                  {saved.map((listing: Listing, i: number) => (
                    <PinterestCard key={listing.id} listing={listing} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="px-4 space-y-3">

              {/* Weekly views bar chart */}
              <div className="bg-[#161616] rounded-3xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Weekly Views</p>
                    <p className="text-[24px] font-black text-white leading-tight">
                      {WEEKLY.reduce((a, b) => a + b, 0).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[12px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +23%
                  </span>
                </div>
                <div className="flex items-end gap-1.5">
                  {WEEKLY.map((v, i) => (
                    <MiniBar key={i} value={v} max={maxBar} label={DAYS[i]} idx={i} activeIdx={6} />
                  ))}
                </div>
              </div>

              {/* Metric cards */}
              <AnalyticsCard icon={Eye}         label="Profile Views"    value="1,248"  change="+18%"  color="bg-blue-600/70"    />
              <AnalyticsCard icon={TrendingUp}  label="Listing Clicks"   value="4,392"  change="+31%"  color="bg-primary/70"     />
              <AnalyticsCard icon={ShoppingBag} label="Items Sold"        value={String(profile.totalSales)} change="+5%"   color="bg-violet-600/70" />
              <AnalyticsCard icon={Star}        label="Avg. Rating"       value={profile.rating.toFixed(1)} change="+0.2" color="bg-amber-500/70"  />
              <AnalyticsCard icon={Zap}         label="Response Rate"     value="98%"   change="+2%"   color="bg-emerald-600/70" />

              {/* Achievement badges */}
              <div className="bg-[#161616] rounded-3xl p-4">
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3">Achievements</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Top Seller",    icon: Award,    color: "bg-amber-500/15 text-amber-400  border-amber-500/20" },
                    { label: "Verified",      icon: BadgeCheck, color: "bg-primary/15 text-primary   border-primary/20" },
                    { label: "Fast Shipper",  icon: Zap,      color: "bg-blue-500/15 text-blue-400   border-blue-500/20" },
                    { label: "5★ Reviews",   icon: Star,     color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
                  ].map(({ label, icon: Icon, color }) => (
                    <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${color}`}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── EDIT PROFILE SHEET (mini inline) ── */}
      <AnimatePresence>
        {editOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setEditOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl p-6 pb-10"
            >
              <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mb-6" />
              <h3 className="text-[18px] font-black text-white mb-4">Edit Profile</h3>
              <div className="space-y-3">
                {[
                  { label: "Display Name", value: profile.name },
                  { label: "Bio",          value: profile.bio ?? "" },
                  { label: "Location",     value: formatLocation(profile) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-2xl px-4 py-3">
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-[14px] text-white/70 font-semibold">{value || "—"}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setEditOpen(false)}
                className="w-full mt-5 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[15px]"
              >
                Save Changes
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

/* ── empty state ─────────────────────────────────────────── */
function EmptyState({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-3xl bg-white/4 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/15" />
      </div>
      <p className="text-[15px] font-bold text-white/40 mb-1">{title}</p>
      <p className="text-[12px] text-white/20 leading-relaxed">{sub}</p>
    </div>
  );
}
