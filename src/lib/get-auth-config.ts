import { AuthConfig } from "@hono/auth-js";
import { Context } from "hono";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";

export const getAuthConfig = (c: Context): AuthConfig => {
  return {
    secret: c.env.AUTH_SECRET,
    trustHost: true,
    providers: [
      Google({
        clientId: c.env.GOOGLE_CLIENT_ID,
        clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
  };
};
