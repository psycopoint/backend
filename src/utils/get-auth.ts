import { InsertUser, SelectUser, sessions, users } from "@/db/schemas";
import dayjs from "dayjs";
import { eq, getTableColumns } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

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
  db: NeonHttpDatabase,
  sessionToken: string
): Promise<SelectUser> => {
  // Obter o cookie da sessão da requisição

  if (!sessionToken) {
    throw new Error("Not authenticated");
  }

  // Recuperar a sessão do banco de dados
  const [sessionRecord] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionToken, sessionToken as string));

  if (!sessionRecord || dayjs(sessionRecord.expires).isBefore(dayjs())) {
    throw new Error("Expired or invalid session");
  }

  // Recuperar os dados do usuário usando o userId da sessão
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionRecord.userId));

  if (!user) {
    throw new Error("Not found");
  }

  return { ...user };
};
