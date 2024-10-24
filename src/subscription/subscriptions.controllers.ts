import { createFactory } from "hono/factory";

import {
  SelectEvent,
  SelectUser,
  insertEventSchema,
  insertTransactionSchema,
  psicoId,
  subscriptions,
  transactions,
} from "@db/schemas";
import { eq } from "drizzle-orm";
import { createId, init } from "@paralleldrive/cuid2";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  generateCheckoutUrlService,
  getCurrentSubscriptionService,
  getSessionInfoService,
} from "@src/subscription/subscriptions.services";
import { handleError } from "@utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import dayjs from "dayjs";
import Stripe from "stripe";
import { createStripe } from "@lib/stripe";
import { createApiResponse } from "@utils/response";
import { createResend } from "@lib/resend";
import {
  createPsicoIdService,
  getPsicoIdService,
} from "@src/psicoid/id.services";
import { createPsicoId } from "@src/psicoid/id.controllers";

// emails
import WelcomeEmail from "@emails/welcome";
import { PatientSession } from "@type/events";

const factory = createFactory();

// GET CURRENT SUBSCRIPTION
export const getCurrentSubscription = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const subscription = await getCurrentSubscriptionService(c, db);

  return c.json({ data: subscription || null });
});

// CREATE AND GO TO CHECKOUT URL
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
    if (!plan) {
      return c.json(
        createApiResponse("error", undefined, "Missing plan name"),
        400
      );
    }

    let priceId;

    switch (plan) {
      case "profissional":
        priceId = "price_1PwFODCfamTjToK77YmPnSxr";
        break;

      case "profissionalplus":
        priceId = "price_1PwWXcCfamTjToK7Jnoj5Vh8";
        break;
    }

    try {
      const data = await generateCheckoutUrlService(c, db, priceId);

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// GET STRIPE SESSION INFORMATION
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

    const user = c.get("user");
    if (!user) {
      throw new Error("Unauthorized");
    }

    const resend = createResend(c);

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
        const [subscriptionDb] = await db
          .insert(subscriptions)
          .values({
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
          })
          .returning();

        // send email
        const { data, error } = await resend.emails.send({
          // from: `Psycopoint <suporte@${c.env.DOMAIN}>`,
          from: `Psycopoint <suporte@psycopoint.com>`,
          to: [user.email as string],
          subject: "Bem-vindo ao Psycopoint!",
          react: WelcomeEmail({
            plan: subscriptionDb.productName as
              | "Profissional+"
              | "Profissional",
          }),
        });
      }

      return c.redirect(`${c.env.FRONTEND_URL}/assinatura?success=true`);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// SUBSCRIPTION WEEBHOOK
export const subscriptionWebhook = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const user = c.get("user") as SelectUser;

  const stripe = createStripe(c);

  try {
    const signature = c.req.header("stripe-signature");

    if (!signature) {
      return c.text("", 400);
    }

    const body = await c.req.text();

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      c.env.STRIPE_WEBHOOK_SECRET_KEY
    );

    switch (event.type) {
      // SUBSCRIPTION
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription;

        // get additional detail if nedeed
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

        // update subscription inside database
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
          .where(eq(subscriptions.subscriptionId, subscription.id as string))
          .returning();

        break;

      // PSYCHOLOGIST ACCOUNT
      case "account.updated":
        const account = event.data.object as Stripe.Account;

        console.log("CHAMOU ACCOUNT WEBHOOK");
        // console.log({ account });

        // update the subscriptio account status

        if (
          account.capabilities?.card_payments === "active" &&
          account.capabilities?.transfers === "active"
        ) {
          await db
            .update(subscriptions)
            .set({ accountStatus: "active" })
            .where(eq(subscriptions.userId, user.id));
        }

        // send email informing about update
        // const { data, error } = await resend.emails.send({
        //   from: `Psycopoint <suporte@${c.env.DOMAIN}>`,
        //   to: [customer.email as string],
        //   subject: "Bem-vindo ao Psycopoint!",
        //   react: WelcomeEmail({
        //     plan: product?.name as "Profissional+" | "Profissional",
        //   }),
        // });
        break;

      // INSERT TRANSACTION INSIDE DB WHEN PAYMENT IS SUCCESSFULL
      case "checkout.session.completed":
        const paymentIntent = event.data.object as Stripe.Checkout.Session;

        console.log(paymentIntent.amount_total!);
        console.log("SUBTOTAL: ", paymentIntent.amount_subtotal!);

        // insert inside db
        await db.insert(transactions).values({
          id: createId(),
          userId: paymentIntent.metadata?.psychologistId,
          amount: String(paymentIntent.amount_total!),
          eventId: paymentIntent.metadata?.id,
          data: JSON.parse(paymentIntent.metadata?.data!) as PatientSession,
          transactionType: "payment",
          status: paymentIntent.status === "complete" ? "paid" : "pending",
          method:
            paymentIntent.payment_method_types[0] === "card"
              ? "credit_card"
              : paymentIntent.payment_method_types[0] === "pix"
              ? "pix"
              : "other",
        });

        break;
      // default:
      //   console.log(`Unhandled stripe event type ${event.type}`);
    }

    return c.json(createApiResponse("success"), 200);
  } catch (error) {
    const errorMessage = `⚠️  Webhook signature verification failed. ${
      error instanceof Error ? error.message : "Internal server error"
    }`;
    console.log(errorMessage);
    return c.text(errorMessage, 400);
  }
});

