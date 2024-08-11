import { Context, Hono } from "hono";

import { googleAuth } from "@hono/oauth-providers/google";

import {
  googleAuthentication,
  resendAuthentication,
  signout,
} from "@/controllers/auth.controllers";
import { Env } from "@/types/bindings";
import { JwtVariables } from "hono/jwt";
import { Session } from "hono-sessions";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

// google login
app.get(
  "/google",
  async (c: Context, next) => {
    const googleAuthMiddleware = googleAuth({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
    });
    return googleAuthMiddleware(c, next);
  },
  ...googleAuthentication
);

// resend login
app.get("/resend", ...resendAuthentication);

// refresh token

// logout
app.post("/signout", ...signout);

export default app;
