import { insertEventSchema } from "@/db/schemas";
import {
  createEventService,
  deleteEventService,
  getEventService,
  getEventsService,
  updateEventService,
} from "@/services/events.services";
import {
  AdministrativeTaskSchema,
  EventData,
  PatientSessionSchema,
  SocialPostSchema,
} from "@/types/events";
import { handleError } from "@/utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

import { init } from "@paralleldrive/cuid2";

const factory = createFactory();

// get all events
export const getEvents = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const appointments = await getEventsService(c, db);

    return c.json({ data: appointments });
  } catch (error) {
    return handleError(c, error);
  }
});

// get event by id
export const getEvent = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      eventId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { eventId } = c.req.valid("param");

    console.log({ eventId });

    try {
      const data = await getEventService(c, db, eventId);

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// create event
export const createEvent = factory.createHandlers(
  zValidator(
    "json",
    insertEventSchema.pick({
      allDay: true,
      clinic: true,
      color: true,
      deletable: true,
      disabled: true,
      editable: true,
      end: true,
      isCompleted: true,
      psychologistId: true,
      start: true,
      title: true,
      type: true,
      updatedAt: true,
      data: true,
      resource: true,
      recurring: true,
      recurringEnd: true,
    }),
    (result, c) => {
      if (result.data.type === "patient_session") {
        const parsed = PatientSessionSchema.safeParse(result.data.data);
        if (!parsed.success) {
          return c.json({ error: parsed.error });
        }
      } else if (result.data.type === "social_post") {
        const parsed = SocialPostSchema.safeParse(result.data.data);
        if (!parsed.success) {
          return c.json({ error: parsed.error });
        }
      } else if (result.data.type === "administrative_task") {
        const parsed = AdministrativeTaskSchema.safeParse(result.data.data);
        if (!parsed.success) {
          return c.json({ error: parsed.error });
        }
      }
    }
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const patientId = c.req.param("patientId");
    const values = c.req.valid("json");

    if (!values) {
      return c.text("values not provided");
    }

    const createId = init({
      length: 10,
    });

    const data = await createEventService(
      c,
      db,
      {
        ...values,
        id: createId(),
        data: values.data as EventData,
        createdAt: new Date().toISOString(),
      },
      patientId
    );
    return c.json({ data });
  }
);

// update event
export const updateEvent = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      eventId: z.string(),
    })
  ),
  zValidator(
    "json",
    insertEventSchema.pick({
      allDay: true,
      clinic: true,
      color: true,
      deletable: true,
      disabled: true,
      editable: true,
      end: true,
      isCompleted: true,
      psychologistId: true,
      start: true,
      title: true,
      type: true,
      updatedAt: true,
      data: true,
      resource: true,
      recurring: true,
      recurringEnd: true,
    }),
    (result, c) => {
      if (result.data.type === "patient_session") {
        const parsed = PatientSessionSchema.safeParse(result.data.data);
        if (!parsed.success) {
          return c.json({ error: parsed.error });
        }
      } else if (result.data.type === "social_post") {
        const parsed = SocialPostSchema.safeParse(result.data.data);
        if (!parsed.success) {
          return c.json({ error: parsed.error });
        }
      } else if (result.data.type === "administrative_task") {
        const parsed = AdministrativeTaskSchema.safeParse(result.data.data);
        if (!parsed.success) {
          return c.json({ error: parsed.error });
        }
      }
    }
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { eventId } = c.req.valid("param");
    const values = c.req.valid("json");

    const data = await updateEventService(
      c,
      db,
      { ...values, id: eventId },
      eventId
    );
    return c.json({ data });
  }
);

// delete event
export const deleteEvent = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      eventId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { eventId } = c.req.valid("param");

    try {
      const data = await deleteEventService(c, db, eventId);

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json(
        { success: true, message: "Event deleted successfully", data },
        200
      );
    } catch (error) {
      return handleError(c, error);
    }
  }
);
