import { insertDocumentSchema } from "@db/schemas/public/documents";
import {
  createDocumentService,
  deleteDocumentService,
  getDocumentsService,
  updateDocumentService,
} from "@src/documents/documents.services";
import { handleError } from "@utils/handle-error";
import { zValidator } from "@hono/zod-validator";
import { init } from "@paralleldrive/cuid2";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createFactory } from "hono/factory";
import { z } from "zod";

import {
  createCertificatePdf,
  createDocumentPdf,
  createHoursDeclarationPdf,
  createReceiptPdf,
} from "@utils/documents";
import { getUserDataService } from "@src/users/users.services";

const factory = createFactory();

// GENERATE DOCUMENT
export const generatePdf = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      documentType: z.enum([
        "diagram",
        "receipt",
        "document",
        "certificate",
        "declaration",
        "other",
      ]),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = await getUserDataService(c, db);

    const { documentType } = c.req.valid("param");
    const values = await c.req.json();

    let pdf;

    switch (documentType) {
      case "document":
        pdf = await createDocumentPdf({
          patient: values.patient,
          document: values.document,
        });

      case "receipt":
        pdf = await createReceiptPdf({
          patient: values.patient,
          document: values.document,
          user,
        });
        break;

      case "certificate":
        pdf = await createCertificatePdf({
          patient: values.patient,
          document: values.document,
          user,
        });
        break;

      case "declaration":
        pdf = await createHoursDeclarationPdf({
          patient: values.patient,
          document: values.document,
          user,
        });
        break;
    }

    // TODO: verify this error
    return c.body(pdf as any, 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="document.pdf"',
    });
  }
);

// GET ALL DOCUMENTS BY PATIENT ID
export const getDocuments = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      patientId: z.string().optional(),
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { patientId } = c.req.valid("param");

    try {
      const data = await getDocumentsService(c, db, patientId);

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

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
      const data = await getDocumentsService(c, db, documentId);

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);

// CREATE DOCUMENT
export const createDocument = factory.createHandlers(
  zValidator(
    "json",
    insertDocumentSchema.pick({
      data: true,
      description: true,
      patientId: true,
      title: true,
      documentType: true,
      fileType: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const user = c.get("user");
    if (!user) {
      throw new Error("Unauthorized");
    }

    const values = c.req.valid("json");

    const createId = init({
      length: 10,
    });

    try {
      const data = await createDocumentService(c, db, {
        ...values,
        id: createId(),
        psychologistId: user.id,
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
    "json",
    insertDocumentSchema.pick({
      data: true,
      description: true,
      patientId: true,
      psychologistId: true,
      title: true,
      documentType: true,
      fileType: true,
    })
  ),
  async (c) => {
    // connect to db
    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    const { documentId } = c.req.valid("param");
    const values = c.req.valid("json");

    const createId = init({
      length: 10,
    });

    try {
      const data = await updateDocumentService(c, db, documentId, {
        ...values,
        id: documentId,
      });

      return c.json({ message: "success", data });
    } catch (error) {
      return handleError(c, error);
    }
  }
);
