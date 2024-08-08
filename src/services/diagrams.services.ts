import { diagrams, InsertDiagram, patients, SelectDiagram } from "@/db/schemas";
import { DiagramSituation } from "@/types/patients";
import { getAuth } from "@/utils/get-auth";
import { createId } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";

/**
 * Retrieves a patient's Diagram by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient whose Diagram is to be retrieved.
 * @returns {Promise<SelectDiagram>} A promise that resolves to the retrieved Diagram data.
 * @throws {Error} Throws an error if the user is not authenticated or if the patient is not found.
 */
export const getPatientDiagramService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<SelectDiagram> => {
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

  const [anamnese] = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.patientId, patientId));

  return anamnese as SelectDiagram;
};

/**
 * Creates a new Diagram for a specific patient, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {InsertDiagram} values - The values to insert for the new Diagram.
 * @param {string} patientId - The ID of the patient for whom the Diagram is being created.
 * @returns {Promise<SelectDiagram>} A promise that resolves to the newly created Diagram data.
 * @throws {Error} Throws an error if the user is not authenticated.
 */
export const createDiagramService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertDiagram,
  patientId: string
): Promise<SelectDiagram> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const anamneseData = {
    ...values,
    id: createId(),
    patientId: patientId,
    psychologistId: user.id,
  };

  const [data] = await db.insert(diagrams).values(anamneseData).returning();

  return data as SelectDiagram;
};

/**
 * Deletes a patient's Diagram by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient whose Diagram is to be deleted.
 * @returns {Promise<SelectDiagram>} A promise that resolves to the deleted Diagram data.
 * @throws {Error} Throws an error if the user is not authenticated or if the patient is not found.
 */
export const deleteDiagramService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string
): Promise<SelectDiagram> => {
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

  const [deleted] = await db
    .delete(diagrams)
    .where(
      and(
        eq(diagrams.patientId, patientId!),
        eq(patients.psychologistId, user.id!)
      )
    )
    .returning();

  return deleted as SelectDiagram;
};

/**
 * Updates a patient's Diagram by their ID, ensuring the patient is associated with the authenticated psychologist.
 *
 * @param {Context} c - The context object containing request and response details.
 * @param {NeonHttpDatabase} db - The database instance for executing queries.
 * @param {string} patientId - The ID of the patient whose Diagram is to be updated.
 * @param {InsertDiagram} values - The values to update for the Diagram.
 * @returns {Promise<SelectDiagram>} A promise that resolves to the updated Diagram data.
 * @throws {Error} Throws an error if the user is not authenticated or if the patient is not found.
 */
export const updateDiagramService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  values: InsertDiagram
): Promise<SelectDiagram> => {
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

  // Atualiza o diagrama no banco de dados
  const [anamnese] = await db
    .update(diagrams)
    .set(values)
    .where(eq(diagrams.patientId, patientId))
    .returning();

  return anamnese as SelectDiagram;
};

/**
 * ===============================================================
 *                D I A G R A M   S I T U A T I O N S
 * ===============================================================
 */

// GET SITUATION BY ID
export const getSituationService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  situationId: string
): Promise<DiagramSituation> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if patient exists and is associated to the authenticated psychologist
  const [existingPatient] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  if (!existingPatient) {
    throw new Error("Not found");
  }

  // search the diagram associated to the patient
  const [existingDiagram] = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.patientId, patientId));

  if (!existingDiagram) {
    throw new Error("Not found");
  }

  const existingSituations = existingDiagram.situations || [];

  // finds the situation
  const foundSituation = existingSituations.find(
    (situation) => situation.id === situationId
  );

  return foundSituation as DiagramSituation;
};

// CREATE SITUATION
export const createSituationService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  values: Partial<DiagramSituation>
): Promise<DiagramSituation> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Verify if patient exists and is associated with the authenticated psychologist
  const [existingPatient] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  if (!existingPatient) {
    throw new Error("Not found");
  }

  // Search the diagram associated with the patient
  const [existingDiagram] = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.patientId, patientId));

  if (!existingDiagram) {
    throw new Error("Not found");
  }

  const existingSituations = existingDiagram.situations || [];

  // Create a new situation
  const newSituation: DiagramSituation = {
    ...values,
    id: createId(),
    situationNumber: existingSituations.length + 1,
    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
  };

  // Add the new situation to the existing situations
  const updatedSituations = [...existingSituations, newSituation];

  // Update the diagram with the new situation
  await db
    .update(diagrams)
    .set({ situations: updatedSituations })
    .where(eq(diagrams.patientId, patientId));

  return newSituation;
};

// DELETE SITUATION
export const deleteSituationService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  situationId: string
): Promise<DiagramSituation[]> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if patient exists and is associated to the authenticated psychologist
  const [existingPatient] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  if (!existingPatient) {
    throw new Error("Not found");
  }

  // search the diagram associated to the patient
  const [existingDiagram] = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.patientId, patientId));

  if (!existingDiagram) {
    throw new Error("Not found");
  }

  const existingSituations = existingDiagram.situations || [];

  // finds the situation
  const newSituationData = existingSituations.filter((situation) => {
    // const delete situation
    return situation.id !== situationId;
  });

  // update situations with the new values
  await updateDiagramService(c, db, patientId, {
    patientId,
    situations: newSituationData,
  });

  return newSituationData as DiagramSituation[];
};

// UPDATE SITUATIONS
export const updateSituationService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId: string,
  situationId: string,
  updatedValues: Partial<DiagramSituation>
): Promise<DiagramSituation> => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // verify if patient exists and is associated to the authenticated psychologist
  const [existingPatient] = await db
    .select()
    .from(patients)
    .where(
      and(eq(patients.id, patientId), eq(patients.psychologistId, user.id!))
    );

  if (!existingPatient) {
    throw new Error("Not found");
  }

  // search the diagram associated to the patient
  const [existingDiagram] = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.patientId, existingPatient.id));

  if (!existingDiagram) {
    throw new Error("Not found");
  }

  const existingSituations = existingDiagram.situations || [];

  // finds the situation
  const updatedSituations = existingSituations.map((situation) => {
    if (situation.id === situationId) {
      return {
        ...situation,
        ...updatedValues,
        id: situation.id,
        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
      };
    }
    return situation;
  });

  // Update the diagram with the updated situations
  const updatedDiagram = await updateDiagramService(c, db, patientId, {
    patientId,
    situations: updatedSituations,
  });

  const updatedSituation = updatedDiagram.situations?.find(
    (situation) => situation.id === situationId
  );

  if (!updatedSituation) {
    throw new Error("Not found");
  }

  return updatedSituation as DiagramSituation;
};
