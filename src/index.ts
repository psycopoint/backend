import { Hono } from "hono";

import { Env } from "types/bindings";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { JwtVariables } from "hono/jwt";

import { Session, sessionMiddleware, CookieStore } from "hono-sessions";

// ROUTES
import authRoute from "@routes/auth.route";
import usersRoute from "@routes/users.route";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>().basePath("/v1");

app.use(
  csrf({
    origin: (origin) => /https:\/\/(?:\w+\.)?psicohub\.co$/.test(origin),
  })
);

app.use(csrf({ origin: "http://localhost:3000" }));

// CORS
app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.BASE_URL, // allowing only localhost:3000
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

const store = new CookieStore();
app.use("*", async (c, next) => {
  const sessionMid = sessionMiddleware({
    store,
    encryptionKey: c.env.JWT_SECRET, // Required for CookieStore, recommended for others
    expireAfterSeconds: 86400, // 1 days
    cookieOptions: {
      sameSite: "None", // Recommended for basic CSRF protection in modern browsers
      path: "/", // Required for this library to work properly
      httpOnly: true, // Recommended to avoid XSS attacks
      secure: true,
      // signingSecret: "test123879asbd9ae7q9adshd091823hd",
    },
    sessionCookieName: "psicohub.session",
  });

  return sessionMid(c, next);
});

// ROUTES
app.route("/auth", authRoute);
app.route("/users", usersRoute);
// app.route("/patients", patients);

app.get("/test", async (c) => {
  const session = c.get("session");

  return c.text("test");
});

export default app;
