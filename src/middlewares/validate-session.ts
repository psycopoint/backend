import { Context, Next } from "hono";

// VALIDATE SESSION
export const validadeSessionMid = async (c: Context, next: Next) => {
  const session = c.get("session");
  if (!session) {
    return c.redirect(`${c.env.FRONTEND_URL}/auth/login`);
  }

  console.log(c.req.path);

  // Retorna o resultado da sessão
  return c.redirect(`${c.env.FRONTEND_URL}/`);
};
