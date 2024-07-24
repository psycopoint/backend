import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  pgSchema,
} from "drizzle-orm/pg-core";
import { authSchema } from "../users";

export const verificationTokens = authSchema.table(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);
