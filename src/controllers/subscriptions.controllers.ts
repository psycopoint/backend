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
  subscriptionWebhookService,
} from "@/services/subscriptions.services";
import { handleError } from "@/utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

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
export const goToCheckoutUrl = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      variant: z.string(),
    })
  ),
  async (c) => {
    // TODO: if working with multiples plans, modify this checkout to accept the params
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { variant } = c.req.valid("query");

    try {
      const data = await generateCheckoutUrlService(c, db, variant);

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// SUBSCRIPTION WEEBHOOK TO CREATE SUBS INSIDE DB
export const subscriptionWebhook = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const text = await c.req.text();

  try {
    const data = await subscriptionWebhookService(c, db, text);

    return c.json({}, 200);
  } catch (error) {
    return handleError(c, error);
  }
});