// GO TO PORTAL URL
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
      const data = await stripe.billingPortal.sessions.create({
        customer,
        return_url: `${c.env.FRONTEND_URL}/assinatura`,
      });

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// ############################################################################
// ###########################    ACCOUNT    ##################################
// ############################################################################

// CREATE STRIPE ACCOUNT
export const createStripeAccount = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const user = c.get("user") as SelectUser;

  const stripe = createStripe(c);

  try {
    // verify if user already has an account configured
    const subscription = await getCurrentSubscriptionService(c, db);

    if (subscription.accountId) {
      return c.json(
        createApiResponse(
          "error",
          [],
          "User already has an account configured."
        ),
        400
      );
    }

    const account = await stripe.accounts.create({
      email: user.email,
      default_currency: "BRL",
      country: "BR",
      controller: {
        stripe_dashboard: {
          type: "express",
        },
        fees: {
          payer: "application",
        },
        losses: {
          payments: "application",
        },
      },
    });

    // update subscription with accountId inside db
    await db
      .update(subscriptions)
      .set({ accountId: account.id })
      .where(eq(subscriptions.userId, user.id))
      .returning();

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      return_url: `${c.env.FRONTEND_URL}/financeiro`,
      refresh_url: `${c.env.FRONTEND_URL}/financeiro/${account.id}`,
      type: "account_onboarding",
    });

    return c.json(createApiResponse("success", { url: accountLink.url }));
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account",
      error
    );
    return handleError(c, error);
  }
});

export const createAccountLink = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      accountId: z.string(),
      mode: z.enum(["account_onboarding", "account_update"]).optional(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const { accountId, mode } = c.req.valid("json");

    const stripe = createStripe(c);

    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        return_url: `${c.env.FRONTEND_URL}/financeiro`,
        refresh_url: `${c.env.FRONTEND_URL}/financeiro/${accountId}`,
        type: mode ?? "account_onboarding",
      });

      return c.json(createApiResponse("success", { url: accountLink.url }));
    } catch (error) {
      console.error(
        "An error occurred when calling the Stripe API to create an account",
        error
      );
      return handleError(c, error);
    }
  }
);

// GET PAYMENT LINK FOR PATIENT
export const generatePaymentLink = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      amount: z.string(),
      method: z.enum(["card", "boleto", "pix", "apple_pay", "google_pay"]),
      eventData: insertEventSchema.pick({
        id: true,
        data: true,
        title: true,
        createdAt: true,
        start: true,
        end: true,
        psychologistId: true,
      }),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = c.get("user") as SelectUser;
    const stripe = createStripe(c);

    const { amount, eventData } = c.req.valid("json");

    try {
      const subscription = await getCurrentSubscriptionService(c, db);

      if (!subscription || !subscription.accountId) {
        return c.json(
          createApiResponse(
            "error",
            [],
            "User has no active subscription or didn't activate the account."
          )
        );
      }

      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ["card"],
          metadata: {
            ...eventData,
            data: JSON.stringify({
              ...(eventData.data as PatientSession),
            }),
          },
          line_items: [
            {
              price_data: {
                currency: "brl",
                product_data: {
                  name: eventData.title,
                },
                unit_amount: Number(amount),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${c.env.FRONTEND_URL}/financeiro/pagamento=success&ession_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${c.env.FRONTEND_URL}/financeiro/pagamento=cancel`, // URL de cancelamento
          payment_intent_data: {
            application_fee_amount: 1000, // TAXA COBRADA
            transfer_data: {
              destination: subscription.accountId, // Conta do psicólogo no Stripe
            },
          },
          // expires_at: ""
        },

        {
          stripeAccount: c.env.STRIPE_ACCOUNT_ID, // Criar o pagamento sob a conta do psicólogo
        }
      );

      console.log({ session });

      // Retornar o link de checkout para o frontend
      return c.json(createApiResponse("success", { url: session.url }));
    } catch (error) {
      console.error(
        "An error occurred when calling the Stripe API to create an account",
        error
      );
      return handleError(c, error);
    }
  }
);
