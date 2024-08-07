import { refreshTokens } from "@/db/schemas";

import {
  generateRefreshToken,
  generateToken,
  getUserByEmail,
  registerUser,
} from "@/services/auth.services";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import dayjs from "dayjs";
import { and, eq, gt } from "drizzle-orm";

import { drizzle } from "drizzle-orm/neon-http";

import { createFactory } from "hono/factory";
import { Resend } from "resend";
import { z } from "zod";

const factory = createFactory();

// GOOGLE AUTH
export const googleAuthentication = factory.createHandlers(async (c) => {
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
  const refreshToken = await generateRefreshToken(c, db, userDb.id);

  console.log("REFRESH TK: ", refreshToken);

  return c.redirect(c.env.BASE_URL);
});

// RESEND AUTH
export const resendAuthentication = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      email: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const resend = new Resend(c.env.RESEND_API_KEY);
    const { email } = c.req.valid("json");

    try {
      // get user information by email
      const user = await getUserByEmail(email, db);

      // generate a token using the email & creates a magic link with it
      const expiration = dayjs().add(15, "minutes").unix();
      const token = await generateToken(c, user.id, db, expiration);
      const magicLink = `${c.env.BASE_URL}/magic-link?token=${token}`;

      // send token to user email
      await resend.emails.send({
        from: "no-reply@psicohub.co",
        to: email,
        subject: "Seu Acesso Psicohub",
        html: `<a href="${magicLink}">Click here to login</a>`,
      });

      return c.json({ message: "success" });
    } catch (error) {
      return c.json({ error });
    }
  }
);

// REFRESH TOKEN
export const refreshToken = factory.createHandlers(
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
        c,
        db,
        existingRefreshToken.userId
      );

      return c.json({ token });
    } catch (error) {
      if (error instanceof Error) {
      }

      console.error("Error generating token:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

// SIGN OUT
export const signout = factory.createHandlers(async (c) => {
  return c.text("logout");
});
