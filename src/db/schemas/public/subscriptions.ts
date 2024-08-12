import { relations } from "drizzle-orm";
import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => psychologists.userId, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  status: text("status").notNull(),
  statusFormatted: text("status_formatted").notNull(),
  subscriptionId: text("subscription_id").notNull().unique(),
  renewsAt: text("renews_at"),
  endsAt: text("ends_at"),
  productName: text("product_name"),
  variantName: text("variant_name"),
  trialEndsAt: text("trial_ends_at"),
  cardBrand: text("visa"),
  billingAnchor: integer("billing_anchor"),
  cardLastFour: text("card_last_four"),
});

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type SelectSubscription = typeof subscriptions.$inferSelect;
