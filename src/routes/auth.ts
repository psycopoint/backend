import { Context, Hono } from "hono";
import { z } from "zod";

import { googleAuth, revokeToken } from "@hono/oauth-providers/google";

import { decode, sign, verify } from "hono/jwt";

import {
  googleAuthentication,
  refreshToken,
  resendAuthentication,
  signout,
} from "@/controllers/auth.controllers";

const app = new Hono();

// google login
app.get(
  "/google",
  async (c: Context, next) => {
    const googleAuthMiddleware = googleAuth({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      scope: ["openid", "email", "profile"],
    });
    return googleAuthMiddleware(c, next);
  },
  ...googleAuthentication
);

// resend login
app.get("/resend", ...resendAuthentication);

// refresh token
app.post("/refresh", ...refreshToken);

// logout
app.post("/signout", ...signout);

export default app;
