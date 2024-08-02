import {
  generateNewToken,
  getUserByEmail,
  registerUser,
} from "@/services/auth.services";
import { neon } from "@neondatabase/serverless";
import { createId } from "@paralleldrive/cuid2";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { createFactory } from "hono/factory";
import { sign } from "hono/jwt";

const factory = createFactory();

export const googleAuthentication = factory.createHandlers(
  async (c: Context) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const googleUser = c.get("user-google");

    // verify if user exist inside db
    const userDb = await getUserByEmail(googleUser?.email as string, db);

    // register user inside db
    if (!userDb) {
      const newUser = await registerUser(c, db);

      await generateNewToken(c, newUser.id);

      return c.redirect("http://localhost:3000");
    }

    const token = await generateNewToken(c, userDb.id);
    return c.redirect("http://localhost:3000");
  }
);

export const signout = factory.createHandlers(async (c) => {
  deleteCookie(c, "auth_user");
  deleteCookie(c, "state");

  return c.redirect("/");
});
