import {
  InsertPsychologist,
  InsertUser,
  SelectRefreshToken,
  SelectUser,
  psychologists,
  refreshTokens,
  users,
} from "@/db/schemas";
import { refreshToken } from "@hono/oauth-providers/linkedin";
import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

// GENERATE & SET TOKEN
export const generateToken = async (
  c: Context,
  userId: string,
  db: NeonHttpDatabase
): Promise<string> => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  const now = dayjs();
  const expiresIn = dayjs().add(1, "hour").unix();

  // create a JWT token
  const token = await sign(
    {
      sub: userId,
      name: user?.name,
      email: user?.email!,
      userType: user?.userType,
      iat: now.unix(),
      exp: expiresIn,
      nbf: now.unix(),
    },
    c.env.JWT_SECRET,
    "HS256"
  );

  const cookieExpires = new Date(expiresIn * 1000);

  // save the token inside a cookie
  setCookie(c, "psicohub.token", token, {
    path: "/",
    expires: cookieExpires,
    httpOnly: false,
  });

  return token;
};

// CREATE/UPDATE REFRESH TOKEN INSIDE DB
export const generateRefreshToken = async (
  db: NeonHttpDatabase,
  userId: string
): Promise<SelectRefreshToken> => {
  // delete current refresh token inside db
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));

  const [refreshToken] = await db
    .insert(refreshTokens)
    .values({
      id: createId()!,
      userId,
      expiresIn: dayjs().add(30, "days").unix(),
    })
    .returning();

  return refreshToken;
};

// GET USER BY ID
export const getUserById = async (
  id: string,
  db: NeonHttpDatabase
): Promise<SelectUser> => {
  const [exists] = await db.select().from(users).where(eq(users.email, id));

  return exists;
};

// GET USER BY EMAIL
export const getUserByEmail = async (
  email: string,
  db: NeonHttpDatabase
): Promise<SelectUser> => {
  const [exists] = await db.select().from(users).where(eq(users.email, email));

  return exists;
};

// REGISTER USER INSIDE DB
export const registerUser = async (c: Context, db: NeonHttpDatabase) => {
  console.log("inserting user inside db...");
  const user = c.get("user-google");

  if (!user) {
    throw new Error("Error while creating user");
  }

  // insert user inside schema/users
  const userData: InsertUser = {
    ...user,
    id: createId(),
    email: user?.email!,
    userType: "psychologist",
    emailVerified: new Date(),
    image: user?.picture,
    provider: "google",
  };
  const [userDb] = await db.insert(users).values(userData).returning();

  // insert user inside schema/psychologist
  const psychologistData: InsertPsychologist = {
    userId: userDb.id,
  };
  const [psychologistDb] = await db
    .insert(psychologists)
    .values(psychologistData)
    .returning();

  return {
    ...userDb,
    ...psychologistDb,
  };
};
