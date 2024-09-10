import { Hono } from "hono";

import { Env } from "types/bindings";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { JwtVariables } from "hono/jwt";

import { Session, sessionMiddleware, CookieStore } from "hono-sessions";

// ROUTES
import authRoute from "@routes/auth.route";
import usersRoute from "@routes/users.route";
import subscriptionRoute from "@routes/subscription.route";
import uploadRoute from "@routes/upload.route";
import dayjs from "dayjs";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>().basePath("/v1");

// app.use("*", async (c, next) => {
//   const csrfMiddleware = csrf({
//     origin: ["https://api.psycohub.com", "http://localhost:3000"],
//   });

//   return csrfMiddleware(c, next);
// });

// CORS
app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.FRONTEND_URL, // allowing only localhost:3000
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS", "DELETE"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  });

  return corsMiddleware(c, next);
});

const store = new CookieStore();
app.use("*", async (c, next) => {
  const sessionMid = sessionMiddleware({
    store,
    encryptionKey: c.env.SESSION_SECRET, // Required for CookieStore, recommended for others
    expireAfterSeconds: c.env.SESSEION_DURATION * 86400, // 1 days
    // cookieOptions: {
    //   sameSite: "none", // Recommended for basic CSRF protection in modern browsers
    //   path: "/", // Required for this library to work properly
    //   httpOnly: true, // Recommended to avoid XSS attacks
    //   secure: true,
    //   domain: c.env.COOKIE_DOMAIN,
    // },

    cookieOptions: {
      sameSite: "none", // Recommended for basic CSRF protection in modern browsers
      path: "/", // Required for this library to work properly
      httpOnly: true, // Recommended to avoid XSS attacks
      secure: true,
      maxAge: c.env.SESSEION_DURATION * 86400,
      // expires: dayjs().add(c.env.SESSEION_DURATION, "day").toDate(),
    },
    sessionCookieName: "psicopoint.session",
  });

  //@ts-ignore
  return sessionMid(c, next);
});

// ROUTES
app.route("/auth", authRoute);
app.route("/users", usersRoute);
app.route("/subscription", subscriptionRoute);
app.route("/file", uploadRoute);

export default app;
