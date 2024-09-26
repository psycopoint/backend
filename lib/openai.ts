import { Context } from "hono";
import OpenAI from "openai";

export const createAi = (c: Context) => {
  const openai = new OpenAI({
    apiKey: c.env.OPENAI_SECRET_KEY,
  });

  return openai;
};
