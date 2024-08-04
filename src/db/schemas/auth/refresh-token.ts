import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { authSchema, users } from "./users";
import { createId } from "@paralleldrive/cuid2";

export const refreshToken = authSchema.table("refresh_token", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token"),
  refresh_token: text("refresh_token"),
  expiresAt: integer("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
