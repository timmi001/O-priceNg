import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Listing, UserProfile, Category, TrendingSearch, ListingsPage } from "./types";

// ── Query keys ───────────────────────────────────────────────
export const queryKeys = {
  listings: (params?: object) => ["listings", params] as const,
  featuredListings: () => ["listings", "featured"] as const,
  listing: (id: number) => ["listing", id] as const,
  userProfile: (username: string) => ["user", username] as const,
  userListings: (username: string) => ["user", username, "listings"] as const,
  bookmarks: () => ["bookmarks"] as const,
  categories: () => ["categories"] as const,
  trendingSearches: () => ["trending"] as const,
};

// ── Transform helpers ─────────────────────────────────────────
function transformListing(row: Record<string, unknown>): Listing {
  const profile = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as number,
    title: row.title as string,
    description: row.description as string | undefined,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    condition: (row.condition as string) || "New",
    category: row.category as string,
    location: row.location as string,
    images: (row.images as string[]) || [],
    shippingInfo: row.shipping_info as string | undefined,
    isSponsored: (row.is_featured as boolean) || false,
    isFeatured: (row.is_featured as boolean) || false,
    isAuction: (row.is_auction as boolean) || false,
    auctionEndsAt: row.auction_ends_at as string | undefined,
    viewCount: (row.view_count as number) || 0,
    watchCount: (row.watch_count as number) || 0,
    offerCount: (row.offer_count as number) || 0,
    isWatched: false,
    sellerName: (profile?.name as string) || "Unknown Seller",
    sellerUsername: (profile?.username as string) || "",
    sellerAvatar: profile?.avatar_url as string | undefined,
    isVerifiedSeller: (profile?.is_verified as boolean) || false,
    createdAt: row.created_at as string,
  };
}

function transformProfile(row: Record<string, unknown>, totalListings = 0): UserProfile {
  return {
    id: row.id as string,
    username: row.username as string,
    name: row.name as string,
    avatar: row.avatar_url as string | undefined,
    coverImage: row.cover_image as string | undefined,
    bio: row.bio as string | undefined,
    location: (row.location as string) || "Nigeria",
    isVerified: (row.is_verified as boolean) || false,
    rating: Number(row.rating) || 0,
    totalSales: (row.total_sales as number) || 0,
    totalListings,
    joinDate: row.created_at as string,
  };
}

const LISTING_SELECT = "*, profiles!user_id(username, name, avatar_url, is_verified)";

// ── useGetListings ────────────────────────────────────────────
interface GetListingsParams {
  limit?: number;
  page?: number;
  search?: string;
  category?: string;
}

export function useGetListings(params: GetListingsParams = {}) {
  const { limit = 20, page = 1, search, category } = params;
  return useQuery<ListingsPage>({
    queryKey: queryKeys.listings(params),
    queryFn: async () => {
      const offset = (page - 1) * limit;
      let q = supabase
        .from("listings")
        .select(LISTING_SELECT, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (search) q = q.ilike("title", `%${search}%`);
      if (category) q = q.eq("category", category);

      const { data, error, count } = await q;
      if (error) throw error;

      return {
        listings: (data ?? []).map(transformListing),
        total: count ?? 0,
        page,
        limit,
      };
    },
    staleTime: 30_000,
  });
}

// ── useGetFeaturedListings ────────────────────────────────────
export function useGetFeaturedListings() {
  return useQuery<Listing[]>({
    queryKey: queryKeys.featuredListings(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []).map(transformListing);
    },
    staleTime: 60_000,
  });
}

// ── useGetListing ─────────────────────────────────────────────
export function useGetListing(id: number) {
  return useQuery<Listing | null>({
    queryKey: queryKeys.listing(id),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("id", id)
        .single();
      if (error) return null;
      return transformListing(data);
    },
    enabled: !!id,
  });
}

