import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";
import { relations, sql } from "drizzle-orm";
import { patients } from "./patients";
import { createInsertSchema } from "drizzle-zod";

export const statusEnum = pgEnum("status", ["active", "inactive"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  psychologistId: text("psychologist_id")
    .notNull()
    .references(() => psychologists.userId, {
      onDelete: "set null",
    }),
  patientId: text("patient_id").references(() => patients.id, {
    onDelete: "set null",
  }),
  title: text("title"),
  data: jsonb("data")
    .$type<any>()
    .default(sql`'{}'::jsonb`),
  status: statusEnum("status").default("active"),
  complete: boolean("complete").default(false),
  priority: priorityEnum("priority").default("medium"),
  attachments: jsonb("attachments")
    .$type<{ fileName: string; url: string }[]>()
    .default(sql`'[]'::jsonb`),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
});

// RELATIONS
export const notesRelations = relations(notes, ({ one, many }) => ({
  psychologist: one(psychologists, {
    fields: [notes.id],
    references: [psychologists.userId],
  }),
}));

// TYPES
export const insertNoteSchema = createInsertSchema(notes);

export type InsertNote = typeof notes.$inferInsert;
export type SelectNote = typeof notes.$inferSelect;
