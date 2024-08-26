import { InsertPayment, SelectPayment, payments } from "@/db/schemas";
import { getAuth } from "@/utils/get-auth";

import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

import { Context } from "hono";

/**
 * Retrieves all Payments for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @returns {Promise<SelectPayment[]>} A promise that resolves to an array of Payments.
 * @throws {Error} Throws an error if the user is not authenticated or if no Payments are found.
 */
export const getPaymentsService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectPayment[]> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if the Payment exists
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id!));

  if (!existing) {
    throw new Error("Not found");
  }

  const data = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id));

  return data as SelectPayment[];
};

/**
 * Retrieves an Payment by its ID for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} PaymentId - The ID of the Payment to retrieve.
 * @returns {Promise<SelectPayment>} A promise that resolves to the Payment data.
 * @throws {Error} Throws an error if the user is not authenticated, or if the Payment is not found.
 */
export const getPaymentService = async (
  c: Context,
  db: NeonHttpDatabase,
  paymentId: string
): Promise<SelectPayment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if the payments for the user exists
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id));

  if (!existing) {
    throw new Error("Not found");
  }

  const [data] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.id, paymentId), eq(payments.userId, user.id)));

  return data as SelectPayment;
};

/**
 * Creates a new Payment for the authenticated psychologist and patient.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertPayment} values - The values for the new Payment.
 * @param {string} patientId - The ID of the patient associated with the Payment.
 * @returns {Promise<SelectPayment>} A promise that resolves to the created Payment data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const createPaymentService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertPayment
): Promise<SelectPayment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [data] = await db
    .insert(payments)
    .values({
      ...values,
      userId: user.id,
    })
    .returning();

  return data as SelectPayment;
};

/**
 * Updates an Payment by its ID, ensuring the Payment is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertPayment} values - The values to update for the Payment.
 * @param {string} paymentId - The ID of the Payment to update.
 * @returns {Promise<SelectPayment>} A promise that resolves to the updated Payment data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const updatePaymentService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: any,
  paymentId: string
): Promise<SelectPayment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  console.log(values);

  const [data] = await db
    .update(payments)
    .set({
      ...values,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
    })
    .where(eq(payments.id, paymentId))
    .returning();

  return data as SelectPayment;
};

/**
 * Deletes an Payment by its ID, ensuring the Payment is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} PaymentId - The ID of the Payment to delete.
 * @returns {Promise<SelectPayment>} A promise that resolves to the deleted Payment data.
 * @throws {Error} Throws an error if the user is not authenticated or if the Payment is not found.
 */
export const deletePaymentService = async (
  c: Context,
  db: NeonHttpDatabase,
  paymentId: string
): Promise<SelectPayment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [data] = await db
    .delete(payments)
    .where(and(eq(payments.userId, user.id), eq(payments.id, paymentId)))
    .returning();

  return data as SelectPayment;
};
