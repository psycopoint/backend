import { AuthConfig } from "@hono/auth-js";
import { Context } from "hono";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { accounts, sessions, users, verificationTokens } from "../db/schemas";

export const getAuthConfig = (c: Context): AuthConfig => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  return {
    secret: c.env.AUTH_SECRET,
    // remove the line in production
    trustHost: true,
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      Google({
        clientId: c.env.GOOGLE_CLIENT_ID,
        clientSecret: c.env.GOOGLE_CLIENT_SECRET,
      }),
    ],
  };
};

export const getAuth = (c: Context) => {
  return c.get("authUser");
};
