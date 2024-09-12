import {
  clinics,
  InsertPsychologist,
  InsertUser,
  psychologists,
  SelectClinic,
  SelectPsychologist,
  SelectUser,
  users,
} from "@/db/schemas";
import { getAuth } from "@/utils/get-auth";
import { hashPassword } from "@/utils/password";
import { and, eq, getTableColumns, ne } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

/**
 * Retrieves the authenticated user data.
 *
 * @param {Context} c - The context object containing environment variables and other request-related data.
 * @param {NeonHttpDatabase} db - The database instance used to query the user data.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing the user, clinic, and psychologist data.
 *
 * @throws {Error} Throws an "Unauthorized" error if the user is not authenticated.

 */
export const getUserDataService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectUser & SelectPsychologist> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Unauthorized");
  }

  const [psychologist] = await db
    .select()
    .from(psychologists)
    .where(eq(psychologists.userId, user.id!));

  const [clinic] = await db
    .select()
    .from(psychologists)
    .where(eq(psychologists.userId, user.id!));

  return {
    ...user,
    ...clinic,
    ...psychologist,
  };
};

/**
 * Retrieves data for all users based on the authenticated user's type.
 *
 * @param {Context} c - The context object containing environment variables and other request-related data.
 * @returns {Promise<Object>} A promise that resolves to an object containing user data.
 * @throws {Error} Throws an error if the user is not authenticated or if no data is found.
 */
export const getAllUsersDataService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<Object> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Unauthorized");
  }

  // logic for admins
  if (user.userType === "admin") {
    const clinic = await db
      .select({
        ...getTableColumns(users),
        ...getTableColumns(clinics),
      })
      .from(clinics)
      .leftJoin(users, eq(users.id, clinics.userId))
      .where(ne(users.id, user.id!));

    const psychologist = await db
      .select({
        ...getTableColumns(users),
        ...getTableColumns(psychologists),
      })
      .from(psychologists)
      .leftJoin(users, eq(users.id, psychologists.userId))
      .where(ne(users.id, user.id!));

    return {
      clinics: clinic,
      psychologists: psychologist,
    };
  }

  // logic for clinics
  if (user.userType === "clinic") {
    const result = await db
      .select({
        ...getTableColumns(users),
        ...getTableColumns(psychologists),
      })
      .from(users)
      .leftJoin(psychologists, eq(users.id, psychologists.userId))
      .where(eq(psychologists.clinicId, user.id!));

    if (result.length > 0) {
      return result;
    } else {
      throw new Error("Not found");
    }
  }

  throw new Error("REDIRECT_TO_PROFILE");
};

/**
 * Retrieves user data based on the authenticated user's type and provided user ID.
 *
 * @param {Context} c - The context object containing environment variables and other request-related data.
 * @param {string} id - The ID of the user to retrieve.
 * @returns {Promise<Object>} A promise that resolves to an object containing user data.
 * @throws {Error} Throws an error if the user is not authenticated or if no data is found.
 */
export const getUserService = async (
  c: Context,
  id: string,
  db: NeonHttpDatabase
): Promise<Object> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!id) {
    throw new Error("Missing ID");
  }

  if (user.userType === "admin") {
    const { password, ...restUserColumns } = getTableColumns(users);
    const { ...restClinicColumns } = getTableColumns(clinics);
    const { ...restPsychologistColumns } = getTableColumns(psychologists);

    const [clinic] = await db
      .select({
        ...restUserColumns,
        ...restClinicColumns,
      })
      .from(clinics)
      .where(eq(clinics.userId, id))
      .leftJoin(users, eq(users.id, clinics.userId));

    const [psychologist] = await db
      .select({
        ...restUserColumns,
        ...restPsychologistColumns,
      })
      .from(psychologists)
      .where(eq(psychologists.userId, id))
      .leftJoin(users, eq(users.id, psychologists.userId));

    if (clinic) {
      return clinic;
    } else if (psychologist) {
      return psychologist;
    }

    throw new Error("Not found");
  }

  if (user.userType === "clinic") {
    const { password, ...restUserColumns } = getTableColumns(users);
    const { ...restPsychologistColumns } = getTableColumns(psychologists);

    const [psychologist] = await db
      .select({
        ...restUserColumns,
        ...restPsychologistColumns,
      })
      .from(users)
      .leftJoin(psychologists, eq(users.id, psychologists.userId))
      .where(and(eq(psychologists.clinicId, user.id!), eq(users.id, id)));

    if (psychologist) {
      return psychologist;
    }

    throw new Error("No psychologist found");
  }

  throw new Error("REDIRECT_TO_PROFILE");
};

