import {
  InsertAppointment,
  SelectAppointment,
  appointments,
} from "@/db/schemas";
import { getAuth } from "@/utils/get-auth";
import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import { and, eq, or } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

/**
 * Retrieves all appointments for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @returns {Promise<SelectAppointment[]>} A promise that resolves to an array of appointments.
 * @throws {Error} Throws an error if the user is not authenticated or if no appointments are found.
 */
export const getAppointmentsService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectAppointment[]> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if the appointment exists
  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.psychologistId, user.id!));

  if (!existing) {
    throw new Error("Not found");
  }

  const data = await db
    .select()
    .from(appointments)
    .where(eq(appointments.psychologistId, user.id!));

  return data as SelectAppointment[];
};

/**
 * Retrieves an appointment by its ID for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} appointmentId - The ID of the appointment to retrieve.
 * @returns {Promise<SelectAppointment>} A promise that resolves to the appointment data.
 * @throws {Error} Throws an error if the user is not authenticated, or if the appointment is not found.
 */
export const getAppointmentService = async (
  c: Context,
  db: NeonHttpDatabase,
  appointmentId: string
): Promise<SelectAppointment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if the appointment exists
  const [existing] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.psychologistId, user.id));

  if (!existing) {
    throw new Error("Not found");
  }

  const [data] = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.eventId, appointmentId),
        eq(appointments.psychologistId, user.id)
      )
    );

  return data;
};

/**
 * Creates a new appointment for the authenticated psychologist and patient.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertAppointment} values - The values for the new appointment.
 * @param {string} patientId - The ID of the patient associated with the appointment.
 * @returns {Promise<SelectAppointment>} A promise that resolves to the created appointment data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const createAppointmentService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertAppointment,
  patientId: string
): Promise<SelectAppointment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  console.log(values);

  const [data] = await db
    .insert(appointments)
    .values({
      ...values,
      eventId: createId(),
      psychologistId: user.id,
      patientId,
    })
    .returning();

  return data;
};

/**
 * Updates an appointment by its ID, ensuring the appointment is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertAppointment} values - The values to update for the appointment.
 * @param {string} appointmentId - The ID of the appointment to update.
 * @returns {Promise<SelectAppointment>} A promise that resolves to the updated appointment data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const updateAppointmentService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertAppointment,
  appointmentId: string
): Promise<SelectAppointment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [data] = await db
    .update(appointments)
    .set({
      ...values,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
    })
    .returning();

  return data;
};

/**
 * Deletes an appointment by its ID, ensuring the appointment is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} appointmentId - The ID of the appointment to delete.
 * @returns {Promise<SelectAppointment>} A promise that resolves to the deleted appointment data.
 * @throws {Error} Throws an error if the user is not authenticated or if the appointment is not found.
 */
export const deleteAppointmentService = async (
  c: Context,
  db: NeonHttpDatabase,
  appointmentId: string
): Promise<SelectAppointment> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [data] = await db
    .delete(appointments)
    .where(
      or(
        and(
          eq(appointments.psychologistId, user.id),
          eq(appointments.eventId, appointmentId)
        ),
        eq(appointments.id, appointmentId)
      )
    )
    .returning();

  return data;
};
