import { InsertEvent, SelectEvent, events } from "@db/schemas";
import { createId } from "@paralleldrive/cuid2";
import { PatientSession } from "@type/events";

import dayjs from "dayjs";
import { and, eq, sql } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

/**
 * Retrieves all Events for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @returns {Promise<SelectEvent[]>} A promise that resolves to an array of Events.
 * @throws {Error} Throws an error if the user is not authenticated or if no Events are found.
 */
export const getEventsService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectEvent[]> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  // verify if the event exists
  const [existing] = await db
    .select()
    .from(events)
    .where(eq(events.psychologistId, user.id!));

  if (!existing) {
    throw new Error("Not found");
  }

  const data = await db
    .select()
    .from(events)
    .where(eq(events.psychologistId, user.id));

  return data as SelectEvent[];
};

export const getEventsByPatientIdService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<SelectEvent[]> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  // verify if the event exists
  const [existing] = await db
    .select()
    .from(events)
    .where(eq(events.psychologistId, user.id!));

  if (!existing) {
    throw new Error("Not found");
  }

  const data = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.psychologistId, user.id),
        eq(sql`events.data->>'patientId'`, patientId)
      )
    );

  return data as SelectEvent[];
};

/**
 * Retrieves an Event by its ID for the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} eventId - The ID of the Event to retrieve.
 * @returns {Promise<SelectEvent>} A promise that resolves to the Event data.
 * @throws {Error} Throws an error if the user is not authenticated, or if the Event is not found.
 */
export const getEventService = async (
  c: Context,
  db: NeonHttpDatabase,
  eventId: string
): Promise<SelectEvent> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  // verify if the Event exists
  const [existing] = await db
    .select()
    .from(events)
    .where(eq(events.psychologistId, user.id));

  if (!existing) {
    throw new Error("Not found");
  }

  const [data] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.psychologistId, user.id)));

  return data as SelectEvent;
};

/**
 * Creates a new Event for the authenticated psychologist and patient.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertEvent} values - The values for the new Event.
 * @param {string} patientId - The ID of the patient associated with the Event.
 * @returns {Promise<SelectEvent>} A promise that resolves to the created Event data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const createEventService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertEvent,
  patientId?: string
): Promise<SelectEvent> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .insert(events)
    .values({
      ...values,
      id: createId(),
      psychologistId: user.id,
    })
    .returning();

  return data as SelectEvent;
};

/**
 * Updates an Event by its ID, ensuring the Event is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertEvent} values - The values to update for the Event.
 * @param {string} eventId - The ID of the Event to update.
 * @returns {Promise<SelectEvent>} A promise that resolves to the updated Event data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const updateEventService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: any,
  eventId: string
): Promise<SelectEvent> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  console.log(values);

  const [data] = await db
    .update(events)
    .set({
      ...values,
      updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
    })
    .where(eq(events.id, eventId))
    .returning();

  return data as SelectEvent;
};

/**
 * Deletes an Event by its ID, ensuring the Event is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} eventId - The ID of the Event to delete.
 * @returns {Promise<SelectEvent>} A promise that resolves to the deleted Event data.
 * @throws {Error} Throws an error if the user is not authenticated or if the Event is not found.
 */
export const deleteEventService = async (
  c: Context,
  db: NeonHttpDatabase,
  eventId: string
): Promise<SelectEvent> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .delete(events)
    .where(and(eq(events.psychologistId, user.id), eq(events.id, eventId)))
    .returning();

  return data as SelectEvent;
};
