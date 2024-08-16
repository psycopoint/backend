import {
  InsertPsychologist,
  InsertUser,
  SelectUser,
  psychologists,
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
