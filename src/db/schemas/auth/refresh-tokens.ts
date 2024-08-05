import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { authSchema, users } from "./users";
import { createId } from "@paralleldrive/cuid2";

export const refreshTokens = authSchema.table("refresh_tokens", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresIn: integer("expires_in").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// DRIZZLE TYPES
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type SelectRefreshToken = typeof refreshTokens.$inferSelect;
