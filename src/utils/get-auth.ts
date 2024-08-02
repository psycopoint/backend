import { users } from "@/db/schemas";
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

export const getAuth = async (c: Context): Promise<ReturnType> => {
  const token = getCookie(c, "auth_user");

  const verification = await verify(token!, c.env.JWT_SECRET, "HS256");

  return verification as ReturnType;
};
