import { SelectSubscription, subscriptions } from "../db/schemas";
import { Attributes } from "../types/subscription";
import { createId } from "@paralleldrive/cuid2";
import { getCurrentSubscriptionService } from "@src/subscriptions/subscriptions.services";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

// TODO: change attributes interface
export const upsertSubscription = async (
  db: NeonHttpDatabase,
  existing: SelectSubscription,
  subscriptionId: string,
  userId: string,
  status: string,
  attributes: Attributes
) => {
  const subscriptionData = {
    statusFormatted: attributes.status_formatted,
    endsAt: attributes.ends_at,
    renewsAt: attributes.renews_at,
    trialEndsAt: attributes.trial_ends_at,
    billingAnchor: attributes.billing_anchor,
    cardBrand: attributes.card_brand,
    cardLastFour: attributes.card_last_four,
    variantName: attributes.variant_name,
    productName: attributes.product_name,
    userName: attributes.user_name,
  };

  if (existing) {
    await db
      .update(subscriptions)
      .set(subscriptionData)
      .where(eq(subscriptions.subscriptionId, subscriptionId));
  } else {
    await db.insert(subscriptions).values({
      id: createId(),
      subscriptionId,
      userId,
      status,
      ...subscriptionData,
    });
  }
};

export const userPlan = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<"Profissional+" | "Profissional"> => {
  const subscriptionData = await getCurrentSubscriptionService(c, db);

  return subscriptionData.productName as "Profissional+" | "Profissional";
};
