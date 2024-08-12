import { InsertPatient, SelectPatient, patients } from "@/db/schemas";
import { getAuth } from "@/utils/get-auth";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

/**
 * Retrieves all patients associated with a specific psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @returns {Promise<SelectPatient[]>} A promise that resolves to the list of patients or an error response.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const getAllPatientsService = async (
  c: Context,
  db: NeonHttpDatabase
): Promise<SelectPatient[]> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const data = await db
    .select()
    .from(patients)
    .where(eq(patients.psychologistId, user.id!));

  if (data.length <= 0) {
    throw new Error("No data");
  }

  return data as SelectPatient[];
};

/**
 * Retrieves a patient by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient to retrieve.
 * @returns {Promise<SelectPatient>} A promise that resolves to the patient data or null if not found.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const getPatientService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<SelectPatient> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if the patient exists
  const [existing] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  if (!existing) {
    throw new Error("Not found");
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  return patient as SelectPatient;
};

/**
 * Creates a new patient associated with a specific psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertPatient} values - The values to insert for the new patient.
 * @returns {Promise<SelectPatient>} A promise that resolves to the newly created patient.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const createPatientService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertPatient
): Promise<SelectPatient> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const patientData = {
    id: createId(),
    psychologistId: user.id,
    ...values,
  };

  const [newPatient] = await db
    .insert(patients)
    .values(patientData)
    .returning();

  return newPatient as SelectPatient;
};

/**
 * Deletes a patient by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient to delete.
 * @returns {Promise<SelectPatient>} A promise that resolves to the deleted patient data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const deletePatientService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<SelectPatient> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if the patient exists
  const [existing] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  if (!existing) {
    throw new Error("Not found");
  }

  const [deletedPatient] = await db
    .delete(patients)
    .where(
      and(eq(patients.id, patientId!), eq(patients.psychologistId, user.id!))
    )
    .returning();

  return deletedPatient as SelectPatient;
};

/**
 * Updates a patient's details by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient to update.
 * @param {InsertPatient} values - The values to update for the patient.
 * @returns {Promise<SelectPatient>} A promise that resolves to the updated patient data.
 * @throws {Error} Throws an error if the user is not authenticated or if the patient is not found.
 */
export const updatePatientService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  values: InsertPatient
): Promise<SelectPatient> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if the patient exists
  const [existing] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  if (!existing) {
    throw new Error("Not found");
  }

  // update patient inside db
  const [patient] = await db
    .update(patients)
    .set({ ...values, createdAt: existing.createdAt })
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    )
    .returning();

  return patient as SelectPatient;
};