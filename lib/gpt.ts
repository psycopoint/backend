import { Context } from "hono";
import OpenAI from "openai";

export const createAi = (c: Context) => {
  const openai = new OpenAI({
    // organization: "org-RtPossFAQ3R",
    // project: "proj_rrNEefmTQr1yxX",
    apiKey: "sk-{...}",
  });

  return openai;
};
