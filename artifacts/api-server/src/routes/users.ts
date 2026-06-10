import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, listingsTable, bookmarksTable, watchesTable } from "@workspace/db";
import {
  GetUserProfileParams,
  GetUserListingsParams,
  ToggleBookmarkParams,
} from "@workspace/api-zod";

const router: IRouter = Router();
const CURRENT_USER_ID = 1;

router.get("/users/:username", async (req, res): Promise<void> => {
  const params = GetUserProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable)
    .where(eq(usersTable.username, params.data.username));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const listings = await db.select().from(listingsTable).where(eq(listingsTable.sellerId, user.id));
  res.json({
    ...user,
    avatar: user.avatar ?? null,
    coverImage: user.coverImage ?? null,
    bio: user.bio ?? null,
    joinDate: user.joinDate.toISOString(),
    totalListings: listings.length,
  });
});

router.get("/users/:username/listings", async (req, res): Promise<void> => {
  const params = GetUserListingsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable)
    .where(eq(usersTable.username, params.data.username));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const listings = await db.select().from(listingsTable)
    .where(eq(listingsTable.sellerId, user.id))
    .orderBy(desc(listingsTable.createdAt));

  const enriched = listings.map(l => ({
    ...l,
    sellerName: user.name,
    sellerUsername: user.username,
    sellerAvatar: user.avatar ?? null,
    isVerifiedSeller: user.isVerified,
    images: l.images ?? [],
    isWatched: false,
    isBookmarked: false,
    auctionEndsAt: l.auctionEndsAt?.toISOString() ?? null,
    createdAt: l.createdAt.toISOString(),
  }));
  res.json(enriched);
});

router.get("/bookmarks", async (_req, res): Promise<void> => {
  const bookmarks = await db.select().from(bookmarksTable)
    .where(eq(bookmarksTable.userId, CURRENT_USER_ID));
  const listings = await Promise.all(bookmarks.map(async (b) => {
    const [l] = await db.select().from(listingsTable).where(eq(listingsTable.id, b.listingId));
    if (!l) return null;
    const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, l.sellerId));
    return {
      ...l,
      sellerName: seller?.name ?? "Unknown",
      sellerUsername: seller?.username ?? "unknown",
      sellerAvatar: seller?.avatar ?? null,
      isVerifiedSeller: seller?.isVerified ?? false,
      images: l.images ?? [],
      isWatched: false,
      isBookmarked: true,
      auctionEndsAt: l.auctionEndsAt?.toISOString() ?? null,
      createdAt: l.createdAt.toISOString(),
    };
  }));
  res.json(listings.filter(Boolean));
});

router.post("/bookmarks/:listingId", async (req, res): Promise<void> => {
  const params = ToggleBookmarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const existing = await db.select().from(bookmarksTable)
    .where(eq(bookmarksTable.listingId, params.data.listingId))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarksTable).where(eq(bookmarksTable.listingId, params.data.listingId));
    res.json({ isBookmarked: false });
  } else {
    await db.insert(bookmarksTable).values({ listingId: params.data.listingId, userId: CURRENT_USER_ID });
    res.json({ isBookmarked: true });
  }
});

export default router;
