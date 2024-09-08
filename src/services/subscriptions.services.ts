import { subscriptions } from "@/db/schemas";
import { getAuth } from "@/utils/get-auth";
import { neon } from "@neondatabase/serverless";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";

import * as crypto from "node:crypto";
import { Buffer } from "node:buffer";
import { upsertSubscription } from "@/utils/subscription";
import { createStripe } from "@/lib/stripe";
import Stripe from "stripe";

// GET CURRENT SUBSCRIPTION
export const getCurrentSubscriptionService = async (
  c: Context,
  db: NeonHttpDatabase
) => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

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
  priceId: string
  // variantId: string
): Promise<string> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const stripe = createStripe(c);

  const session = await stripe?.checkout.sessions.create({
    mode: "subscription",
    success_url: `${c.env.BACKEND_URL}/subscription/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${c.env.FRONTEND_URL}/billing`,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
  });

  return session.url as string;
};

// GET SESSION INFORMATION
export const getSessionInfoService = async (c: Context, sessionId: string) => {
  const stripe = createStripe(c);

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const subscription = await stripe.subscriptions.retrieve(
    session?.subscription as string
  );

  const payment = await stripe.paymentMethods.retrieve(
    subscription?.default_payment_method as string
  );

  const product = await stripe.products.retrieve(
    subscription.items.data[0].plan.product as string
  );

  return { session, subscription, payment, product };
};
