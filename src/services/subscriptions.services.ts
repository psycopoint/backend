import { subscriptions } from "@/db/schemas";
import { getAuth } from "@/utils/get-auth";
import { createCheckout, getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";

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
    .where(eq(subscriptions.psychologistId, user.id));

  return subscription;
};

// GENERATE PORTAL URL
export const generateCheckoutUrlService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<string | undefined> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // get the existing subscription inside db
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.psychologistId, user.id));

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
    c.env.LEMONSQUEEZY_STORE_ID!,
    c.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
    {
      checkoutData: {
        custom: {
          user_id: user?.id,
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