// ── useGetUserProfile ─────────────────────────────────────────
export function useGetUserProfile(username: string) {
  return useQuery<UserProfile | null>({
    queryKey: queryKeys.userProfile(username),
    queryFn: async () => {
      if (!username) return null;
      const [profileRes, countRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single(),
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", (
            await supabase.from("profiles").select("id").eq("username", username).single()
          ).data?.id ?? ""),
      ]);
      if (profileRes.error || !profileRes.data) return null;
      return transformProfile(profileRes.data, countRes.count ?? 0);
    },
    enabled: !!username,
  });
}

// ── useGetUserListings ────────────────────────────────────────
export function useGetUserListings(username: string) {
  return useQuery<Listing[]>({
    queryKey: queryKeys.userListings(username),
    queryFn: async () => {
      if (!username) return [];
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();
      if (!profileData) return [];

      const { data, error } = await supabase
        .from("listings")
        .select(LISTING_SELECT)
        .eq("user_id", profileData.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(transformListing);
    },
    enabled: !!username,
  });
}

// ── useGetBookmarks ───────────────────────────────────────────
export function useGetBookmarks() {
  return useQuery<Listing[]>({
    queryKey: queryKeys.bookmarks(),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select(`listing_id, listings(${LISTING_SELECT})`)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      return (data ?? [])
        .map((row) => row.listings as Record<string, unknown> | null)
        .filter(Boolean)
        .map((l) => ({ ...transformListing(l!), isWatched: true }));
    },
  });
}

// ── useGetCategories ──────────────────────────────────────────
export function useGetCategories() {
  return useQuery<Category[]>({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
    staleTime: 300_000,
  });
}

// ── useGetTrendingSearches ────────────────────────────────────
export function useGetTrendingSearches() {
  return useQuery<TrendingSearch[]>({
    queryKey: queryKeys.trendingSearches(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_searches")
        .select("term, count")
        .order("count", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as TrendingSearch[];
    },
    staleTime: 300_000,
  });
}

// ── useWatchListing ───────────────────────────────────────────
export function useWatchListing() {
  const queryClient = useQueryClient();

  return useMutation<{ isWatched: boolean; watchCount: number }, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return { isWatched: false, watchCount: 0 };
      }
      const userId = session.user.id;

      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userId)
        .eq("listing_id", id)
        .single();

      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        await supabase
          .from("listings")
          .update({ watch_count: supabase.rpc as unknown as number })
          .eq("id", id);
        const { data } = await supabase
          .from("listings")
          .select("watch_count")
          .eq("id", id)
          .single();
        const newCount = Math.max(0, ((data?.watch_count as number) || 1) - 1);
        await supabase.from("listings").update({ watch_count: newCount }).eq("id", id);
        return { isWatched: false, watchCount: newCount };
      } else {
        await supabase.from("favorites").insert({ user_id: userId, listing_id: id });
        const { data } = await supabase
          .from("listings")
          .select("watch_count")
          .eq("id", id)
          .single();
        const newCount = ((data?.watch_count as number) || 0) + 1;
        await supabase.from("listings").update({ watch_count: newCount }).eq("id", id);
        return { isWatched: true, watchCount: newCount };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks() });
    },
  });
}

// ── useCreateListing ──────────────────────────────────────────
interface CreateListingInput {
  title: string;
  description?: string;
  price: number;
  condition: string;
  category: string;
  location: string;
  images?: string[];
  shippingInfo?: string;
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation<Listing, Error, { data: CreateListingInput }>({
    mutationFn: async ({ data: input }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("You must be signed in to create a listing");

      const { data, error } = await supabase
        .from("listings")
        .insert({
          user_id: session.user.id,
          title: input.title,
          description: input.description,
          price: input.price,
          condition: input.condition,
          category: input.category,
          location: input.location,
          images: input.images ?? [],
          shipping_info: input.shippingInfo,
        })
        .select(LISTING_SELECT)
        .single();

      if (error) throw error;
      return transformListing(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
