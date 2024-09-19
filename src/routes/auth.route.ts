import { Hono } from "hono";

import {
  googleAuth,
  googleAuthCallback,
  login,
  magicLink,
  magicLinkCallback,
  register,
  validate,
} from "@/controllers/auth.controllers";

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

// validate
app.get("/validate", ...validate);

export default app;
