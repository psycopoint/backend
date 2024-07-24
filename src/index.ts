import { Hono } from "hono";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { getAuth, getAuthConfig } from "./lib/auth-config";
import { Env } from "types/bindings";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

app.use("/auth/*", authHandler());

app.use("/*", verifyAuth());

app.get("/protected", verifyAuth(), (c) => {
  const user = getAuth(c);
  return c.json(user);
});

export default app;
