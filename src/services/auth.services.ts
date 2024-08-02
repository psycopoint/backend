import {
  InsertPsychologist,
  InsertUser,
  SelectUser,
  psychologists,
  users,
} from "@/db/schemas";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

// GENERATE & SET TOKEN
export const generateNewToken = async (
  c: Context,
  id: string
): Promise<string> => {
  const user = c.get("user-google");

  const now = Math.floor(Date.now() / 1000);
  const expirationTime = c.env.JWT_EXPIRATION_TIME * 24 * 60 * 60;

  // create a JWT token
  const tokenJwt = await sign(
    {
      id: id,
      name: user?.name,
      email: user?.email!,
      userType: "psychologist",
      iat: now,
      exp: now + expirationTime,
      nbf: now,
    },
    c.env.JWT_SECRET,
    "HS256"
  );

  // save the token inside a cookie
  setCookie(c, "auth_user", tokenJwt, {
    path: "/",
    expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    httpOnly: true,
  });

  return tokenJwt;
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
