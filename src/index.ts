import { Hono } from "hono";

import { Bindings, Variables } from "types/bindings";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

// ROUTES
import authRoute from "@routes/auth.route";
import usersRoute from "@routes/users.route";
import subscriptionRoute from "@routes/subscription.route";
import uploadRoute from "@routes/upload.route";
import webhooksRoute from "@/routes/webhooks.route";

import { isAuthenticatedMid } from "./middlewares/is-authenticated";

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
