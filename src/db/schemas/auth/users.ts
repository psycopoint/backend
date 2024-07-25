import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgSchema, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userType = pgEnum("user_type", [
  "psychologist",
  "clinic",
  "admin",
]);

export const authSchema = pgSchema("auth");

export const users = authSchema.table("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text("password"),
  image: text("image"),
  userType: userType("user_type").default("psychologist"),
});

// ZOD
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// DRIZZLE TYPES
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
