import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { events } from "../public/events";

export const authSchema = pgSchema("auth");

export const userType = authSchema.enum("user_type", [
  "psychologist",
  "clinic",
  "admin",
]);

export const providers = authSchema.enum("providers", [
  "google",
  "linkedin",
  "apple",
  "credentials",
]);

export const users = authSchema.table("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: text("password"),
  image: text("image"),
  userType: userType("user_type").default("psychologist"),
  provider: providers("provider"),
});

//  RELATIONS
export const usersRelations = relations(users, ({ one, many }) => ({
  events: many(events),
}));

// ZOD
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// DRIZZLE TYPES
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
