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
import { decode } from "hono/jwt";
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

  const expiration = dayjs().add(1, "hour").unix();
  // register user inside db
  if (!userDb) {
    const newUser = await registerUser(c, db);

    // generate token & refresh token
    const token = await generateToken(c, newUser.id, db, expiration);
    const refreshToken = await generateRefreshToken(c, db, newUser.id);

    return c.redirect(c.env.BASE_URL);
  }

  // generate token & refresh token

  const token = await generateToken(c, userDb.id, db, expiration);
  const refreshToken = await generateRefreshToken(c, db, userDb.id);

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
      const token = await generateRefreshToken(c, db, user.id, expiration);
      const magicLink = `${c.env.BASE_URL}/magic-link?token=${token.id}`;

      // send token to user email
      const data = await resend.emails.send({
        from: "no-reply@psycohub.com",
        to: email,
        subject: "Seu Acesso Psicohub",
        html: `<a href="${magicLink}">Click here to login</a>`,
      });

      console.log(data);

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
      refresh_token: z.string(),
      access_token: z.string(),
    })
  ),
  async (c) => {
    // Connect to DB
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { access_token, refresh_token } = c.req.valid("json");

    // Decode the access token to get the payload and exp
    const dataToken = decode(access_token).payload;
    const tokenExp = dataToken.exp; // exp timestamp in seconds
    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds

    // Check if the access token has expired
    if (tokenExp! > currentTime) {
      console.log("Access token is still valid");
      return c.json({ message: "Access token is still valid" }, 200);
    }

    try {
      // Validate refresh token
      const [existingRefreshToken] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.id, refresh_token),
            gt(refreshTokens.expiresIn, currentTime)
          )
        )
        .limit(1);

      if (!existingRefreshToken) {
        return c.json({ message: "Invalid or expired refresh token" }, 401);
      }

      // Generate new tokens
      const newToken = await generateToken(c, existingRefreshToken.userId, db);
      const newRefreshToken = await generateRefreshToken(
        c,
        db,
        existingRefreshToken.userId
      );

      return c.json({ token: newToken, refresh_token: newRefreshToken });
    } catch (error) {
      console.error("Error generating token:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

// SIGN OUT
export const signout = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      "psicohub.rf": z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const cookie = c.req.valid("json");

    console.log(cookie["psicohub.rf"]);

    if (!cookie["psicohub.rf"]) {
      return c.json({ error: "Missing token" }, 400);
    }

    // delete rf cookie inside db
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, cookie["psicohub.rf"]));

    return c.text("success");
  }
);
