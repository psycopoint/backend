import { relations } from "drizzle-orm";
import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => psychologists.userId, { onDelete: "cascade" }),
  customerId: text("customer_id"),
  status: text("status").notNull(),
  subscriptionId: text("subscription_id").notNull().unique(),
  renewsAt: text("renews_at"),
  cancelAt: text("cancel_at"),
  canceledAt: text("canceled_at"),
  endedAt: text("ended_at"),
  productName: text("product_name"),
  trialEndsAt: text("trial_ends_at"),
  cardBrand: text("visa"),
  billingAnchor: integer("billing_anchor"),
  cardLastFour: text("card_last_four"),
});

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
