import { sessions } from "@/db/schemas";
import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

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

  console.log("SESSION: ", session);
  console.log("TOKEN: ", sessionToken);

  const expiration = dayjs().add(1, "hour").toDate();

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
export const saveSessionToDb = async (
  db: NeonHttpDatabase,
  sessionToken: string,
  userId: string
) => {
  const expiration = dayjs().add(1, "hour").toDate();

  await db.insert(sessions).values({
    sessionToken,
    userId,
    expires: expiration,
  });
};
