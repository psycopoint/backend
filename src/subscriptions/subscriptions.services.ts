import { subscriptions } from "@db/schemas";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

import { createStripe } from "@lib/stripe";

// GET CURRENT SUBSCRIPTION
export const getCurrentSubscriptionService = async (
  c: Context,
  db: NeonHttpDatabase
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
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
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const stripe = createStripe(c);

  const session = await stripe?.checkout.sessions.create({
    mode: "subscription",
    success_url: `${c.env.BACKEND_URL}/subscription/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${c.env.FRONTEND_URL}/assinatura`,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
  });

  return session;
};

// GET SESSION INFORMATION
export const getSessionInfoService = async (
  c: Context,
  db: NeonHttpDatabase,
  sessionId: string
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

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

  const price = await stripe.prices.retrieve(
    subscription.items.data[0].price.id as string
  );

  return { session, subscription, payment, product, price };
};
