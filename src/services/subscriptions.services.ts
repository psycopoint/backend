import { subscriptions } from "@/db/schemas";
import { setupLemon } from "@/lib/ls";
import { getAuth } from "@/utils/get-auth";
import { createCheckout, getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { neon } from "@neondatabase/serverless";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";

import * as crypto from "node:crypto";
import { Buffer } from "node:buffer";

// GET CURRENT SUBSCRIPTION
export const getCurrentSubscriptionService = async (
  c: Context,
  db: NeonHttpDatabase
) => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // SETUP LEMON
  setupLemon(c);

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));

  return subscription;
};

// GENERATE PORTAL URL
export const generateCheckoutUrlService = async (
  c: Context,
  db: NeonHttpDatabase,
  variantId: string
): Promise<string | undefined> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // SETUP LEMON
  setupLemon(c);

  // get the existing subscription inside db
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));

  // verify if there's a existing subscription inside db
  if (existing) {
    const subscription = await getSubscription(existing.subscriptionId);

    // create a portalUrl do redirect the customer to
    const portalUrl = subscription.data?.data.attributes.urls.customer_portal;

    if (!portalUrl) {
      throw new Error("Internal Error");
    }

    return portalUrl;
  }

  // create the checkout if there's no subscription
  const checkout = await createCheckout(
    c.env.LEMONSQUEEZY_STORE_ID,
    variantId,
    {
      checkoutData: {
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        redirectUrl: `${c.env.FRONTEND_URL!}/`,
      },
    }
  );

  const checkoutUrl = checkout.data?.data.attributes.url;

  if (!checkoutUrl) {
    throw new Error("Internal error");
  }

  return checkoutUrl;
};

// SUBSCRIPTION WEBHOOK
export const subscriptionWebhookService = async (
  c: Context,
  db: NeonHttpDatabase,
  text: string
) => {
  // SETUP LEMON
  setupLemon(c);

  const hmac = crypto.createHmac("sha256", c.env.LEMONSQUEEZY_WEBHOOK_SECRET);
  const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
  const signature = Buffer.from(c.req.header("x-signature") as string, "utf8");

  if (!crypto.timingSafeEqual(digest, signature)) {
    throw new Error("Unauthorized");
  }

  const payload = JSON.parse(text);

  const event = payload.meta.event_name;

  const subscriptionId = payload.data.id;
  const userId = payload.meta.custom_data.user_id;
  const status = payload.data.attributes.status;

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subscriptionId, subscriptionId));

  // CREATED EVENT
  if (event === "subscription_created") {
    if (existing) {
      await db
        .update(subscriptions)
        .set({
          statusFormatted: payload.data.attributes.status_formatted,
          endsAt: payload.data.attributes.ends_at,
          renewsAt: payload.data.attributes.renews_at,
        })
        .where(eq(subscriptions.subscriptionId, subscriptionId));
    } else {
      await db.insert(subscriptions).values({
        id: createId(),
        subscriptionId,
        userId,
        status,
        statusFormatted: payload.data.attributes.status_formatted,
        userName: payload.data.attributes.user_name,
        endsAt: payload.data.attributes.ends_at,
        renewsAt: payload.data.attributes.renews_at,
        trialEndsAt: payload.data.attributes.trial_ends_at,
        billingAnchor: payload.data.attributes.billing_anchor,
        cardBrand: payload.data.attributes.card_brand,
        cardLastFour: payload.data.attributes.card_last_four,
        variantName: payload.data.attributes.variant_name,
        productName: payload.data.attributes.product_name,
      });
    }
  }

  // UPDATED EVENT
  if (event === "subscription_updated") {
    if (existing) {
      await db
        .update(subscriptions)
        .set({
          statusFormatted: payload.data.attributes.status_formatted,
          endsAt: payload.data.attributes.ends_at,
          renewsAt: payload.data.attributes.renews_at,
        })
        .where(eq(subscriptions.subscriptionId, subscriptionId));
    } else {
      await db.insert(subscriptions).values({
        id: createId(),
        subscriptionId,
        userId,
        status,
        statusFormatted: payload.data.attributes.status_formatted,
        userName: payload.data.attributes.user_name,
        endsAt: payload.data.attributes.ends_at,
        renewsAt: payload.data.attributes.renews_at,
        trialEndsAt: payload.data.attributes.trial_ends_at,
        billingAnchor: payload.data.attributes.billing_anchor,
        cardBrand: payload.data.attributes.card_brand,
        cardLastFour: payload.data.attributes.card_last_four,
        variantName: payload.data.attributes.variant_name,
        productName: payload.data.attributes.product_name,
      });
    }
  }
};
