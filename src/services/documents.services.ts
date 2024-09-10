import { SelectUser } from "@/db/schemas";
import {
  InsertDocument,
  SelectDocument,
  documents,
} from "@/db/schemas/public/documents";
import { getAuth } from "@/utils/get-auth";
import { and, eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Context } from "hono";
import { date } from "zod";
import { updateFileService, uploadFileService } from "./upload.services";

// GET ALL DOCUMENTS
export const getDocumentsService = async (c: Context, db: NeonHttpDatabase) => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  const data = await db
    .select()
    .from(documents)
    .where(eq(documents.psychologistId, user.id));

  if (!data) {
    throw new Error("Not found");
  }

  return data;
};

// GET DOCUMENT BY ID
export const getDocumentService = async (
  c: Context,
  db: NeonHttpDatabase,
  documentId: string
) => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
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
  form: { file: File | null; values: InsertDocument; path: string | undefined }
) => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  let fileUrl;
  if (form.file && form.path) {
    fileUrl = await uploadFileService(c, user, form.file, form.path);
  }

  const [data] = await db
    .insert(documents)
    .values({
      ...form.values,
      psychologistId: user.id,
      data: {
        ...(form.values.data as Record<string, any>),
        url: fileUrl,
      },
    })
    .returning();

  return data;
};

// DELETE DOCUMENT
export const deleteDocumentService = async (
  c: Context,
  db: NeonHttpDatabase,
  documentId: string
) => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
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
  form: {
    file: File | null;
    values: InsertDocument;
    oldPath: string | undefined;
    newPath: string | undefined;
  }
) => {
  const user = await getAuth(c, db);

  if (!user) {
    throw new Error("Not authenticated");
  }

  // generate new file
  let fileUrl;
  if (form.file && form.newPath && form.oldPath) {
    fileUrl = await updateFileService(
      c,
      user,
      form.oldPath,
      form.file,
      form.newPath
    );
  }

  const [data] = await db
    .update(documents)
    .set({
      ...form.values,
      psychologistId: user.id,
      data: {
        ...(form.values.data as Record<string, any>),
        url: fileUrl,
      },
    })
    .where(
      and(eq(documents.psychologistId, user.id), eq(documents.id, documentId))
    )
    .returning();

  if (!data) {
    throw new Error("Not found");
  }

  return data;
};
