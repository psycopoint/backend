import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { psychologists } from "./psychologists";
import { sql } from "drizzle-orm";

export const statusEnum = pgEnum("status", ["active", "inactive"]);

export const notes = pgTable("notes", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: text("content"),
  createdAt: timestamp("created_at", { mode: "string", precision: 3 })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "string",
    precision: 3,
  }).$onUpdate(() => sql`CURRENT_TIMESTAMP(3)`),
  status: statusEnum("status").default("active"),
  patientId: text("patient_id"),
  psychologistsId: text("psychologists_id")
    .notNull()
    .references(() => psychologists.userId),
});

// RELATIONS

export type InsertNotes = typeof notes.$inferInsert;
export type SelectNotes = typeof notes.$inferSelect;
