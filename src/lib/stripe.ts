import { Context } from "hono";
import Stripe from "stripe";

export const createStripe = (c: Context) => {
  return new Stripe(c.env.STRIPE_API_KEY, {
    apiVersion: "2024-06-20",
  });
};
