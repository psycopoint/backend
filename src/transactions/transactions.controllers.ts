import { insertTransactionSchema } from "@db/schemas";
import { handleError } from "@utils/handle-error";
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
} from "@src/transactions/transactions.services";
import { SelectReceipt } from "@type/transactions";
import { createApiResponse } from "@utils/response";

const factory = createFactory();

// get all transactions
export const getTransactions = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const data = await getTransactionsService(c, db);

    return c.json(createApiResponse("success", data), 200);
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

      return c.json(createApiResponse("success", data), 200);
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
      return c.json(
        createApiResponse("error", undefined, "Values not provided"),
        400
      );
    }

    const createId = init({
      length: 10,
    });

    try {
      const data = await createTransactionService(c, db, {
        ...values,
        id: createId(),
        amount: values.amount as string,
        receipts: (values.receipts as SelectReceipt[]) || [],
      });

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
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
    if (!values) {
      return c.json(
        createApiResponse("error", undefined, "Values not provided"),
        400
      );
    }
    try {
      const data = await updateTransactionService(
        c,
        db,
        { ...values, id: transactionId },
        transactionId
      );

      return c.json(createApiResponse("success", data), 200);
    } catch (error) {
      return handleError(c, error);
    }
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

    if (!transactionId) {
      return c.json(
        createApiResponse("error", undefined, "Missing Transaction ID"),
        400
      );
    }

    try {
      const data = await deleteTransactionService(c, db, transactionId);

      if (!data) {
        return c.json(
          createApiResponse(
            "error",
            undefined,
            "Missing values on body request"
          ),
          400
        );
      }

      return c.json(
        createApiResponse("success", data, "Transaction deleted successfully"),
        200
      );
    } catch (error) {
      return handleError(c, error);
    }
  }
);
