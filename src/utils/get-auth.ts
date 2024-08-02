import { InsertUser, SelectUser, users } from "@/db/schemas";
import { eq, getTableColumns } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

type ReturnType = {
  id: string;
  name: string;
  email: string;
  userType: "psychologist" | "clinic" | "admin";
  iat: number;
  exp: number;
  nbf: number;
};

export const getAuth = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<InsertUser> => {
  const token = getCookie(c, "auth_user");

  const verification = await verify(token!, c.env.JWT_SECRET, "HS256");

  const { password, ...rest } = getTableColumns(users); // separate password from other fields to exclude it
  const [user] = await db
    .select({ ...rest })
    .from(users)
    .where(eq(users.id, verification.id as string));

  return user;
};
