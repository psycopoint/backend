import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@/controllers/anamnesis.controllers";
import {
  getCurrentSubscription,
  goToCheckoutUrl,
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
app.post("/checkout", ...goToCheckoutUrl);
app.post("/webhook", ...subscriptionWebhook);

export default app;
