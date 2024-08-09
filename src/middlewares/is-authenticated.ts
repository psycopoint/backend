import { getAuth } from "@/utils/get-auth";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";

export const isAuthenticated = async (c: Context, next: Next) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  return await next();
};
