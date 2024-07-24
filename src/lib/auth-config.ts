import { type AuthConfig } from "@hono/auth-js";
import { Context } from "hono";
import Google from "@auth/core/providers/google";

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  InsertPsychologist,
  accounts,
  psychologists,
  sessions,
  users,
  verificationTokens,
} from "../db/schemas";
import { eq } from "drizzle-orm";

export const getAuthConfig = (c: Context): AuthConfig => {
  // connect to db
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
    callbacks: {
      async signIn({ user }) {
        console.log("USER: ", user);

        // Type assertion to access userType
        const customUser = user as { userType?: string };

        // verify if user exist inside db
        const [existing] = await db
          .select()
          .from(psychologists)
          .where(eq(psychologists.userId, user.id!));

        // if user is psychologist create user inside psychologist table
        if (!existing && customUser.userType === "psychologist") {
          const data: InsertPsychologist = {
            userId: user.id!,
            email: user.email!,
            firstName: user.name?.split(" ")[0]!,
            lastName: user.name?.split(" ")[1]!,
            avatar: user.image,
          };
          await db.insert(psychologists).values(data);
        }

        return true;
      },
    },
  };
};

export const getAuth = (c: Context) => {
  return c.get("authUser");
};
