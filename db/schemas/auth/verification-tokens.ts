import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { authSchema } from "./users";

export const verificationTokens = authSchema.table(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: bigint("expires", { mode: "number" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export type InsertVFToken = typeof verificationTokens.$inferInsert;
export type SelectVFToken = typeof verificationTokens.$inferSelect;
