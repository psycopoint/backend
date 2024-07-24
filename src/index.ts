import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Hono } from "hono";
import { users } from "./db/schemas";

type Env = {
  DATABASE_URL: string;
};
const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  const data = await db.select().from(users);

  return c.json(data);
});

export default app;
