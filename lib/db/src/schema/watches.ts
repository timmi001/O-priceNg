import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const watchesTable = pgTable("watches", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWatchSchema = createInsertSchema(watchesTable).omit({ id: true });
export type InsertWatch = z.infer<typeof insertWatchSchema>;
export type Watch = typeof watchesTable.$inferSelect;
