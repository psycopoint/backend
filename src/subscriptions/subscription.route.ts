import {
  getPatientAnamnesis,
  updateAnamnesis,
} from "@src/anamnese/anamnesis.controllers";
import {
  getCurrentSubscription,
  getSessionInfo,
  goToCheckoutUrl,
  goToPortalUrl,
  subscriptionWebhook,
} from "@src/subscriptions/subscriptions.controllers";
import { Bindings, Variables } from "../../types/bindings";
import { Hono } from "hono";
import { JwtVariables } from "hono/jwt";

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

app.get("/current", ...getCurrentSubscription);
app.post("/stripe/checkout", ...goToCheckoutUrl);
app.get("/stripe/success", ...getSessionInfo);
app.post("/stripe/webhook", ...subscriptionWebhook);
app.post("/stripe/portal", ...goToPortalUrl);

export default app;
