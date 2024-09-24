import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { authSchema, users } from "./users";

export const sessions = authSchema.table("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
