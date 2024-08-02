import { Hono } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";

import { Env } from "types/bindings";
type Variables = JwtVariables;

// ROUTES
import users from "@routes/users";
import auth from "@routes/auth";
import { JwtVariables, jwt, verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

const app = new Hono<{ Bindings: Env; Variables: Variables }>().basePath("/v1");

app.route("/users", users);

app.route("/auth", auth);

export default app;
