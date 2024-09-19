import { InsertPatient, SelectPatient, patients } from "@/db/schemas";
import { EmergencyContact } from "@/types/patients";
import { init } from "@paralleldrive/cuid2";
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
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
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
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const createId = init({
    length: 10,
  });

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
  const [patient] = await db
    .update(patients)
    .set({ ...values, createdAt: existing.createdAt })
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    )
    .returning();

  return patient as SelectPatient;
};

/**
 * ===============================================================
 *              E M E R G E N C Y   C O N T A C T S
 * ===============================================================
 */
// GET EMERGENCY CONTACTS
export const getPatientEmergencyContactsService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<EmergencyContact[]> => {
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

  const contacts = existing.emergencyContacts;

  return contacts as EmergencyContact[];
};

// GET EMERGENCY CONTACT BY ID
export const getPatientEmergencyContactService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  contactId: string
): Promise<EmergencyContact> => {
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

  const contacts = existing.emergencyContacts as EmergencyContact[];
  const foundContact = contacts.find((contact) => contact.id === contactId);

  return foundContact as EmergencyContact;
};

// CREATE EMERGENCY CONTACT
export const createEmergencyContactService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: EmergencyContact,
  patientId: string
) => {
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

  const contacts = (existing.emergencyContacts as EmergencyContact[]) || [];

  // update inside db
  const updatedContacts = [...contacts, values];
  await db
    .update(patients)
    .set({
      emergencyContacts: updatedContacts,
    })
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  // get the last one and return it
  const newContact = updatedContacts[updatedContacts.length - 1];

  return newContact as EmergencyContact;
};

// DELETE EMERGENCY CONTACT BY ID
export const deletePatientEmergencyContactService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  contactId: string
): Promise<EmergencyContact[]> => {
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

  const contacts = existing.emergencyContacts as EmergencyContact[];
  const updatedContacts = contacts.filter(
    (contact) => contact.id !== contactId
  );
  await db.update(patients).set({
    emergencyContacts: updatedContacts,
  });

  return updatedContacts as EmergencyContact[];
};
