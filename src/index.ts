import { Hono } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { getAuth, getAuthConfig } from "./lib/auth-config";
import { Env } from "types/bindings";

// ROUTES
import users from "@routes/users";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env }>().basePath("/v1");

app.use("*", initAuthConfig(getAuthConfig));
app.use("/auth/*", authHandler());
app.use("/*", verifyAuth());

app.route("/users", users);

app.get("/test", async (c) => {
  return c.json({
    AUTH_SECRET: c.env.AUTH_SECRET,
    AUTH_DRIZZLE_URL: c.env.AUTH_DRIZZLE_URL,
    DATABASE_URL: c.env.DATABASE_URL,
    GOOGLE_CLIENT_ID: c.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: c.env.GOOGLE_CLIENT_SECRET,
    PROJECT_NAME: c.env.PROJECT_NAME,
  });
});

export default app;
