import { Hono } from "hono";
import { Env } from "@/types/bindings";
import { JwtVariables } from "hono/jwt";
import { Session } from "hono-sessions";
import {
  createDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  updateDocument,
} from "@/controllers/documents.controllers";

const app = new Hono<{
  Bindings: Env;
  Variables: JwtVariables & {
    session: Session;
  };
}>();

// get all documents
app.get("/", ...getDocuments);

// get document by id
app.get("/:documentId", ...getDocument);

// create document
app.post("/", ...createDocument);

// delete document
app.delete("/:documentId", ...deleteDocument);

// update document
app.patch("/:documentId", ...updateDocument);

export default app;
