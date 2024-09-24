import { createTwilio } from "@lib/twilio";
import {
  getEventService,
  updateEventService,
} from "@src/events/events.services";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

const factory = createFactory();

export const appointmentReminder = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      user: z.string(),
      time: z.string(),
      to: z.string(),
      eventId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const twilio = createTwilio(c);

    const body = await c.req.parseBody();
    const values = c.req.valid("json");

    console.log(values);
    console.log(body);

    // const message = await twilio.messages.create({
    //   // contentSid: "HX1f180f020e9502714fdf6ababe4dead5", template message
    //   // ContentVariables: JSON.stringify({1}) - variables
    //   body: "Your appointment is coming up on July 21 at 3PM",
    //   from: "whatsapp:+14155238886",
    //   to: `whatsapp:${values.to}`,
    // });

    // update event.data.notification to true if message was sent
    const event = await getEventService(c, db, values.eventId);

    const updateEvent = await updateEventService(
      c,
      db,
      {
        data: {
          ...event.data,
          notification: true,
        },
      },
      values.eventId
    );

    console.log(updateEvent);

    return c.json({ message: "success" });
  }
);

export const appointmentConfirmation = factory.createHandlers(async (c) => {
  const body = await c.req.parseBody();
  console.log(body);
  console.log("AQUI");

  return c.json({ message: "Thanks for confirming!" });
});
