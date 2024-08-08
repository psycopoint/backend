import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { patients } from "./patients";
import { relations, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { createInsertSchema } from "drizzle-zod";
import { DiagramSituation } from "@/types/patients";
import { z } from "zod";
import dayjs from "dayjs";

export const diagrams = pgTable("patients_diagrams", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  patientId: text("patient_id")
    .references(() => patients.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
  relevantHistory: text("relevant_history"), // Dados relevantes da história
  centralBeliefs: text("central_beliefs"), // Crenças Centrais
  ruleBeliefs: text("rule_beliefs"), // Crenças-Regra
  beliefMaintenance: text("belief_maintenance"), // Manutenção de Crenças ou Estratégias Compensatórias
  situations: jsonb("situations")
    .$type<DiagramSituation[] | null>()
    .default(sql`'[]'::jsonb`),
});

// ZOD
export const diagramSituationSchema = z.object({
  id: z
    .string()
    .default("")
    .transform(() => createId()),
  situationNumber: z.number().optional(),
  description: z.string(),
  automaticThought: z.string(),
  atMeaning: z.string(),
  emotion: z.string(),
  behavior: z.string(),
  therapyFocus: z.string(),
  createdAt: z
    .string()
    .default("")
    .transform(() => dayjs().format("YYYY-MM-DD HH:mm:ss.SSS")),
  updatedAt: z
    .string()
    .default("")
    .transform(() => dayjs().format("YYYY-MM-DD HH:mm:ss.SSS")),
});

export const insertDiagramsSchema = createInsertSchema(diagrams, {
  situations: z.array(diagramSituationSchema),
});

// DIAGRAM RELATIONS
export const diagramRelations = relations(diagrams, ({ one, many }) => ({
  patient: one(patients, {
    fields: [diagrams.patientId],
    references: [patients.id],
  }),
}));

export type InsertDiagram = typeof diagrams.$inferInsert;
export type SelectDiagram = typeof diagrams.$inferSelect;
