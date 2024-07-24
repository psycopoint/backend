import { Hono, Context } from "hono";
import {
  authHandler,
  initAuthConfig,
  verifyAuth,
  type AuthConfig,
} from "@hono/auth-js";
import { getAuthConfig } from "./lib/get-auth-config";

type Env = {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

app.use("/auth/*", authHandler());

app.use("/*", verifyAuth());

app.get("/protected", verifyAuth(), (c) => {
  return c.json({ user: "user" });
});

export default app;
