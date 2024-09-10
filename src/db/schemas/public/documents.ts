import {
  pgTable,
  text,
  jsonb,
  timestamp,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { psychologists } from "./psychologists";
import { patients } from "./patients";

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  psychologistId: uuid("psychologist_id")
    .notNull()
    .references(() => psychologists.userId, { onDelete: "cascade" }),
  patientId: uuid("patient_id").references(() => patients.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
