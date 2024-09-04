import {
  InsertTransaction,
  insertEventSchema,
  insertTransactionSchema,
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
  createTransactionService,
  deleteTransactionService,
  getTransactionService,
  getTransactionsService,
  updateTransactionService,
} from "@/services/transactions.services";
import { SelectReceipt } from "@/types/transactions";

const factory = createFactory();

// get all transactions
export const getTransactions = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const transactions = await getTransactionsService(c, db);

    return c.json({ data: transactions, message: "success" });
  } catch (error) {
    return handleError(c, error);
  }
});

// get transaction by id
export const getTransaction = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      transactionId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { transactionId } = c.req.valid("param");

    try {
      const data = await getTransactionService(c, db, transactionId);

      return c.json({ data, message: "success" });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// create transaction
export const createTransaction = factory.createHandlers(
  zValidator(
    "json",
    insertTransactionSchema.pick({
      amount: true,
      eventId: true,
      method: true,
      paymentDate: true,
      receipts: true,
      status: true,
      userId: true,
      transactionType: true,
      data: true,
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

    const data = await createTransactionService(c, db, {
      ...values,
      id: createId(),
      amount: values.amount as string,
      receipts: (values.receipts as SelectReceipt[]) || [],
    });
    return c.json({ data });
  }
);

// update transaction
export const updateTransaction = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      transactionId: z.string(),
    })
  ),
  zValidator(
    "json",
    insertTransactionSchema.pick({
      amount: true,
      eventId: true,
      method: true,
      paymentDate: true,
      receipts: true,
      status: true,
      userId: true,
      data: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { transactionId } = c.req.valid("param");
    const values = c.req.valid("json");

    const data = await updateTransactionService(
      c,
      db,
      { ...values, id: transactionId },
      transactionId
    );
    return c.json({ data });
  }
);

// delete transaction
export const deleteTransaction = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      transactionId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { transactionId } = c.req.valid("param");

    try {
      const data = await deleteTransactionService(c, db, transactionId);

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
