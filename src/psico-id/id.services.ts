import { SelectPsicoId, psicoId } from "@db/schemas";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

export const getPsicoIdService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectPsicoId[]> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const data = await db
    .select()
    .from(psicoId)
    .where(eq(psicoId.userId, user.id!));

  return data as SelectPsicoId[];
};
