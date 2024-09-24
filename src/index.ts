import { Hono } from "hono";

import { Bindings, Variables } from "@type/bindings";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

// ROUTES
import authRoute from "@src/auth/auth.route";
import usersRoute from "@src/users/users.route";
import subscriptionRoute from "@src/subscriptions/subscription.route";
import uploadRoute from "@src/uploads/upload.route";
import webhooksRoute from "@src/webhooks/webhooks.route";

import { isAuthenticatedMid } from "../middlewares/is-authenticated";

import dayjs from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt-br");

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>().basePath("/v1");

// CORS
app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.FRONTEND_URL, // allowing only localhost:3000
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

// CSRF
app.use("*", async (c, next) => {
  const corsMiddleware = csrf({
    origin: c.env.FRONTEND_URL, // allowing only localhost:3000
  });

  return corsMiddleware(c, next);
});

app.use("*", isAuthenticatedMid);

// ROUTES
app.route("/auth", authRoute);
app.route("/users", usersRoute);
app.route("/subscription", subscriptionRoute);
app.route("/file", uploadRoute);
app.route("/webhooks", webhooksRoute);

export default app;
