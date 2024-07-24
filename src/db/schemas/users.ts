import { pgEnum, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

export const userType = pgEnum("user_type", ["psychologist", "clinic"]);

export const authSchema = pgSchema("auth");

export const users = authSchema.table("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  userType: userType("user_type").default("psychologist"),
});
