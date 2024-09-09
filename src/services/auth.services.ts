import {
  InsertPsychologist,
  InsertUser,
  SelectUser,
  psychologists,
  sessions,
  users,
} from "@/db/schemas";

import { createId, init } from "@paralleldrive/cuid2";
import dayjs from "dayjs";

import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

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

  const createId = init({
    length: 15,
  });

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

/**
 * Utility function to handle sessions.
 *
 * This function manages the creation, verification, and updating of user sessions. It checks if a session token
 * already exists and is valid. If not, it creates a new session and stores it in the database. It also removes any
 * existing sessions for the same user before creating a new one.
 *
 * @param {Context} c - The context object containing session management methods.
 * @param {NeonHttpDatabase} db - The database connection object for interacting with the database.
 * @param {string} userId - The ID of the user for whom the session is being managed.
 *
 * @returns {Promise<void>} - A promise that resolves when the session has been handled.
 *
 * @throws {Error} - Throws an error if there is an issue with database operations or session handling.
 */
export const handleSession = async (
  c: Context,
  db: NeonHttpDatabase,
  userId: string
): Promise<void> => {
  const session = c.get("session");
  let sessionToken = session.get("session_id");

  const expiration = dayjs().add(c.env.SESSION_DURATION, "day").toDate();

  // remove any existing sessions for the same user
  await db.delete(sessions).where(eq(sessions.userId, userId));

  if (!sessionToken) {
    // Create and save a new session
    sessionToken = createId();

    await db
      .insert(sessions)
      .values({
        sessionToken,
        userId,
        expires: expiration,
      })
      .returning();

    session.set("session_id", sessionToken);
  } else {
    // Check and update existing session if necessary
    const sessionDb = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, sessionToken));

    if (!sessionDb.length || dayjs(sessionDb[0].expires).isBefore(dayjs())) {
      sessionToken = createId();
      await db.insert(sessions).values({
        sessionToken,
        userId,
        expires: expiration,
      });
      session.set("session_id", sessionToken);
    }
  }
};

// function to save session inside db
// export const saveSessionToDb = async (
//   c: Context,
//   db: NeonHttpDatabase,
//   sessionToken: string,
//   userId: string
// ) => {
//   const expiration = dayjs().add(c.env.SESSION_DURATION, "day").toDate();

//   await db.insert(sessions).values({
//     sessionToken,
//     userId,
//     expires: expiration,
//   });
// };
