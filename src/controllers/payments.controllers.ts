import {
  InsertPayment,
  insertEventSchema,
  insertPaymentSchema,
} from "@/db/schemas";
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
import {
  createPaymentService,
  deletePaymentService,
  getPaymentService,
  getPaymentsService,
  updatePaymentService,
} from "@/services/payments.services";

const factory = createFactory();

// get all events
export const getPayments = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const payments = await getPaymentsService(c, db);

    return c.json({ data: payments });
  } catch (error) {
    return handleError(c, error);
  }
});

// get payment by id
export const getPayment = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      paymentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { paymentId } = c.req.valid("param");

    try {
      const data = await getPaymentService(c, db, paymentId);

      return c.json({ data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// create payment
export const createPayment = factory.createHandlers(
  zValidator(
    "json",
    insertPaymentSchema.pick({
      amount: true,
      eventId: true,
      method: true,
      paymentDate: true,
      patientId: true,
      receipts: true,
      status: true,
      userId: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const values = c.req.valid("json");

    if (!values) {
      return c.text("values not provided");
    }

    const createId = init({
      length: 10,
    });

    const data = await createPaymentService(c, db, {
      ...values,
      id: createId(),
      receipts: [],
    });
    return c.json({ data });
  }
);

// update payment
export const updatePayment = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      paymentId: z.string(),
    })
  ),
  zValidator(
    "json",
    insertPaymentSchema.pick({
      amount: true,
      eventId: true,
      method: true,
      paymentDate: true,
      patientId: true,
      receipts: true,
      status: true,
      userId: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { paymentId } = c.req.valid("param");
    const values = c.req.valid("json");

    const data = await updatePaymentService(
      c,
      db,
      { ...values, id: paymentId },
      paymentId
    );
    return c.json({ data });
  }
);

// delete payment
export const deletePayment = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      paymentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { paymentId } = c.req.valid("param");

    try {
      const data = await deletePaymentService(c, db, paymentId);

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
