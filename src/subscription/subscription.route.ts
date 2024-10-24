import {
  createStripeAccount,
  getCurrentSubscription,
  generatePaymentLink,
  getSessionInfo,
  goToCheckoutUrl,
  goToPortalUrl,
  subscriptionWebhook,
  createAccountLink,
} from "@src/subscription/subscriptions.controllers";
import { Bindings, Variables } from "../../types/bindings";
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createStripe } from "@lib/stripe";

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.get("/current", ...getCurrentSubscription);
app.post("/stripe/checkout", ...goToCheckoutUrl);
app.get("/stripe/success", ...getSessionInfo);
app.post("/stripe/webhook", ...subscriptionWebhook);
app.post("/stripe/portal", ...goToPortalUrl);

// accounts logic
app.post("/stripe/create-account", ...createStripeAccount);
app.post("/stripe/generate-payment-link", ...generatePaymentLink);
app.post("/stripe/create-account-link", ...createAccountLink);

app.delete(
  "/stripe/delete-account",
  zValidator(
    "json",
    z.object({
      accountId: z.string(),
    })
  ),
  async (c) => {
    const stripe = createStripe(c);
    const { accountId } = c.req.valid("json");
    const deleted = await stripe.accounts.del(accountId);

    return c.json({ data: deleted });
  }
);

export default app;
