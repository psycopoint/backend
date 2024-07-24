import { getUser } from "@/controllers/userControllers";
import { clinics, psychologists } from "@/db/schemas";
import { getAuth } from "@/lib/auth-config";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { Context, Hono } from "hono";
import { z } from "zod";

const app = new Hono();

app.get("/", async (c) => {
  return c.json("test");
});
app.get(
  "/:id",
  zValidator(
    "param",
    z.object({
      id: z.string().optional(),
    })
  ),
  async (c: Context) => {
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

export default app;
