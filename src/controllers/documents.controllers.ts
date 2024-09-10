import {
  InsertDocument,
  insertDocumentSchema,
} from "@/db/schemas/public/documents";
import {
  createDocumentService,
  deleteDocumentService,
  getDocumentService,
  getDocumentsService,
  updateDocumentService,
} from "@/services/documents.services";
import { getAuth } from "@/utils/get-auth";
import { handleError } from "@/utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { neon } from "@neondatabase/serverless";
import { init } from "@paralleldrive/cuid2";
import dayjs from "dayjs";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

const factory = createFactory();

// GET ALL DOCUMENTS
export const getDocuments = factory.createHandlers(async (c) => {
  // connect to db
  const sql = neon(c.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const data = await getDocumentsService(c, db);

    return c.json({ message: "success", data });
  } catch (error) {
    return handleError(c, error);
  }
});

// GET DOCUMENT BY ID
export const getDocument = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { documentId } = c.req.valid("param");

    try {
      const data = await getDocumentService(c, db, documentId);

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// CREATE DOCUMENT
export const createDocument = factory.createHandlers(
  zValidator(
    "form",
    z.object({
      file: z.instanceof(File).optional(),
      path: z.string().optional(),
      values: z
        .string()
        .refine(
          (val) => {
            try {
              const parsed = JSON.parse(val);
              return typeof parsed === "object" && parsed !== null;
            } catch {
              return false;
            }
          },
          {
            message: "Invalid JSON format",
          }
        )
        .transform((val) => JSON.parse(val)),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { file, values, path } = c.req.valid("form");

    const createId = init({
      length: 10,
    });

    try {
      const data = await createDocumentService(c, db, {
        file: file ? file : null,
        values: { ...values, id: createId() },
        path,
      });

      return c.json({ message: "susccess", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// DELETE DOCUMENT
export const deleteDocument = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentId: z.string(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { documentId } = c.req.valid("param");

    try {
      const data = await deleteDocumentService(c, db, documentId);

      return c.json({ message: "success" });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// UPDATE DOCUMENT
export const updateDocument = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentId: z.string(),
    })
  ),
  zValidator(
    "form",
    z.object({
      file: z.instanceof(File).optional(),
      newPath: z.string().optional(),
      oldPath: z.string().optional(),
      values: z
        .string()
        .refine(
          (val) => {
            try {
              const parsed = JSON.parse(val);
              return typeof parsed === "object" && parsed !== null;
            } catch {
              return false;
            }
          },
          {
            message: "Invalid JSON format",
          }
        )
        .transform((val) => JSON.parse(val)),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { documentId } = c.req.valid("param");

    const { file, values, newPath, oldPath } = c.req.valid("form");

    const createId = init({
      length: 10,
    });

    try {
      const data = await updateDocumentService(c, db, documentId, {
        file: file ? file : null,
        values: { ...values, id: createId() },
        newPath,
        oldPath,
      });

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);
