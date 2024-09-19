import { psychologists, users } from "@/db/schemas";
import { verificationTokens } from "@/db/schemas/auth/verification-tokens";
import MagicLink from "@/emails/magic-link";
import { GoogleUserResult, createGoogle, createLucia } from "@/lib/lucia";
import { createResend } from "@/lib/resend";
import { parseCookies } from "oslo/cookie";

import { createJWT, verifyJWT } from "@/utils/jose";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import { createFactory } from "hono/factory";
import { Scrypt, generateId, generateIdFromEntropySize } from "lucia";

import { z } from "zod";
import {
  OAuth2RequestError,
  generateCodeVerifier,
  generateState,
} from "arctic";
import { setCookie } from "hono/cookie";

const factory = createFactory();

// RESEND
export const magicLink = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      email: z.string().min(1).email(),
    })
  ),
  async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const resend = createResend(c);

    const { email } = c.req.valid("json");

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !email) {
      return c.json(
        { sucess: false, error: "An error occurred during sign up." },
        500
      );
    }

    // generate token to insert inside db
    const expiration = 15;
    const expirationDate = Date.now() + expiration * 60 * 1000;
    const token = await createJWT(c, expiration, { email });
    const [tokenDb] = await db
      .insert(verificationTokens)
      .values({
        expires: expirationDate,
        identifier: generateId(10),
        token: token,
      })
      .returning();

    console.log("TOKEN GERADO: ", token);
    const url = `${c.env.BACKEND_URL}/auth/magic/callback?token=${tokenDb.identifier}&email=${user.email}`;

    // send email with token
    const { data, error } = await resend.emails.send({
      from: "Psycopoint <no-reply@psycohub.com>",
      to: [email],
      subject: "Faça login",
      react: MagicLink({ linkUrl: url, loginCode: "123" }),
    });

    return c.json({ sucess: true }, 200);
  }
);

export const magicLinkCallback = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      token: z.string(),
      email: z.string(),
    })
  ),
  async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const lucia = createLucia(db);

    const { token, email } = c.req.valid("query");

    // get token inside db to validate it
    const [tokenDb] = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.identifier, token));

    if (!tokenDb || tokenDb.expires < dayjs().unix() * 1000) {
      return c.json({ error: "Invalid or expired token" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return c.json({ error: "An error occurred during sign up." }, 500);
    }

    const verify = await verifyJWT(c, tokenDb?.token);
    if (!verify) {
      console.log("Error trying loging with magic link!");
      return c.redirect(`${c.env.FROTEND_URL}/auth/login`);
    }

    const session = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", cookie.serialize(), { append: true });

    // delete token inside db.
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, token));

    // redirect user to front-end
    return c.redirect(`${c.env.FRONTEND_URL}/`);
  }
);

// EMAIL & PASSWORD REGISTER
export const register = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      email: z.string().min(1).email(),
      password: z.string().min(1).max(255),
      name: z.string().min(1).max(255),
      crp: z.string().min(1).max(255),
    })
  ),
  async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { email, password, name, crp } = c.req.valid("json");

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return c.json({ error: "User with that email already exists." }, 400);
    }

    const passwordHash = await new Scrypt().hash(password);

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: passwordHash,
        name,
      })
      .returning();

    // insert psychologist
    await db.insert(psychologists).values({
      userId: user.id,
      crp: crp,
    });

    if (!user) {
      return c.json({ error: "An error occurred during sign up." }, 500);
    }

    const lucia = createLucia(db);
    const session = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", cookie.serialize(), { append: true });

    return c.json({ message: "success", data: user }, 201);
  }
);

// LOGIN WITH EMAIL & PASSWORD
export const login = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      email: z.string().min(1).email(),
      password: z.string().min(1).max(255),
    })
  ),
  async (c) => {
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { email, password } = c.req.valid("json");

    // fucntion to get user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return c.json({ error: "Invalid email or password." }, 400);
    }

    const validPassword = await new Scrypt().verify(
      user.password as string,
      password
    );
    if (!validPassword) {
      return c.json({ error: "Invalid email or password." }, 400);
    }

    const lucia = createLucia(db);
    const session = await lucia.createSession(user.id, {});
    const cookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", cookie.serialize(), { append: true });

    return c.json({ message: "success" });
  }
);

// GOOGLE AUTH
export const googleAuth = factory.createHandlers(async (c) => {
  const google = createGoogle(c);
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url: URL = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  // set header
  setCookie(c, "google_oauth_state", state, {
    httpOnly: false, // set to true in production
    secure: false,
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  setCookie(c, "google_code_verifier", codeVerifier, {
    httpOnly: false, // set to true in production
    secure: false,
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return c.redirect(`${url.toString()}&prompt=select_account`);
});

export const googleAuthCallback = factory.createHandlers(async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const google = createGoogle(c);
  const lucia = createLucia(db);

  const cookies = parseCookies(c.req.header("Cookie") ?? "");

  const stateCookie = cookies.get("google_oauth_state") ?? null;
  const codeVerifier = cookies.get("google_code_verifier");

  const url = new URL(c.req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // verify state
  if (!state || !stateCookie || !code || stateCookie !== state) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      codeVerifier as string
    );
    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const googleUserResult =
      (await googleUserResponse.json()) as GoogleUserResult;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.providerId, googleUserResult.sub),
          eq(users.provider, "google")
        )
      );

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      c.header("Set-Cookie", sessionCookie.serialize(), {
        append: true,
      });

      return c.redirect(`${c.env.FRONTEND_URL}/`, 302);
    }

    // insert user inside db & create psychologist
    const userId = generateIdFromEntropySize(10);
    const [user] = await db
      .insert(users)
      .values({
        id: userId as string,
        name: googleUserResult.name as string,
        provider: "google",
        providerId: String(googleUserResult.sub),
        email: googleUserResult.email,
      })
      .returning();

    await db.insert(psychologists).values({
      userId: user.id,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", sessionCookie.serialize(), {
      append: true,
    });
    return c.redirect(`${c.env.FRONTEND_URL}/`, 302);
  } catch (e) {
    console.log(e);
    if (e instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    return new Response(null, { status: 500 });
  }
});

// VALIDATE SESSION
export const validate = factory.createHandlers(async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ session: false });
  }

  return c.json({ session: true });
});
