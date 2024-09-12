import { relations, sql } from "drizzle-orm";
import { psychologists } from "./psychologists";
import { patients } from "./patients";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const documentTypeEnum = pgEnum("type", [
  "diagram",
  "receipt",
  "document",
  "certificate",
  "declaration",
  "other",
]);

export const fileTypeEnum = pgEnum("file_type", ["pdf", "docx", "image"]);

export const documents = pgTable("documents", {
  id: text("id").primaryKey().notNull(),
  psychologistId: text("psychologist_id")
    .notNull()
    .references(() => psychologists.userId, { onDelete: "cascade" }),
  patientId: text("patient_id").references(() => patients.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  description: text("description"),
  documentType: documentTypeEnum("document_type"),
  fileType: fileTypeEnum("file_type").default("pdf"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
});

// relations
export const documentRelations = relations(documents, ({ one }) => ({
  psychologist: one(psychologists, {
    fields: [documents.psychologistId],
    references: [psychologists.userId],
  }),

  patient: one(patients, {
    fields: [documents.patientId],
    references: [patients.id],
  }),
}));

export type SelectDocumentType = typeof documents.$inferSelect;

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;

// ZOD
export const insertDocumentSchema = createInsertSchema(documents);
