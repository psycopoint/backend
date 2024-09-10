import { createFactory } from "hono/factory";

import { subscriptions } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { getAuth } from "@/utils/get-auth";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  generateCheckoutUrlService,
  getCurrentSubscriptionService,
  getSessionInfoService,
} from "@/services/subscriptions.services";
import { handleError } from "@/utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import dayjs from "dayjs";
import Stripe from "stripe";
import { createStripe } from "@/lib/stripe";

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
      plan: z.enum(["profissional", "profissionalplus"]),
    })
  ),
  async (c) => {
    // TODO: if working with multiples plans, modify this checkout to accept the params
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { plan } = c.req.valid("query");
    let priceId;

    switch (plan) {
      case "profissional":
        priceId = "price_1PwFODCfamTjToK77YmPnSxr";
        break;

      case "profissionalplus":
        priceId = "price_1PwWXcCfamTjToK7Jnoj5Vh8";
        break;

      default:
        break;
    }

    if (!priceId) {
      return c.json({ message: "Invalid priceId" });
    }

    try {
      const url = await generateCheckoutUrlService(c, db, priceId);

      return c.json({ url });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// GET STRIPE SESSION INFORMATIO
export const getSessionInfo = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      session_id: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { session_id } = c.req.valid("query");
    const user = await getAuth(c, db);

    try {
      const stripeInfo = await getSessionInfoService(
        c,
        db,
        session_id as string
      );

      // insert subscription inside db
      if (
        stripeInfo.session.status === "complete" &&
        stripeInfo.session.payment_status === "paid"
      ) {
        await db.insert(subscriptions).values({
          id: createId(),
          userId: user.id,
          customerId: stripeInfo.subscription?.customer as string,
          status: stripeInfo.subscription?.status,
          subscriptionId: stripeInfo.subscription?.id,
          renewsAt: dayjs
            .unix(stripeInfo.subscription?.current_period_end!)
            .toISOString(),
          productName: stripeInfo.product.name,
          trialEndsAt: stripeInfo.subscription?.trial_end
            ? dayjs.unix(stripeInfo.subscription?.trial_end).toISOString()
            : null,
          cardBrand: stripeInfo.payment.card?.brand,
          metadata: stripeInfo.subscription?.metadata,
          cardLastFour: stripeInfo.payment.card?.last4,
          pricing: String(stripeInfo.price.unit_amount),
          quantity: stripeInfo.subscription.items.data[0].quantity as number,
          subscribedAt: String(stripeInfo.subscription.start_date),
        });
      }

      return c.redirect(`${c.env.FRONTEND_URL}/billing?success=true`);
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

  const stripe = createStripe(c);

  try {
    const sig = c.req.header("stripe-signature");

    if (!sig) {
      return c.text("", 400);
    }

    const body = await c.req.text();

    let event;

    event = await stripe.webhooks.constructEventAsync(
      body,
      sig!,
      c.env.STRIPE_WEBHOOK_SECRET_KEY
    );

    switch (event.type) {
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;

        // Recuperar detalhes adicionais se necessário
        const paymentMethod = subscription.default_payment_method
          ? await stripe.paymentMethods.retrieve(
              subscription.default_payment_method as string
            )
          : null;

        const product =
          subscription.items.data.length > 0
            ? await stripe.products.retrieve(
                subscription.items.data[0].plan.product as string
              )
            : null;

        const customer = (await stripe.customers.retrieve(
          event.data.object.customer as string
        )) as Stripe.Customer;

        const price = await stripe.prices.retrieve(
          subscription.items.data[0].price.id as string
        );

        // Atualizar a assinatura no banco de dados
        await db
          .update(subscriptions)
          .set({
            status: subscription.status,
            renewsAt: dayjs.unix(subscription.current_period_end).toISOString(),
            trialEndsAt: subscription.trial_end
              ? dayjs.unix(subscription.trial_end).toISOString()
              : null,
            productName: product?.name || null,
            cardBrand: paymentMethod?.card?.brand || null,
            cardLastFour: paymentMethod?.card?.last4 || null,
            cancelAt: subscription.cancel_at
              ? dayjs.unix(subscription.cancel_at).toISOString()
              : null,
            canceledAt: subscription.canceled_at
              ? dayjs.unix(subscription.canceled_at).toISOString()
              : null,

            endedAt: subscription.ended_at
              ? dayjs.unix(subscription.ended_at).toISOString()
              : null,
            pricing: String(price.unit_amount),
            quantity: subscription.items.data[0].quantity as number,
            subscribedAt: String(subscription.created),
          })
          .where(eq(subscriptions.subscriptionId, subscription.id as string));

        // send email
        // await sendLoginEmail(
        //   c,
        //   customer.email as string,
        //   "Bem-vindo ao Psicopoint",
        //   `Created`
        // );

        break;
      // ... manipular outros tipos de eventos se necessário

      // default:
      //   console.log(`Unhandled event type ${event.type}`);
    }

    return c.json({}, 200);
  } catch (error) {
    return handleError(c, error);
  }
});

export const goToPortalUrl = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      customer: z.string(),
    })
  ),
  async (c) => {
    const stripe = createStripe(c);
    const { customer } = c.req.valid("query");

    try {
      const portalUrl = await stripe.billingPortal.sessions.create({
        customer,
        return_url: `${c.env.FRONTEND_URL}/billing`,
      });

      return c.json({ url: portalUrl.url });
    } catch (error) {
      return handleError(c, error);
    }
  }
);
