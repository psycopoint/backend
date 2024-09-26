import {
  InsertTransaction,
  SelectTransaction,
  transactions,
} from "../../db/schemas";

import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

import { Context } from "hono";

/**
 * Retrieves all Transactions for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @returns {Promise<SelectTransaction[]>} A promise that resolves to an array of Transactions.
 * @throws {Error} Throws an error if the user is not authenticated or if no Transactions are found.
 */
export const getTransactionsService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectTransaction[]> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  // verify if the Transaction exists
  const [existing] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id!));

  if (!existing) {
    throw new Error("Not found");
  }

  const data = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  return data as SelectTransaction[];
};

/**
 * Retrieves a Transaction by its ID for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} PaymentId - The ID of the Transaction to retrieve.
 * @returns {Promise<SelectTransaction>} A promise that resolves to the Transaction data.
 * @throws {Error} Throws an error if the user is not authenticated, or if the Transaction is not found.
 */
export const getTransactionService = async (
  c: Context,
  db: NeonHttpDatabase,
  paymentId: string
): Promise<SelectTransaction> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  // verify if the Transactions for the user exists
  const [existing] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id));

  if (!existing) {
    throw new Error("Not found");
  }

  const [data] = await db
    .select()
    .from(transactions)
    .where(
      and(eq(transactions.id, paymentId), eq(transactions.userId, user.id))
    );

  return data as SelectTransaction;
};

/**
 * Creates a new Transaction for the authenticated psychologist and patient.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertTransaction} values - The values for the new Payment.
 * @param {string} patientId - The ID of the patient associated with the Payment.
 * @returns {Promise<SelectTransaction>} A promise that resolves to the created Transaction data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const createTransactionService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertTransaction
): Promise<SelectTransaction> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .insert(transactions)
    .values({
      ...values,
      userId: user.id,
    })
    .returning();

  return data as SelectTransaction;
};

/**
 * Updates a Transaction by its ID, ensuring the Transaction is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertTransaction} values - The values to update for the Payment.
 * @param {string} paymentId - The ID of the Transaction to update.
 * @returns {Promise<SelectTransaction>} A promise that resolves to the updated Transaction data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const updateTransactionService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: any,
  paymentId: string
): Promise<SelectTransaction> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .update(transactions)
    .set({
      ...values,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
    })
    .where(eq(transactions.id, paymentId))
    .returning();

  return data as SelectTransaction;
};

/**
 * Deletes a Transaction by its ID, ensuring the Transaction is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} PaymentId - The ID of the Transaction to delete.
 * @returns {Promise<SelectTransaction>} A promise that resolves to the deleted Transaction data.
 * @throws {Error} Throws an error if the user is not authenticated or if the Transaction is not found.
 */
export const deleteTransactionService = async (
  c: Context,
  db: NeonHttpDatabase,
  paymentId: string
): Promise<SelectTransaction> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .delete(transactions)
    .where(
      and(eq(transactions.userId, user.id), eq(transactions.id, paymentId))
    )
    .returning();

  return data as SelectTransaction;
};
