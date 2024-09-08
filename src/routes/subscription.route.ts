import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@/controllers/anamnesis.controllers";
import {
  getCurrentSubscription,
  getSessionInfo,
  goToCheckoutUrl,
  goToPortalUrl,
  subscriptionWebhook,
} from "@/controllers/subscriptions.controllers";
import { Env } from "@/types/bindings";
import { Hono } from "hono";
import { Session } from "hono-sessions";
import { JwtVariables } from "hono/jwt";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

app.get("/current", ...getCurrentSubscription);
app.post("/stripe/checkout", ...goToCheckoutUrl);
app.get("/stripe/success", ...getSessionInfo);
app.post("/stripe/webhook", ...subscriptionWebhook);
app.post("/stripe/portal", ...goToPortalUrl);

export default app;
