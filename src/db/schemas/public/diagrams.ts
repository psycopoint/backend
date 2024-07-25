import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { patients } from "./patients";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { createInsertSchema } from "drizzle-zod";
import { DiagramSituation } from "@/types/patient-types";

export const diagrams = pgTable("diagrams", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  relevantHistory: text("relevant_history"), // Dados relevantes da história
  centralBeliefs: text("central_beliefs"), // Crenças Centrais
  ruleBeliefs: text("rule_beliefs"), // Crenças-Regra
  beliefMaintenance: text("belief_maintenance"), // Manutenção de Crenças ou Estratégias Compensatórias
  situations: jsonb("situations")
    .$type<DiagramSituation[] | null>()
    .default(sql`'[]'::jsonb`),
});

export const insertDiagramsSchema = createInsertSchema(diagrams);

// DIAGRAM RELATIONS
export const diagramRelations = relations(diagrams, ({ one, many }) => ({
  patient: one(patients, {
    fields: [diagrams.patientId],
    references: [patients.id],
  }),
}));

export type InsertDiagram = typeof diagrams.$inferInsert;
export type SelectDiagram = typeof diagrams.$inferSelect;
