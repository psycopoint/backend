import { relations } from "drizzle-orm";
import { pgTable, text, integer, jsonb } from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => psychologists.userId, { onDelete: "cascade" }),
  customerId: text("customer_id"),
  pricing: text("pricing"),
  quantity: integer("quantity").default(1),
  subscribedAt: text("subscribed_at"),
  status: text("status").notNull(),
  subscriptionId: text("subscription_id").notNull().unique(),
  renewsAt: text("renews_at"),
  cancelAt: text("cancel_at"),
  canceledAt: text("canceled_at"),
  endedAt: text("ended_at"),
  productName: text("product_name"),
  metadata: jsonb("metadata").default("{}"),
  trialEndsAt: text("trial_ends_at"),
  cardBrand: text("visa"),
  cardLastFour: text("card_last_four"),
});

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
