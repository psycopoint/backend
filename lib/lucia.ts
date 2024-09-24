import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";
import { SelectUser, sessions, users } from "@db/schemas";
import { Google } from "arctic";
import { Context } from "hono";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

export const createGoogle = (c: Context) => {
  return new Google(
    c.env.GOOGLE_CLIENT_ID,
    c.env.GOOGLE_CLIENT_SECRET,
    `${c.env.BACKEND_URL}/auth/callback/google`
  );
};

export const createLucia = (c: Context, db: NeonHttpDatabase) => {
  const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

  return new Lucia(adapter, {
    sessionCookie: {
      name: "psycopoint_session",
      attributes: {
        secure: true, // change this to true in production
        domain: `.${c.env.DOMAIN}`, // .psycopoint.com for production & 127.0.0.1 for development
        sameSite: "none", // strict in production & none in dev
      },
    },
    getUserAttributes: (att) => {
      return {
        id: att.id,
        email: att.email,
        name: att.name,
        image: att.image,
        userType: att.userType,
      };
    },
  });
};

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof createLucia>;
    DatabaseUserAttributes: SelectUser;
  }
}

export interface GoogleUserResult {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}
