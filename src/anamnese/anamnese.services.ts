import {
  anamnesis,
  InsertAnamnesis,
  patients,
  SelectAnamnesis,
} from "@db/schemas";
import { init } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

/**
 * Retrieves a patient's anamnesis by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient whose anamnesis is to be retrieved.
 * @returns {Promise<SelectAnamnesis>} A promise that resolves to the retrieved anamnesis data.
 * @throws {Error} Throws an error if the user is not authenticated or if the patient is not found.
 */
export const getPatientAnamnesisService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<SelectAnamnesis> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
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

  const [anamnese] = await db
    .select()
    .from(anamnesis)
    .where(
      and(
        eq(anamnesis.patientId, patientId),
        eq(anamnesis.psychologistId, user.id!)
      )
    );

  return anamnese as SelectAnamnesis;
};

/**
 * Creates a new anamnesis for a specific patient, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertAnamnesis} values - The values to insert for the new anamnesis.
 * @param {string} patientId - The ID of the patient for whom the anamnesis is being created.
 * @returns {Promise<SelectAnamnesis>} A promise that resolves to the newly created anamnesis data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const createAnamnesisService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertAnamnesis,
  patientId: string
): Promise<SelectAnamnesis> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const createId = init({
    length: 10,
  });

  const anamneseData = {
    ...values,
    id: createId(),
    patientId: patientId,
    psychologistId: user.id,
  };

  const [data] = await db.insert(anamnesis).values(anamneseData).returning();

  return data as SelectAnamnesis;
};

/**
 * Deletes a patient's anamnesis by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient whose anamnesis is to be deleted.
 * @returns {Promise<SelectAnamnesis>} A promise that resolves to the deleted anamnesis data.
 * @throws {Error} Throws an error if the user is not authenticated or if the patient is not found.
 */
export const deleteAnamnesisService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<SelectAnamnesis> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
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

  const [deleted] = await db
    .delete(anamnesis)
    .where(
      and(
        eq(anamnesis.patientId, patientId!),
        eq(patients.psychologistId, user.id!)
      )
    )
    .returning();

  return deleted as SelectAnamnesis;
};

/**
 * Updates a patient's anamnesis by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient whose anamnesis is to be updated.
 * @param {InsertAnamnesis} values - The values to update for the anamnesis.
 * @returns {Promise<SelectAnamnesis>} A promise that resolves to the updated anamnesis data.
 * @throws {Error} Throws an error if the user is not authenticated or if the patient is not found.
 */
export const updateAnamnesisService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  values: InsertAnamnesis
): Promise<SelectAnamnesis> => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
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
  const [anamnese] = await db
    .update(anamnesis)
    .set(values)
    .where(
      and(
        eq(anamnesis.patientId, patientId),
        eq(anamnesis.psychologistId, user.id!)
      )
    )
    .returning();

  return anamnese as SelectAnamnesis;
};
