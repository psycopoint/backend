import twilio from "twilio";
import { Context } from "hono";

export const createTwilio = (c: Context) => {
  const client = twilio(c.env.TWILLIO_ACCOUNT_SID, c.env.TWILLIO_AUTH_TOKEN);

  return client;
};
