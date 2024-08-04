import { createFactory } from "hono/factory";

import {
  clinics,
  insertPsychologistsSchema,
  insertUserSchema,
  psychologists,
  users,
} from "@/db/schemas";
import { and, eq, getTableColumns } from "drizzle-orm";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "@/utils/password";
import { getAuth } from "@/utils/get-auth";
import {
  createUserService,
  getAllUsersDataService,
  getUserDataService,
  getUserDataByIdService,
  updateUserService,
} from "@/services/users.services";

const factory = createFactory();

// GET @ME
export const getMe = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const data = await getUserDataService(c, db);
    return c.json({ data }, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return c.text("UNAUTHORIZED", 401);
      }
    }
    console.error("Error fetching user data:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// GET ALL USERS
export const getAllUsers = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const data = await getAllUsersDataService(c, db);
    return c.json({ data }, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return c.text("UNAUTHORIZED", 401);
      }
      if (error.message === "Not found") {
        return c.json({
          data: null,
          message: error.message,
        });
      }
      if (error.message === "REDIRECT_TO_PROFILE") {
        return c.redirect("/users/@me");
      }
    }
    console.error("Error fetching users data:", error);
    return c.json({ error: "Internal Server Error" }, 500);
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
      const data = await getUserDataByIdService(c, id as string, db);
      return c.json({ data }, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          return c.text("UNAUTHORIZED", 401);
        }

        if (error.message === "Missing ID") {
          return c.text("Missing ID", 400);
        }

        if (error.message === "Not found") {
          return c.json({
            data: null,
            message: error.message,
          });
        }

        if (error.message === "REDIRECT_TO_PROFILE") {
          return c.redirect("/users/@me");
        }
      }
      console.error("Error getting user data:", error);
      return c.json({ error: "Internal Server Error" }, 500);
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
      const result = await createUserService(c, body, db);
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          return c.text("UNAUTHORIZED", 401);
        }
        if (error.message === "Missing body") {
          return c.text("Missing body", 400);
        }
      }

      console.error("Error creating user:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

// UPDATE USER
export const updateUser = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      id: z.string(),
    })
  ),
  zValidator(
    "json",
    insertPsychologistsSchema.pick({
      birthdate: true,
      addressInfo: true,
      cpf: true,
      phone: true,
      image: true,
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
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { id } = c.req.valid("param");
    const values = c.req.valid("json");

    try {
      const result = await updateUserService(
        c,
        id,
        { ...values, userId: id },
        db
      );
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          return c.text("UNAUTHORIZED", 401);
        }
        if (error.message === "Missing ID") {
          return c.text("Missing ID", 400);
        }
        if (error.message === "Not found") {
          return c.json({ error: "Not found" }, 404);
        }
      }

      console.error("Error updating user data:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);
