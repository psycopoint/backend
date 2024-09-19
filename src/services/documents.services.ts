import { InsertPatient, SelectUser } from "@/db/schemas";
import {
  InsertDocument,
  SelectDocument,
  documents,
} from "@/db/schemas/public/documents";

import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { date } from "zod";
import { updateFileService, uploadFileService } from "./upload.services";

// GENERATE DOCUMENT
export const generateDocumentService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: any
) => {
  const data = values;

  console.log(values);
};

// GET ALL DOCUMENTS
export const getDocumentsService = async (
  c: Context,
  db: NeonHttpDatabase,
  patientId?: string
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  let data;

  if (patientId) {
    // get patient documents
    data = await db
      .select()
      .from(documents)
      .where(eq(documents.patientId, patientId));
  } else {
    // get all psychologist's documents
    data = await db
      .select()
      .from(documents)
      .where(eq(documents.psychologistId, user.id));
  }

  if (!data) {
    throw new Error("Not found");
  }

  return data;
};

// GET DOCUMENTS BY ID
export const getDocumentService = async (
  c: Context,
  db: NeonHttpDatabase,
  documentId: string
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .select()
    .from(documents)
    .where(
      and(eq(documents.psychologistId, user.id), eq(documents.id, documentId))
    );

  if (!data) {
    throw new Error("Not found");
  }

  return data;
};

// CREATE DOCUMENT
export const createDocumentService = async (
  c: Context,
  db: NeonHttpDatabase,
  values: InsertDocument
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db.insert(documents).values(values).returning();

  return data;
};

// DELETE DOCUMENT
export const deleteDocumentService = async (
  c: Context,
  db: NeonHttpDatabase,
  documentId: string
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .delete(documents)
    .where(
      and(eq(documents.psychologistId, user.id), eq(documents.id, documentId))
    )
    .returning();

  if (!data) {
    throw new Error("Not found");
  }

  return data;
};

// UPDATE DOCUMENT
export const updateDocumentService = async (
  c: Context,
  db: NeonHttpDatabase,
  documentId: string,
  values: InsertDocument
) => {
  const user = c.get("user");
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .update(documents)
    .set(values)
    .where(
      and(eq(documents.psychologistId, user.id), eq(documents.id, documentId))
    )
    .returning();

  if (!data) {
    throw new Error("Not found");
  }

  return data;
};
