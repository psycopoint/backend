import * as crypto from "node:crypto";

import { createFactory } from "hono/factory";

import { subscriptions } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { createCheckout, getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { getAuth } from "@/utils/get-auth";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  generateCheckoutUrlService,
  getCurrentSubscriptionService,
} from "@/services/subscriptions.services";
import { handleError } from "@/utils/handle-error";

const factory = createFactory();

// GET CURRENT SUBSCRIPTION
export const getCurrentSubscription = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const subscription = await getCurrentSubscriptionService(c, db);

  return c.json({ data: subscription || null });
});

// CREATE THE CHECKOUT URL AND GO TO CHECKOUT
export const goToCheckoutUrl = factory.createHandlers(async (c) => {
  // TODO: if working with multiples plans, modify this checkout to accept the params
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const portalUrl = await generateCheckoutUrlService(c, db);
  } catch (error) {
    return handleError(c, error);
  }
});

// SUBSCRIPTION WEEBHOOK TO CREATE SUBS INSIDE DB
export const subscriptionWebhook = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const text = await c.req.text();

  const hmac = crypto.createHmac("sha256", c.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
  const signature = Buffer.from(c.req.header("x-signature") as string, "utf8");

  if (!crypto.timingSafeEqual(digest, signature)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const payload = JSON.parse(text);

  const event = payload.meta.event_name;

  const subscriptionId = payload.data.id;
  const psychologistId = payload.meta.custom_data.user_id;
  const status = payload.data.attributes.status;

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subscriptionId, subscriptionId));

  if (event === "subscription_created") {
    if (existing) {
      await db
        .update(subscriptions)
        .set({
          status,
        })
        .where(eq(subscriptions.subscriptionId, subscriptionId));
    } else {
      await db.insert(subscriptions).values({
        id: createId(),
        subscriptionId,
        psychologistId,
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
      });
    }
  }

  if (event === "subscription_updated") {
    if (existing) {
      await db
        .update(subscriptions)
        .set({
          status,
        })
        .where(eq(subscriptions.subscriptionId, subscriptionId));
    } else {
      await db.insert(subscriptions).values({
        id: createId(),
        subscriptionId,
        psychologistId,
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
      });
    }
  }

  return c.json({}, 200);
});
