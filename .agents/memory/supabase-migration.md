---
name: Supabase migration
description: How oprice-ng data layer works after migration from Express API to Supabase
---

## What changed
All data fetching was migrated from `@workspace/api-client-react` (generated hooks hitting the Express API server) to direct Supabase queries.

## New files
- `artifacts/oprice-ng/src/lib/supabase.ts` — Supabase client (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
- `artifacts/oprice-ng/src/lib/auth-context.tsx` — AuthProvider + useAuth() hook
- `artifacts/oprice-ng/src/lib/types.ts` — Listing, UserProfile, Category, TrendingSearch types
- `artifacts/oprice-ng/src/lib/supabase-hooks.ts` — all React Query hooks backed by Supabase
- `artifacts/oprice-ng/supabase/schema.sql` — full DDL + seed SQL (run in Supabase SQL Editor)

## Hook interface (same signatures as old api-client-react)
- useGetListings({ limit, page, search, category })
- useGetFeaturedListings()
- useGetListing(id)
- useGetUserProfile(username)
- useGetUserListings(username)
- useGetBookmarks() — requires auth session
- useGetCategories()
- useGetTrendingSearches()
- useWatchListing() — mutation, toggles favorites table
- useCreateListing() — mutation, requires auth session

## Supabase tables
profiles, listings, categories, favorites, trending_searches

**Why:** User wants app deployable on Vercel without Express backend. Supabase provides DB + auth in one.

**How to apply:** User must run supabase/schema.sql in their Supabase SQL Editor before the app can load real data. The app shows empty states gracefully until data exists.
