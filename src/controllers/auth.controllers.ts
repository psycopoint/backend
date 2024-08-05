import { refreshTokens } from "@/db/schemas";
import {
  generateRefreshToken,
  generateToken,
  getUserByEmail,
  registerUser,
} from "@/services/auth.services";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { and, eq, gt } from "drizzle-orm";

import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";

import { deleteCookie, getCookie } from "hono/cookie";
import { createFactory } from "hono/factory";
import { z } from "zod";

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

      const token = await generateToken(c, newUser.id, db);

      return c.json(token);
    }

    // generate token & refresh token
    const token = await generateToken(c, userDb.id, db);
    const refreshToken = await generateRefreshToken(db, userDb.id);

    return c.redirect(c.env.BASE_URL);
  }
);

export const regenerateToken = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      refreshToken: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { refreshToken } = c.req.valid("json");

    try {
      const [existingRefreshToken] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.id, refreshToken),
            gt(refreshTokens.expiresIn, Math.floor(Date.now() / 1000))
          )
        )
        .limit(1);

      if (!existingRefreshToken) {
        return c.json({ message: "Invalid or expired refresh token" }, 401);
      }

      const token = await generateToken(c, existingRefreshToken.userId, db);
      const newRefreshToken = await generateRefreshToken(
        db,
        existingRefreshToken.userId
      );

      return c.json(token);
    } catch (error) {
      if (error instanceof Error) {
      }

      console.error("Error generating token:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

export const signout = factory.createHandlers(async (c) => {
  return c.text("logout");
});
