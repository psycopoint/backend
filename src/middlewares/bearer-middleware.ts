import { Context, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";

export const bearerMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header("Authorization");

  const bearerMiddleware = bearerAuth({
    token: token?.split(" ")[1]!,
  });

  return bearerMiddleware(c, next);
};
