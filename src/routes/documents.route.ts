import { Hono } from "hono";

import { JwtVariables } from "hono/jwt";

import {
  createDocument,
  deleteDocument,
  generatePdf,
  getDocument,
  getDocuments,
  updateDocument,
} from "@/controllers/documents.controllers";

const app = new Hono();

// get all documents
app.get("/:patientId?", ...getDocuments);

// // get all documents by patient id
// app.get("/:patientId", ...getDocuments);

// get document by id
app.get("/:documentId", ...getDocument);

// create document
app.post("/", ...createDocument);

// generate document
app.post("/generate/:documentType", ...generatePdf);

// delete document
app.delete("/:documentId", ...deleteDocument);

// update document
app.patch("/:documentId", ...updateDocument);

export default app;
