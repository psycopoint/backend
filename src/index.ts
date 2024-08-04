import { Hono } from "hono";

import { Env } from "types/bindings";

import { bearerAuth } from "hono/bearer-auth";

import { getCookie } from "hono/cookie";

// ROUTES
import users from "@routes/users";
import auth from "@routes/auth";
import { JwtVariables, jwt } from "hono/jwt";

type Variables = JwtVariables;

const app = new Hono<{ Bindings: Env; Variables: Variables }>().basePath("/v1");

app.route("/auth", auth);

app.use("/*", async (c, next) => {
  const token = c.req.header("Authorization");

  const bearerMiddleware = bearerAuth({
    token: token?.split(" ")[1]!,
  });

  return bearerMiddleware(c, next);
});

app.route("/users", users);

export default app;
