import { z } from "zod";

export type SelectDocumentType =
  | "pdf"
  | "docx"
  | "image"
  | "diagram"
  | "receipt"
  | "document"
  | "other";
