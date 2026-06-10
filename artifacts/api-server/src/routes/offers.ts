import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, offersTable, bidsTable, listingsTable, usersTable } from "@workspace/db";
import {
  GetListingOffersParams,
  CreateOfferParams,
  CreateOfferBody,
  PlaceBidParams,
  PlaceBidBody,
} from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();
const CURRENT_USER_ID = 1;

router.get("/listings/:id/offers", async (req, res): Promise<void> => {
  const params = GetListingOffersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const offers = await db.select().from(offersTable)
    .where(eq(offersTable.listingId, params.data.id))
    .orderBy(desc(offersTable.createdAt));

  const enriched = await Promise.all(offers.map(async (o) => {
    const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, o.buyerId)).limit(1);
    return {
      ...o,
      buyerName: buyer?.name ?? "Unknown",
      buyerUsername: buyer?.username ?? "unknown",
      message: o.message ?? null,
      createdAt: o.createdAt.toISOString(),
    };
  }));
  res.json(enriched);
});

router.post("/listings/:id/offers", async (req, res): Promise<void> => {
  const params = CreateOfferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = CreateOfferBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  await db.update(listingsTable)
    .set({ offerCount: sql`${listingsTable.offerCount} + 1` })
    .where(eq(listingsTable.id, params.data.id));

  const [offer] = await db.insert(offersTable).values({
    listingId: params.data.id,
    buyerId: CURRENT_USER_ID,
    amount: body.data.amount,
    message: body.data.message,
  }).returning();

  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID)).limit(1);
  res.status(201).json({
    ...offer,
    buyerName: buyer?.name ?? "Unknown",
    buyerUsername: buyer?.username ?? "unknown",
    message: offer.message ?? null,
    createdAt: offer.createdAt.toISOString(),
  });
});

router.post("/listings/:id/bid", async (req, res): Promise<void> => {
  const params = PlaceBidParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = PlaceBidBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  await db.update(listingsTable)
    .set({ currentBid: body.data.amount })
    .where(eq(listingsTable.id, params.data.id));

  const [bid] = await db.insert(bidsTable).values({
    listingId: params.data.id,
    bidderId: CURRENT_USER_ID,
    amount: body.data.amount,
  }).returning();

  const [bidder] = await db.select().from(usersTable).where(eq(usersTable.id, CURRENT_USER_ID)).limit(1);
  res.status(201).json({
    ...bid,
    bidderName: bidder?.name ?? "Unknown",
    bidderUsername: bidder?.username ?? "unknown",
    createdAt: bid.createdAt.toISOString(),
  });
});

export default router;
