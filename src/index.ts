import { Hono } from "hono";

import { Env } from "types/bindings";
import { cors } from "hono/cors";
import { JwtVariables } from "hono/jwt";

// ROUTES
import auth from "@routes/auth";

import users from "@routes/users";

const app = new Hono<{ Bindings: Env; Variables: JwtVariables }>().basePath(
  "/v1"
);

app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.BASE_URL, // allowing only localhost:3000
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

app.route("/auth", auth);

app.route("/users", users);
// app.route("/patients", patients);

export default app;
