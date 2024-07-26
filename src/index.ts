import { Hono } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { getAuth, getAuthConfig } from "@/auth";
import { Env } from "types/bindings";

// ROUTES
import users from "@routes/users";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>().basePath("/v1");

app.use(
  "*",
  cors({
    origin: (origin) => origin,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      // "x-csrf-token",
      "x-auth-return-redirect",
    ],
    credentials: true,
  })
);

app.use("*", initAuthConfig(getAuthConfig));
app.use("/auth/*", authHandler());
app.use("/*", verifyAuth());

app.route("/users", users);

export default app;
