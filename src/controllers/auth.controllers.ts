import { sessions } from "@/db/schemas";

import {
  getUserByEmail,
  handleSession,
  registerUser,
} from "@/services/auth.services";

import { getAuth } from "@/utils/get-auth";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";

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
  const session = c.get("session");

  // get user inside db & verify if exists
  const userDb = await getUserByEmail(googleUser?.email as string, db);
  if (!userDb) {
    const newUser = await registerUser(c, db);

    await handleSession(c, db, newUser.id);

    return c.redirect(c.env.FRONTEND_URL);
  }

  // user already exists inside db
  // verify if session exists and is active
  const currentSession = session.get("session_id");

  if (!currentSession) {
    await handleSession(c, db, userDb.id);
  } else {
    const sessionDb = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, currentSession));

    if (!session.length || dayjs(sessionDb[0].expires).isBefore(dayjs())) {
      await handleSession(c, db, userDb.id);
    }
  }

  return c.redirect(c.env.FRONTEND_URL);
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
      // const token = await generateRefreshToken(c, db, user.id, expiration);
      const magicLink = `${c.env.FRONTEND_URL}/magic-link?token=${"token.id"}`;

      // send token to user email
      const data = await resend.emails.send({
        from: "no-reply@psycohub.com",
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

// SIGN OUT
export const signout = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const session = c.get("session");
  const sessionToken = session.get("session_id");
  await session.deleteSession();

  // delete cookie inside db
  await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));

  return c.json({ success: true });
});
