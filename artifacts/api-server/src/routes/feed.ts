import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, notificationsTable, listingsTable, usersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();
const CURRENT_USER_ID = 1;

const CATEGORIES = [
  { id: 1, name: "Phones", slug: "phones", icon: "smartphone" },
  { id: 2, name: "Electronics", slug: "electronics", icon: "zap" },
  { id: 3, name: "Computers", slug: "computers", icon: "monitor" },
  { id: 4, name: "Fashion", slug: "fashion", icon: "shirt" },
  { id: 5, name: "Food & Agriculture", slug: "food-agriculture", icon: "wheat" },
  { id: 6, name: "Vehicles", slug: "vehicles", icon: "car" },
  { id: 7, name: "Property", slug: "property", icon: "home" },
  { id: 8, name: "Appliances", slug: "appliances", icon: "washing-machine" },
  { id: 9, name: "Home & Kitchen", slug: "home-kitchen", icon: "utensils" },
  { id: 10, name: "Food & Beverages", slug: "food-beverages", icon: "coffee" },
];

const TRENDING_SEARCHES = [
  { term: "iPhone", count: 15420 },
  { term: "PS5", count: 8934 },
  { term: "Nike", count: 7210 },
  { term: "Furniture", count: 5430 },
  { term: "Laptops", count: 4892 },
  { term: "Cars", count: 4201 },
  { term: "MacBook", count: 3789 },
  { term: "Samsung", count: 3102 },
];

router.get("/notifications", async (_req, res): Promise<void> => {
  const notifs = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, CURRENT_USER_ID))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  const enriched = await Promise.all(notifs.map(async (n) => {
    let actorName = null, actorUsername = null, actorAvatar = null;
    let listingTitle = null, listingImage = null;

    if (n.actorId) {
      const [actor] = await db.select().from(usersTable).where(eq(usersTable.id, n.actorId));
      actorName = actor?.name ?? null;
      actorUsername = actor?.username ?? null;
      actorAvatar = actor?.avatar ?? null;
    }
    if (n.listingId) {
      const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, n.listingId));
      listingTitle = listing?.title ?? null;
      listingImage = (listing?.images ?? [])[0] ?? null;
    }
    return {
      ...n,
      actorName,
      actorUsername,
      actorAvatar,
      listingTitle,
      listingImage,
      createdAt: n.createdAt.toISOString(),
    };
  }));
  res.json(enriched);
});

router.get("/feed/stats", async (_req, res): Promise<void> => {
  const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable);
  const [sellersResult] = await db.select({ count: sql<number>`count(distinct seller_id)` }).from(listingsTable);
  res.json({
    totalListings: Number(totalResult.count),
    activeListings: Number(totalResult.count),
    totalSellers: Number(sellersResult.count),
    totalCategories: CATEGORIES.length,
  });
});

router.get("/categories", async (_req, res): Promise<void> => {
  const enriched = await Promise.all(CATEGORIES.map(async (c) => {
    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(listingsTable).where(eq(listingsTable.category, c.name));
    return { ...c, listingCount: Number(countResult.count) };
  }));
  res.json(enriched);
});

router.get("/search/trending", async (_req, res): Promise<void> => {
  res.json(TRENDING_SEARCHES);
});

export default router;
