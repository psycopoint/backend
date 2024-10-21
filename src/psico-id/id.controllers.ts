import { neon } from "@neondatabase/serverless";
import { handleError } from "@utils/handle-error";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { createFactory } from "hono/factory";

const factory = createFactory();

export const getPsicoId = factory.createHandlers(async (c: Context) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    // const patients = await getAllPatientsService(c, db);
    return c.json({ data: "teste" });
  } catch (error) {
    return handleError(c, error);
  }
});
