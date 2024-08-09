import { pgSchema, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { authSchema, users } from "./users";

export const sessions = authSchema.table("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});
