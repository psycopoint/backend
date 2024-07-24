import { Hono } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { getAuth, getAuthConfig } from "./lib/auth-config";
import { Env } from "types/bindings";

// ROUTES
import users from "@routes/users";

const app = new Hono<{ Bindings: Env }>().basePath("/v1");

// app.use("*", initAuthConfig(getAuthConfig));
// app.use("/auth/*", authHandler());
// app.use("/*", verifyAuth());

// app.route("/users", users);

app.get("/test", async (c) => {
  return c.text(`VARIABLE: ${c.env.GOOGLE_CLIENT_SECRET}`);
});

export default app;
