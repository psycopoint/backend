import { Hono } from "hono";

import {
  googleAuth,
  googleAuthCallback,
  login,
  logout,
  magicLink,
  magicLinkCallback,
  register,
  validateEmail,
  validateSession,
} from "@src/auth/auth.controllers";
import { isAuthenticatedMid } from "middlewares/is-authenticated";

const app = new Hono();

// register
app.post("/register", ...register);

// login with password & email
app.post("/login", ...login);

// resend login
app.post("/magic", ...magicLink);
app.get("/magic/callback", ...magicLinkCallback);

// google login
app.get("/google", ...googleAuth);
app.get("/callback/google", ...googleAuthCallback);

// validate email
app.post("/validate-email", ...validateEmail);

// validade session
app.get("/validate-session", ...validateSession);

// logout
app.post("/logout", ...logout);

export default app;
