import {
  InsertPsychologist,
  InsertUser,
  SelectRefreshToken,
  SelectUser,
  psychologists,
  refreshTokens,
  users,
} from "@/db/schemas";

import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";

/**
 * Generates a JWT token for a user and sets it in a cookie.
 *
 * @param {Context} c - The context containing environment variables and request information.
 * @param {string} userId - The ID of the user for whom to generate the token.
 * @param {NeonHttpDatabase} db - The database instance to query for user information.
 * @param {number} expiritation? - Optional time for the token expiration.
 * @returns {Promise<string>} A promise that resolves to the generated JWT token.
 */
export const generateToken = async (
  c: Context,
  userId: string,
  db: NeonHttpDatabase,
  expiritation?: number
): Promise<string> => {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  const now = dayjs();
  const expiresIn = dayjs().add(60, "minutes").unix();

  // create a JWT token
  const token = await sign(
    {
      sub: userId,
      name: user?.name,
      email: user?.email!,
      userType: user?.userType,
      iat: now.unix(),
      exp: expiritation || expiresIn,
      nbf: now.unix(),
    },
    c.env.JWT_SECRET,
    "HS256"
  );

  // save the token inside a cookie
  const cookieExpires = new Date((expiritation || expiresIn) * 1000);
  setCookie(c, "psicohub.token", token, {
    path: "/",
    expires: cookieExpires,
    httpOnly: false,
  });

  return token;
};

/**
 * Creates or updates a refresh token for a user in the database.
 *
 * @param {Context} c - The Hono.js Context API.
 * @param {NeonHttpDatabase} db - The database instance to interact with.
 * @param {string} userId - The ID of the user for whom to generate the refresh token.
 * @param {number} expiration - The optional expiratio time of the refresh token.
 * @returns {Promise<SelectRefreshToken>} A promise that resolves to the generated refresh token.
 */
export const generateRefreshToken = async (
  c: Context,
  db: NeonHttpDatabase,
  userId: string,
  expiration?: number
): Promise<SelectRefreshToken> => {
  // delete current refresh token inside db
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));

  const [refreshToken] = await db
    .insert(refreshTokens)
    .values({
      id: createId()!,
      userId,
      expiresIn: expiration || dayjs().add(30, "days").unix(),
    })
    .returning();

  // save the token inside a cookie
  setCookie(c, "psicohub.rf", refreshToken.id, {
    path: "/",
    httpOnly: false,
    secure: false,
  });

  return refreshToken;
};

/**
 * Retrieves a user by their ID.
 *
 * @param {string} id - The ID of the user to retrieve.
 * @param {NeonHttpDatabase} db - The database instance to query.
 * @returns {Promise<SelectUser>} A promise that resolves to the user object if found, or undefined if not found.
 */
export const getUserById = async (
  id: string,
  db: NeonHttpDatabase
): Promise<SelectUser> => {
  const [exists] = await db.select().from(users).where(eq(users.email, id));

  return exists;
};

/**
 * Retrieves a user by their email address.
 *
 * @param {string} email - The email address of the user to retrieve.
 * @param {NeonHttpDatabase} db - The database instance to query.
 * @returns {Promise<SelectUser>} A promise that resolves to the user object if found, or undefined if not found.
 */
export const getUserByEmail = async (
  email: string,
  db: NeonHttpDatabase
): Promise<SelectUser> => {
  const [exists] = await db.select().from(users).where(eq(users.email, email));

  return exists;
};

/**
 * Registers a new user in the database.
 *
 * @param {Context} c - The context containing user information.
 * @param {NeonHttpDatabase} db - The database instance to insert the user into.
 * @returns {Promise<SelectUser>} A promise that resolves to the combined user and psychologist data.
 * @throws {Error} If there is an error while creating the user.
 */
export const registerUser = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectUser> => {
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
