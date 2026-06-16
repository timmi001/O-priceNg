import { pgTable, serial, text, boolean, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  avatar: text("avatar"),
  coverImage: text("cover_image"),
  bio: text("bio"),
  location: text("location").notNull().default("Nigeria"),
  joinDate: timestamp("join_date").notNull().defaultNow(),
  rating: real("rating").notNull().default(5.0),
  totalSales: integer("total_sales").notNull().default(0),
  isVerified: boolean("is_verified").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
