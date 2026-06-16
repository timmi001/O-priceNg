import { pgTable, serial, text, boolean, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  sellerId: integer("seller_id").notNull(),
  condition: text("condition").notNull().default("Used"),
  category: text("category").notNull(),
  location: text("location").notNull(),
  shippingInfo: text("shipping_info"),
  images: text("images").array().notNull().default([]),
  viewCount: integer("view_count").notNull().default(0),
  watchCount: integer("watch_count").notNull().default(0),
  offerCount: integer("offer_count").notNull().default(0),
  isAuction: boolean("is_auction").notNull().default(false),
  auctionEndsAt: timestamp("auction_ends_at"),
  currentBid: real("current_bid"),
  isSponsored: boolean("is_sponsored").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
