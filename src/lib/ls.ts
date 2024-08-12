import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { Context, Next } from "hono";

export const setupLemon = (c: Context) => {
  const setupLemon = lemonSqueezySetup({
    apiKey: c.env.LEMONSQUEEZY_API_KEY,
    onError: (error) => {
      console.log("ERRO NA FUNÇÃO lemonSqueezySetup");
      throw new Error(`Lemon Squeezy API error: ${error.message}`);
    },
  });

  return setupLemon;
};
