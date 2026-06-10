import { Router, type IRouter } from "express";
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { db, listingsTable, usersTable, watchesTable, bookmarksTable } from "@workspace/db";
import {
  GetListingsQueryParams,
  GetListingParams,
  UpdateListingParams,
  UpdateListingBody,
  DeleteListingParams,
  WatchListingParams,
  CreateListingBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CURRENT_USER_ID = 1;

async function enrichListing(listing: typeof listingsTable.$inferSelect, userId: number) {
  const seller = await db.select().from(usersTable).where(eq(usersTable.id, listing.sellerId)).limit(1);
  const watched = await db.select().from(watchesTable)
    .where(and(eq(watchesTable.listingId, listing.id), eq(watchesTable.userId, userId))).limit(1);
  const bookmarked = await db.select().from(bookmarksTable)
    .where(and(eq(bookmarksTable.listingId, listing.id), eq(bookmarksTable.userId, userId))).limit(1);

  const s = seller[0];
  return {
    ...listing,
    sellerName: s?.name ?? "Unknown",
    sellerUsername: s?.username ?? "unknown",
    sellerAvatar: s?.avatar ?? null,
    isVerifiedSeller: s?.isVerified ?? false,
    images: listing.images ?? [],
    isWatched: watched.length > 0,
    isBookmarked: bookmarked.length > 0,
    auctionEndsAt: listing.auctionEndsAt?.toISOString() ?? null,
    createdAt: listing.createdAt.toISOString(),
  };
}

router.get("/listings", async (req, res): Promise<void> => {
  const parsed = GetListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page, limit, category, search } = parsed.data;
  const offset = ((page ?? 1) - 1) * (limit ?? 20);

  const conditions = [];
  if (category) conditions.push(eq(listingsTable.category, category));
  if (search) conditions.push(ilike(listingsTable.title, `%${search}%`));

  const [rows, countResult] = await Promise.all([
    db.select().from(listingsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(listingsTable.createdAt))
      .limit(limit ?? 20)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(listingsTable)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  const enriched = await Promise.all(rows.map(l => enrichListing(l, CURRENT_USER_ID)));
  res.json({ listings: enriched, total: Number(countResult[0].count), page: page ?? 1, limit: limit ?? 20 });
});

router.post("/listings", async (req, res): Promise<void> => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [listing] = await db.insert(listingsTable).values({
    ...parsed.data,
    sellerId: CURRENT_USER_ID,
  }).returning();
  const enriched = await enrichListing(listing, CURRENT_USER_ID);
  res.status(201).json(enriched);
});

router.get("/listings/trending", async (_req, res): Promise<void> => {
  const rows = await db.select().from(listingsTable)
    .orderBy(desc(listingsTable.watchCount))
    .limit(10);
  const enriched = await Promise.all(rows.map(l => enrichListing(l, CURRENT_USER_ID)));
  res.json(enriched);
});

router.get("/listings/featured", async (_req, res): Promise<void> => {
  const rows = await db.select().from(listingsTable)
    .where(eq(listingsTable.isSponsored, true))
    .orderBy(desc(listingsTable.createdAt))
    .limit(5);
  const enriched = await Promise.all(rows.map(l => enrichListing(l, CURRENT_USER_ID)));
  res.json(enriched);
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const params = GetListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.update(listingsTable)
    .set({ viewCount: sql`${listingsTable.viewCount} + 1` })
    .where(eq(listingsTable.id, params.data.id));

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  res.json(await enrichListing(listing, CURRENT_USER_ID));
});

router.patch("/listings/:id", async (req, res): Promise<void> => {
  const params = UpdateListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateListingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [listing] = await db.update(listingsTable)
    .set(body.data)
    .where(eq(listingsTable.id, params.data.id))
    .returning();
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  res.json(await enrichListing(listing, CURRENT_USER_ID));
});

router.delete("/listings/:id", async (req, res): Promise<void> => {
  const params = DeleteListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(listingsTable).where(eq(listingsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/listings/:id/watch", async (req, res): Promise<void> => {
  const params = WatchListingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const existing = await db.select().from(watchesTable)
    .where(and(eq(watchesTable.listingId, params.data.id), eq(watchesTable.userId, CURRENT_USER_ID)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(watchesTable)
      .where(and(eq(watchesTable.listingId, params.data.id), eq(watchesTable.userId, CURRENT_USER_ID)));
    await db.update(listingsTable)
      .set({ watchCount: sql`${listingsTable.watchCount} - 1` })
      .where(eq(listingsTable.id, params.data.id));
    const [l] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
    res.json({ isWatched: false, watchCount: l?.watchCount ?? 0 });
  } else {
    await db.insert(watchesTable).values({ listingId: params.data.id, userId: CURRENT_USER_ID });
    await db.update(listingsTable)
      .set({ watchCount: sql`${listingsTable.watchCount} + 1` })
      .where(eq(listingsTable.id, params.data.id));
    const [l] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.id));
    res.json({ isWatched: true, watchCount: l?.watchCount ?? 0 });
  }
});

export default router;