/**
 * Creates a new user based on the authenticated user's type and provided data.
 *
 * @param {Context} c - The context object containing environment variables and other request-related data.
 * @param {InsertUserSchema} userData - The data to create a new user.
 * @returns {Promise<Object>} A promise that resolves to a success message and user data if creation is successful.
 * @throws {Error} Throws an error if the user is not authenticated, if data is missing, or if an Unauthorized action is attempted.
 */
export const createUserService = async (
  c: any,
  userData: InsertUser,
  db: NeonHttpDatabase
): Promise<Object> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!userData) {
    throw new Error("Missing body");
  }

  if (user.userType !== "clinic" && user.userType !== "admin") {
    throw new Error("Unauthorized");
  }

  const pwHash = await hashPassword(userData.password as string);

  if (user.userType === "admin") {
    const [userResult] = await db
      .insert(users)
      .values({
        ...userData,
        password: pwHash,
      })
      .returning({ id: users.id });

    if (userResult) {
      switch (userData.userType) {
        case "psychologist":
          await db.insert(psychologists).values({
            userId: userResult.id,
          });
          break;
        case "clinic":
          await db.insert(clinics).values({
            userId: userResult.id as string,
            logo: userData.image as string,
            companyName: userData.name as string,
          });
          break;
      }
    }

    return { message: "User created by admin!" };
  }

  if (user.userType === "clinic") {
    const [userResult] = await db
      .insert(users)
      .values({
        ...userData,
        password: pwHash,
      })
      .returning({ id: users.id });

    switch (userData.userType) {
      case "psychologist":
        await db.insert(psychologists).values({
          userId: userResult.id,
          clinicId: user.id,
        });
        break;
      default:
        throw new Error("Unauthorized");
    }
  }

  if (userData.userType === "admin") {
    throw new Error("Unauthorized");
  }

  return { message: "User created by clinic", data: userData };
};

/**
 * Updates a user's data based on the authenticated user's type and provided user ID.
 *
 * @param {Context} c - The context object containing environment variables and other request-related data.
 * @param {string} id - The ID of the user to update.
 * @param {InsertPsychologist} updateData - The data to update the user with.
 * @returns {Promise<Object>} A promise that resolves to an object containing updated user data.
 * @throws {Error} Throws an error if the user is not authenticated, if data is missing, or if an Unauthorized action is attempted.
 */
export const updateUserService = async (
  c: Context,
  id: string,
  updateData: InsertPsychologist,
  db: NeonHttpDatabase
): Promise<Object> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!id) {
    throw new Error("Missing ID");
  }

  // TODO: improve this to update users inside users table as well
  if (user.userType === "admin") {
    const [psychologist] = await db
      .update(psychologists)
      .set(updateData)
      .where(eq(psychologists.userId, id))
      .returning();

    if (psychologist) {
      return { data: psychologist };
    }

    throw new Error("Not found");
  }

  if (user.userType === "clinic") {
    // Clinics are not authorized to update other users
    throw new Error("Unauthorized");
  }

  // Self-update
  const [data] = await db
    .update(psychologists)
    .set(updateData)
    .where(eq(psychologists.userId, user.id!))
    .returning();

  if (!data) {
    throw new Error("Not found");
  }

  return { data };
};
