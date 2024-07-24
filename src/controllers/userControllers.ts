import { createFactory } from "hono/factory";

import {
  clinics,
  insertPsychologistsSchema,
  psychologists,
} from "@/db/schemas";
import { eq } from "drizzle-orm";

import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getAuth } from "@/lib/auth-config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const factory = createFactory();

// GET USER/PSYCHOLOGIST
export const getUser = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      id: z.string().optional(),
    })
  ),
  async (c) => {
    try {
      // connect to db
      const sql = neon(c.env.DATABASE_URL);
      const db = drizzle(sql);

      const { user } = getAuth(c);

      if (!user) {
        return c.text("UNAUTHORIZED", 401);
      }

      // logic for clinics
      if (user.userType === "clinic") {
        const [clinic] = await db
          .select()
          .from(clinics)
          .where(eq(clinics.userId, user?.id!));

        return c.json(clinic);
      }

      // logic for psychologist
      const [psychologist] = await db
        .select()
        .from(psychologists)
        .where(eq(psychologists.userId, user?.id!));

      return c.json(psychologist);
    } catch (error) {
      console.error("Error updating user data:", error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

// // CREATE USER
// export const createUser = factory.createHandlers(isAuthenticated, async (c) => {
//   const { getUser } = getKindeServerSession();
//   const userData = await getUser();

//   console.log(userData?.id);

//   return c.json({ message: "test" });
// });

// // UPDATE USER
// export const updateUser = factory.createHandlers(
//   // isAuthenticated,
//   zValidator(
//     "json",
//     insertPsychologistsSchema.pick({
//       birthdate: true,
//       addressInfo: true,
//       cpf: true,
//       email: true,
//       firstName: true,
//       lastName: true,
//       phone: true,
//       avatar: true,
//       createdAt: true,
//       updatedAt: true,
//       gender: true,
//       preferences: true,
//       additionalEmails: true,
//       additionalPhones: true,
//       crp: true,
//       password: true,
//       socialLinks: true,
//       specialty: true,
//       website: true,
//     })
//   ),
//   async (c) => {
//     try {
//       const { getUser } = getKindeServerSession();
//       const userData = await getUser();
//       const token = await getToken();

//       // get body data
//       const values = c.req.valid("json");

//       // update inside db
//       const data = await db
//         .update(psychologists)
//         .set({ ...values })
//         .where(eq(psychologists.id, userData?.id!))
//         .returning();

//       if (!data) {
//         return c.json({ error: "Not found" }, 404);
//       }

//       // update inside kinde
//       await updateKindeUser(userData!, values as InsertPsychologist, token);

//       return c.json({ data }, 200);
//     } catch (error) {
//       console.error("Error updating user data:", error);
//       return c.json({ error: "Internal Server Error" }, 500);
//     }
//   }
// );
