import { Hono } from "hono";

import { Env } from "types/bindings";

// ROUTES
import users from "@routes/users";
import auth from "@routes/auth";
import { JwtVariables, jwt } from "hono/jwt";
import { bearerMiddleware } from "./middlewares/bearer-middleware";
import { cors } from "hono/cors";

type Variables = JwtVariables;

const app = new Hono<{ Bindings: Env; Variables: Variables }>().basePath("/v1");

app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.BASE_URL, // Permite apenas o frontend no localhost:3000
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

app.route("/auth", auth);

app.route("/users", users);

export default app;
