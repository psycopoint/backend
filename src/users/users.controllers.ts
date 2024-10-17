import { createFactory } from "hono/factory";

import { insertPsychologistsSchema, insertUserSchema } from "@db/schemas";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  createUserService,
  getAllUsersDataService,
  getUserDataService,
  getUserService,
  updateUserService,
} from "@src/users/users.services";
import { handleError } from "@utils/handle-error";

import {
  AdditionalEmails,
  AdditionalPhones,
  UserPreferences,
} from "@type/psychologists";
import { createApiResponse } from "@utils/response";

const factory = createFactory();

// GET @ME
export const getMe = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const data = await getUserDataService(c, db);

    return c.json(createApiResponse("success", data), 200);
  } catch (error) {
    return handleError(c, error);
  }
});

// GET ALL USERS
export const getAllUsers = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const data = await getAllUsersDataService(c, db);
    return c.json(createApiResponse("success", data), 200);
  } catch (error) {
    return handleError(c, error);
  }
});

// GET USER BY ID
export const getUser = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      id: z.string().optional(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { id } = c.req.valid("param");

    try {
      const data = await getUserService(c, id as string, db);
      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// CREATE USER
export const createUser = factory.createHandlers(
  zValidator(
    "json",
    insertUserSchema.pick({
      id: true,
      email: true,
      image: true,
      name: true,
      password: true,
      userType: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const body = c.req.valid("json");

    try {
      const data = await createUserService(c, db, body);
      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// UPDATE USER
export const updateUser = factory.createHandlers(
  zValidator(
    "json",
    insertPsychologistsSchema.pick({
      birthdate: true,
      addressInfo: true,
      cpf: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      gender: true,
      preferences: true,
      additionalEmails: true,
      additionalPhones: true,
      crp: true,
      socialLinks: true,
      specialty: true,
      website: true,
      signature: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = c.get("user");
    if (!user) {
      throw new Error("Unauthorized");
    }

    const values = c.req.valid("json");

    console.log("VAUES PREFERENCES: ", values.preferences);

    try {
      const data = await updateUserService(
        c,
        user.id,
        {
          ...values,
          userId: user.id,
          additionalEmails: values.additionalEmails as AdditionalEmails[],
          additionalPhones: values.additionalPhones as AdditionalPhones[],
          preferences: values.preferences as UserPreferences,
        },
        db
      );

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
  }
);
