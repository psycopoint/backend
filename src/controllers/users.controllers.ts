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

const factory = createFactory();

// GET @ME
export const getMe = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const user = await getAuth(c, db);

  try {
    if (!user) {
      return c.text("UNAUTHORIZED", 401);
    }

    // get psychologist profile
    const [psychologist] = await db
      .select()
      .from(psychologists)
      .where(eq(psychologists.userId, user.id!));

    // get clinic profile
    const [clinic] = await db
      .select()
      .from(psychologists)
      .where(eq(psychologists.userId, user.id!));

    const data = {
      ...user,
      ...clinic,
      ...psychologist,
    };

    return c.json({ data }, 200);
  } catch (error) {
    console.error("Error updating user data:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// GET ALL USERS
export const getAllUsers = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);
  try {
    const user = await getAuth(c, db);

    if (!user) {
      return c.text("UNAUTHORIZED", 401);
    }

    // logic for admins
    if (user.userType === "admin") {
      const clinic = await db.select().from(clinics);

      const psychologist = await db.select().from(psychologists);

      const data = {
        clinic,
        psychologist,
      };

      return c.json({ data });
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

      if (result) {
        return c.json({ data: result });
      }

      return c.json({
        data: null,
        message: "No psychologist found",
      });
    }

    // if user is psychologists redirect to profile endpoint
    return c.redirect("/users/@me");
  } catch (error) {
    console.error("Error updating user data:", error);
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

    const user = await getAuth(c, db);
    const { id } = c.req.valid("param");

    try {
      if (!user) {
        return c.text("UNAUTHORIZED", 401);
      }

      if (!id) {
        return c.text("Missing ID", 400);
      }

      // logic for admins
      if (user.userType === "admin") {
        const [clinic] = await db
          .select()
          .from(clinics)
          .where(eq(clinics.userId, id));

        const [psychologist] = await db
          .select()
          .from(psychologists)
          .where(eq(psychologists.userId, id));

        if (clinic) {
          return c.json({ data: clinic });
        } else if (psychologist) {
          return c.json({ data: psychologist });
        }

        return c.json({
          data: null,
          message: "No clinic or psychologist found",
        });
      }

      // logic for clinics
      if (user.userType === "clinic") {
        // remove password from query
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
          return c.json({ data: psychologist });
        }

        return c.json({
          data: null,
          message: "No psychologist found",
        });
      }

      // if user is psychologists redirect to profile endpoint
      return c.redirect("/users/@me");
    } catch (error) {
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

    // get user & body data
    const user = await getAuth(c, db);
    const body = c.req.valid("json");

    try {
      if (!user) {
        return c.text("UNAUTHORIZED", 401);
      }

      if (!body) {
        return c.text("Missing body", 400);
      }

      if (user?.userType !== "clinic" && user?.userType !== "admin") {
        console.log("User is not admin or clinic, TYPE:", user?.userType);
        return c.json({ message: "UNAUTHORIZED" }, 401);
      }

      // hash password
      const pwHash = await hashPassword(body.password as string);

      // logic for admins to create an user allowing them to change the user type
      if (user?.userType === "admin") {
        // insert user inside users & psychologist/clinic talbes
        const [userResult] = await db
          .insert(users)
          .values({
            ...body,
            password: pwHash,
          })
          .returning({ id: users.id });

        if (userResult) {
          switch (body.userType) {
            case "psychologist":
              console.log("Inserting user inside psychologists");
              await db.insert(psychologists).values({
                userId: userResult.id,
              });
              break;
            case "clinic":
              await db.insert(clinics).values({
                userId: userResult.id,
                logo: body.image,
                companyName: body.name as string,
              });
              break;
          }
        }

        return c.json({ message: "You're an admin!" });
      }

      // logic for clinics to create an user
      if (user.userType === "clinic") {
        const [userResult] = await db
          .insert(users)
          .values({
            ...body,
            password: pwHash,
          })
          .returning({ id: users.id });

        switch (body.userType) {
          case "psychologist":
            console.log("Inserting user inside psychologists");
            await db.insert(psychologists).values({
              userId: userResult.id,
              clinicId: user.id,
            });
            break;
          default:
            console.log("Error trying to create user");
            return c.json({ message: "UNAUTHORIZED" }, 401);
        }
      }

      // if the user is not admin and tries to add an admin user
      if (body.userType === "admin") {
        return c.text("UNAUTHORIZED", 401);
      }

      return c.json({ message: "You're a clinic", data: body });
    } catch (error) {
      console.error("Error updating user data:", error);
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

    // get user, body data & param id
    const user = await getAuth(c, db);
    const values = c.req.valid("json");
    const { id } = c.req.valid("param");

    try {
      if (!user) {
        return c.text("UNAUTHORIZED", 401);
      }

      if (!id) {
        return c.text("Missing ID", 400);
      }

      // logic for admins
      if (user.userType === "admin") {
        const [psychologist] = await db
          .update(psychologists)
          .set({ ...values })
          .returning();

        return c.json({ data: psychologist });
      }

      // logic for clinics
      if (user.userType === "clinic") {
      }

      // self update
      const data = await db
        .update(psychologists)
        .set({ ...values })
        .where(eq(psychologists.userId, user?.id!))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data }, 200);
    } catch (error) {
      console.error("Error updating user data:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);
